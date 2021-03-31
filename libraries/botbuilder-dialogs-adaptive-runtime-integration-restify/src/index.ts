// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as t from 'runtypes';
import restify from 'restify';
import { ActivityHandlerBase, BotFrameworkAdapter } from 'botbuilder';
import { Configuration, getRuntimeServices } from 'botbuilder-dialogs-adaptive-runtime';
import { ServiceCollection } from 'botbuilder-dialogs-adaptive-runtime-core';

const TypedOptions = t.Record({
    /**
     * Path that the server will listen to for [Activities](xref:botframework-schema.Activity)
     */
    messagingEndpointPath: t.String,

    /**
     * Port that server should listen on
     */
    port: t.Union(t.String, t.Number),

    /**
     * Log errors to stderr
     */
    logErrors: t.Boolean,
});

/**
 * Options for runtime restify adapter
 */
export type Options = t.Static<typeof TypedOptions>;

const defaultOptions: Options = {
    logErrors: true,
    messagingEndpointPath: '/api/messages',
    port: 3978,
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

    const server = await makeServer(services, configuration, resolvedOptions);

    server.listen(resolvedOptions.port, () => console.log(`server listening on port ${resolvedOptions.port}`));
}

/**
 * Create a server using the runtime restify integration.
 *
 * @param services runtime service collection
 * @param configuration runtime configuration
 * @param options options bag for configuring restify Server
 * @returns a restify Server ready to listen for connections
 */
export async function makeServer(
    services: ServiceCollection,
    configuration: Configuration,
    options: Partial<Options> = {}
): Promise<restify.Server> {
    const { adapter, bot, customAdapters } = services.mustMakeInstances<{
        adapter: BotFrameworkAdapter;
        bot: ActivityHandlerBase;
        customAdapters: Map<string, BotFrameworkAdapter>;
    }>('adapter', 'bot', 'customAdapters');

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

    const server = restify.createServer();

    server.post(resolvedOptions.messagingEndpointPath, async (req, res) => {
        try {
            await adapter.processActivity(req, res, async (turnContext) => {
                await bot.run(turnContext);
            });
        } catch (err) {
            return errorHandler(err, res);
        }
    });

    const adapters =
        configuration.type(
            ['runtimeSettings', 'adapters'],
            t.Array(
                t.Record({
                    name: t.String,
                    enabled: t.Union(t.Boolean, t.Undefined),
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
