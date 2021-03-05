// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as t from 'runtypes';
import express from 'express';
import { Configuration, getRuntimeServices } from 'botbuilder-runtime';
import { IServices, ServiceCollection } from 'botbuilder-runtime-core';

/**
 * Options for runtime Express adapter
 */
const TypedOptions = t.Record({
    /**
     * Port that server should listen on
     */
    port: t.Number,

    /**
     * Path that the server will listen to for [Activities](xref:botframework-schema.Activity)
     */
    messagingEndpointPath: t.String,
});

export type Options = t.Static<typeof TypedOptions>;

const defaultOptions: Options = {
    messagingEndpointPath: '/api/messages',
    port: 3978,
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
    options: Partial<Options> = defaultOptions
): Promise<void> {
    TypedOptions.check(options);
    const [services, configuration] = await getRuntimeServices(applicationRoot, settingsDirectory);
    const { port, messagingEndpointPath } = Object.assign({}, defaultOptions, options);

    const app = await makeApp(messagingEndpointPath, services, configuration);
    const { bot } = await services.mustMakeInstances('bot');

    // The 'upgrade' event handler for processing WebSocket requests needs to be registered on the Node.js http.Server, not the Express.Application.
    // In Express the underlying http.Server is made available after the app starts listening for requests.
    const server = app.listen(port, () => {
        console.log(`server listening on port ${port}`);
    });

    server.on('upgrade', async (req, socket, head) => {
        const adapter = await services.mustMakeInstance('adapter');
        adapter.useWebSocket(req, socket, head, async (context) => {
            await bot.run(context);
        });
    });
}

/**
 * Create an Express App using the runtime Express integration.
 *
 * @param messagingEndpointPath path for receiving and processing [Activities](xref:botframework-schema.Activity)
 * @param services runtime service collection
 * @param configuration runtime configuration
 * @returns an Express App ready to listen for connections
 */
export async function makeApp(
    messagingEndpointPath: string,
    services: ServiceCollection<IServices>,
    configuration: Configuration
): Promise<express.Application> {
    const { adapter, bot, customAdapters } = await services.mustMakeInstances('adapter', 'bot', 'customAdapters');

    const server = express();

    server.post(messagingEndpointPath, (req, res) => {
        adapter.processActivity(req, res, async (turnContext) => {
            await bot.run(turnContext);
        });
    });

    const adapters =
        (await configuration.type(
            ['runtimeSettings', 'adapters'],
            t.Array(
                t.Record({
                    name: t.String,
                    enabled: t.Union(t.Boolean, t.Undefined),
                    route: t.String,
                })
            )
        )) ?? [];

    adapters
        .filter((settings) => settings.enabled)
        .forEach((settings) => {
            const adapter = customAdapters.get(settings.name);
            if (adapter) {
                server.post(`/api/${settings.route}`, (req, res) => {
                    adapter.processActivity(req, res, async (turnContext) => {
                        await bot.run(turnContext);
                    });
                });
            } else {
                console.warn(`Custom Adapter for \`${settings.name}\` not registered.`);
            }
        });

    return server;
}
