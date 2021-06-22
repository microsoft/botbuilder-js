// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as t from 'runtypes';
import express from 'express';
import path from 'path';
import type { Server } from 'http';
import type { ActivityHandlerBase, BotFrameworkAdapter, ChannelServiceRoutes } from 'botbuilder';
import { Configuration, getRuntimeServices } from 'botbuilder-dialogs-adaptive-runtime';
import type { ServiceCollection } from 'botbuilder-dialogs-adaptive-runtime-core';

// Explicitly fails checks for `""`
const NonEmptyString = t.String.withConstraint((str) => str.length > 0 || 'must be non-empty string');

const TypedOptions = t.Record({
    /**
     * Path that the server will listen to for [Activities](xref:botframework-schema.Activity)
     */
    messagingEndpointPath: NonEmptyString,

    /**
     * Path that the server will listen to for skills requests
     */
    skillsEndpointPrefix: NonEmptyString,

    /**
     * Port that server should listen on
     */
    port: t.Union(NonEmptyString, t.Number),

    /**
     * Log errors to stderr
     */
    logErrors: t.Boolean,

    /**
     * Path inside applicationRoot that should be served as static files
     */
    staticDirectory: NonEmptyString,
});

/**
 * Options for runtime Express adapter
 */
export type Options = t.Static<typeof TypedOptions>;

const defaultOptions: Options = {
    logErrors: true,
    messagingEndpointPath: '/api/messages',
    skillsEndpointPrefix: '/api/skills',
    port: 3978,
    staticDirectory: 'wwwroot',
};

/**
 * Start a bot using the runtime Express integration.
 *
 * @param applicationRoot application root directory
 * @param settingsDirectory settings directory
 * @param options options bag
 */
export async function start(
    applicationRoot: string,
    settingsDirectory: string,
    options: Partial<Options> = {}
): Promise<void> {
    const [services, configuration] = await getRuntimeServices(applicationRoot, settingsDirectory);
    const [, listen] = await makeApp(services, configuration, applicationRoot, options);

    listen();
}

// Content type overrides for specific file extensions
const extensionContentTypes: Record<string, string> = {
    '.lu': 'vnd.application/lu',
    '.qna': 'vnd.application/qna',
};

/**
 * Create an Express App using the runtime Express integration.
 *
 * @param services runtime service collection
 * @param configuration runtime configuration
 * @param applicationRoot application root directory
 * @param options options bag for configuring Express Application
 * @param app optional predefined express app, useful to register middleware
 * @returns the Express Application and a function to start the App & handle "upgrade" requests for Streaming
 */
export async function makeApp(
    services: ServiceCollection,
    configuration: Configuration,
    applicationRoot: string,
    options: Partial<Options> = {},
    app = express()
): Promise<[app: express.Application, listen: (callback?: () => void) => Server]> {
    const configOverrides: Partial<Options> = {};

    const port = ['port', 'PORT'].map((key) => configuration.string([key])).find((port) => port !== undefined);
    if (port !== undefined) {
        configOverrides.port = port;
    }

    const resolvedOptions = TypedOptions.check(Object.assign({}, defaultOptions, configOverrides, options));

    const errorHandler = (err: Error | string, res?: express.Response): void => {
        if (options.logErrors) {
            console.error(err);
        }

        if (res && !res.headersSent) {
            res.status(500).json({ message: 'Internal server error' });
        }
    };

    const { adapter, bot, channelServiceRoutes, customAdapters } = services.mustMakeInstances<{
        adapter: BotFrameworkAdapter;
        bot: ActivityHandlerBase;
        channelServiceRoutes: ChannelServiceRoutes;
        customAdapters: Map<string, BotFrameworkAdapter>;
    }>('adapter', 'bot', 'channelServiceRoutes', 'customAdapters');

    app.use(
        express.static(path.join(applicationRoot, resolvedOptions.staticDirectory), {
            setHeaders: (res, filePath) => {
                const contentType = extensionContentTypes[path.extname(filePath)];
                if (contentType) {
                    res.setHeader('Content-Type', contentType);
                }
            },
        })
    );

    app.post(resolvedOptions.messagingEndpointPath, async (req, res) => {
        try {
            await adapter.processActivity(req, res, async (turnContext) => {
                await bot.run(turnContext);
            });
        } catch (err) {
            return errorHandler(err, res);
        }
    });

    channelServiceRoutes.register(app, resolvedOptions.skillsEndpointPrefix);

    const adapters =
        configuration.type(
            ['runtimeSettings', 'adapters'],
            t.Array(
                t.Record({
                    name: t.String,
                    enabled: t.Boolean.optional(),
                    route: t.String,
                })
            )
        ) ?? [];

    adapters
        .filter((settings) => settings.enabled)
        .forEach((settings) => {
            const adapter = customAdapters.get(settings.name);
            if (adapter) {
                app.post(`/api/${settings.route}`, async (req, res) => {
                    try {
                        await adapter.processActivity(req, res, async (turnContext) => {
                            await bot.run(turnContext);
                        });
                    } catch (err) {
                        return errorHandler(err, res);
                    }
                });
            } else {
                console.warn(`Custom Adapter for \`${settings.name}\` not registered.`);
            }
        });

    return [
        app,
        (callback) => {
            // The 'upgrade' event handler for processing WebSocket requests needs to be registered on the Node.js
            // http.Server, not the Express.Application. In Express the underlying http.Server is made available
            // after the app starts listening for requests.
            const server = app.listen(
                resolvedOptions.port,
                callback ?? (() => console.log(`server listening on port ${resolvedOptions.port}`))
            );

            server.on('upgrade', async (req, socket, head) => {
                const adapter = services.mustMakeInstance<BotFrameworkAdapter>('adapter');

                try {
                    await adapter.useWebSocket(req, socket, head, async (context) => {
                        await bot.run(context);
                    });
                } catch (err) {
                    return errorHandler(err);
                }
            });

            return server;
        },
    ];
}
