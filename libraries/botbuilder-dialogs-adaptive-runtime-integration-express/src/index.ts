// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as z from 'zod';
import express, { Application } from 'express';
import path from 'path';
import type { ActivityHandlerBase, BotFrameworkHttpAdapter, ChannelServiceRoutes } from 'botbuilder';
import type { Server } from 'http';
import type { ServiceCollection } from 'botbuilder-dialogs-adaptive-runtime-core';
import { Configuration, getRuntimeServices } from 'botbuilder-dialogs-adaptive-runtime';
import { json, urlencoded } from 'body-parser';

// Explicitly fails checks for `""`
const NonEmptyString = z.string().refine((str) => str.length > 0, { message: 'must be non-empty string' });

const TypedOptions = z.object({
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
    port: z.union([NonEmptyString, z.number()]),

    /**
     * Log errors to stderr
     */
    logErrors: z.boolean(),

    /**
     * Path inside applicationRoot that should be served as static files
     */
    staticDirectory: NonEmptyString,
});

/**
 * Options for runtime Express adapter
 */
export type Options = z.infer<typeof TypedOptions>;

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
    app: Application = express()
): Promise<[Application, (callback?: () => void) => Server]> {
    const configOverrides: Partial<Options> = {};

    const port = ['port', 'PORT'].map((key) => configuration.string([key])).find((port) => port !== undefined);
    if (port !== undefined) {
        configOverrides.port = port;
    }

    const resolvedOptions = TypedOptions.parse(Object.assign({}, defaultOptions, configOverrides, options));

    const errorHandler = (err: Error | string, res?: express.Response): void => {
        if (resolvedOptions.logErrors) {
            console.error(err);
        }

        if (res && !res.headersSent) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const statusCode = typeof (err as any)?.statusCode === 'number' ? (err as any).statusCode : 500;

            res.status(statusCode).json({
                message: err instanceof Error ? err.message : err ?? 'Internal server error',
            });
        }
    };

    const { adapter, bot, channelServiceRoutes, customAdapters } = services.mustMakeInstances<{
        adapter: BotFrameworkHttpAdapter;
        bot: ActivityHandlerBase;
        channelServiceRoutes: ChannelServiceRoutes;
        customAdapters: Map<string, BotFrameworkHttpAdapter>;
    }>('adapter', 'bot', 'channelServiceRoutes', 'customAdapters');

    app.use(urlencoded({ extended: false }));
    app.use(json());

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
            await adapter.process(req, res, async (turnContext) => {
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
            z.array(
                z.object({
                    name: z.string(),
                    enabled: z.boolean().optional(),
                    route: z.string(),
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
                        await adapter.process(req, res, async (turnContext) => {
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
                const adapter = services.mustMakeInstance<BotFrameworkHttpAdapter>('adapter');

                try {
                    await adapter.process(req, socket, head, async (context) => {
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
