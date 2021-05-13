// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as t from 'runtypes';
import path from 'path';
import restify from 'restify';
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
 * Options for runtime restify adapter
 */
export type Options = t.Static<typeof TypedOptions>;

const defaultOptions: Options = {
    logErrors: true,
    messagingEndpointPath: '/api/messages',
    skillsEndpointPrefix: '/api/skills',
    port: 3978,
    staticDirectory: 'wwwroot',
};

async function resolveOptions(options: Partial<Options>, configuration: Configuration): Promise<Options> {
    const configOverrides: Partial<Options> = {};

    const port = ['port', 'PORT'].map((key) => configuration.string([key])).find((port) => port !== undefined);
    if (port !== undefined) {
        configOverrides.port = port;
    }

    return TypedOptions.check(Object.assign({}, defaultOptions, configOverrides, options));
}

/**
 * Start a bot using the runtime restify integration.
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

    const resolvedOptions = await resolveOptions(options, configuration);

    const server = await makeServer(services, configuration, applicationRoot, resolvedOptions);

    server.listen(resolvedOptions.port, () => console.log(`server listening on port ${resolvedOptions.port}`));
}

// Content type overrides for specific file extensions
const extensionContentTypes: Record<string, string> = {
    '.lu': 'vnd.application/lu',
    '.qna': 'vnd.application/qna',
};

/**
 * Create a server using the runtime restify integration.
 *
 * @param services runtime service collection
 * @param configuration runtime configuration
 * @param applicationRoot application root directory
 * @param options options bag for configuring restify Server
 * @param server optional predefined restify server, useful to register middleware
 * @returns a restify Server ready to listen for connections
 */
export async function makeServer(
    services: ServiceCollection,
    configuration: Configuration,
    applicationRoot: string,
    options: Partial<Options> = {},
    server = restify.createServer()
): Promise<restify.Server> {
    const { adapter, bot, channelServiceRoutes, customAdapters } = services.mustMakeInstances<{
        adapter: BotFrameworkAdapter;
        bot: ActivityHandlerBase;
        channelServiceRoutes: ChannelServiceRoutes;
        customAdapters: Map<string, BotFrameworkAdapter>;
    }>('adapter', 'bot', 'channelServiceRoutes', 'customAdapters');

    const resolvedOptions = await resolveOptions(options, configuration);

    const errorHandler = (err: Error | string, res?: restify.Response): void => {
        if (options.logErrors) {
            console.error(err);
        }

        if (res && !res.headersSent) {
            res.status(500);
            res.json({ message: 'Internal server error' });
        }
    };

    server.post(resolvedOptions.messagingEndpointPath, async (req, res) => {
        try {
            await adapter.processActivity(req, res, async (turnContext) => {
                await bot.run(turnContext);
            });
        } catch (err) {
            return errorHandler(err, res);
        }
    });

    channelServiceRoutes.register(server, resolvedOptions.skillsEndpointPrefix);

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
                server.post(`/api/${settings.route}`, async (req, res) => {
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

    server.get(
        '*',
        restify.plugins.serveStaticFiles(path.join(applicationRoot, resolvedOptions.staticDirectory), {
            setHeaders: (res, filePath) => {
                const contentType = extensionContentTypes[path.extname(filePath)];
                if (contentType) {
                    res.setHeader('Content-Type', contentType);
                }
            },
        })
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
}
