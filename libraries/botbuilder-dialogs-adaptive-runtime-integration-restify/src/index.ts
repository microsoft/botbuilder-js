// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as z from 'zod';
import path from 'path';
import restify from 'restify';
import type { Bot, BotFrameworkHttpAdapter, ChannelServiceRoutes } from 'botbuilder';
import { Configuration, ConfigurationConstants, getRuntimeServices } from 'botbuilder-dialogs-adaptive-runtime';
import type { ServiceCollection } from 'botbuilder-dialogs-adaptive-runtime-core';

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
 * Options for runtime restify adapter
 */
export type Options = z.infer<typeof TypedOptions>;

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

    return TypedOptions.parse(Object.assign({}, defaultOptions, configOverrides, options));
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
    server.use(restify.plugins.acceptParser(server.acceptable));
    server.use(restify.plugins.queryParser());
    server.use(restify.plugins.bodyParser());

    const { adapter, bot, channelServiceRoutes, customAdapters } = services.mustMakeInstances<{
        adapter: BotFrameworkHttpAdapter;
        bot: Bot;
        channelServiceRoutes: ChannelServiceRoutes;
        customAdapters: Map<string, BotFrameworkHttpAdapter>;
    }>('adapter', 'bot', 'channelServiceRoutes', 'customAdapters');

    const resolvedOptions = await resolveOptions(options, configuration);

    const errorHandler = (err: Error | string, res?: restify.Response): void => {
        if (resolvedOptions.logErrors) {
            console.error(err);
        }

        if (res && !res.headersSent) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const statusCode = typeof (err as any)?.statusCode === 'number' ? (err as any).statusCode : 500;

            res.status(statusCode);
            res.json({
                message: err instanceof Error ? err.message : err ?? 'Internal server error',
            });
        }
    };

    server.post(resolvedOptions.messagingEndpointPath, async (req, res) => {
        try {
            await adapter.process(req, res, (context) => bot.onTurn(context));
        } catch (err) {
            return errorHandler(err, res);
        }
    });

    channelServiceRoutes.register(server, resolvedOptions.skillsEndpointPrefix);

    const adapters =
        configuration.type(
            [ConfigurationConstants.RuntimeSettingsKey, 'adapters'],
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
                server.post(`/api/${settings.route}`, async (req, res) => {
                    try {
                        await adapter.process(req, res, (context) => bot.onTurn(context));
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
        const adapter = services.mustMakeInstance<BotFrameworkHttpAdapter>('adapter');

        try {
            await adapter.process(req, socket, head, (context) => bot.onTurn(context));
        } catch (err) {
            return errorHandler(err);
        }
    });

    return server;
}
