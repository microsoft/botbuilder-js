// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as t from 'runtypes';
import restify from 'restify';
import { Configuration, getRuntimeServices } from 'botbuilder-runtime';
import { IServices, ServiceCollection } from 'botbuilder-runtime-core';
import { tests } from 'botbuilder-stdlib';

/**
 * Options for runtime restify adapter
 */
export type Options = {
    /**
     * Port that server should listen on
     */
    port: number;

    /**
     * Path that the server will listen to for [Activities](xref:botframework-schema.Activity)
     */
    messagingEndpointPath: string;
};

const defaultOptions: Options = {
    port: 3978,
    messagingEndpointPath: '/api/messages'
};

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
    options = {} as Options
): Promise<void> {
    const [services, configuration] = await getRuntimeServices(applicationRoot, settingsDirectory);
    const { port, messagingEndpointPath } = tests.isObject(options)
        ? { ...defaultOptions, ...options }
        : defaultOptions;

    const server = await makeServer(messagingEndpointPath, services, configuration);

    server.listen(port, () => {
        console.log(`server listening on port ${port}`);
    });
}

/**
 * Create a server using the runtime restify integration.
 *
 * @param messagingEndpointPath path for receiving and processing [Activities](xref:botframework-schema.Activity)
 * @param services runtime service collection
 * @param configuration runtime configuration
 * @returns a restify server ready to listen for connections
 */
export async function makeServer(
    messagingEndpointPath: string,
    services: ServiceCollection<IServices>,
    configuration: Configuration
): Promise<restify.Server> {
    const { adapter, bot, customAdapters } = await services.mustMakeInstances('adapter', 'bot', 'customAdapters');

    const server = restify.createServer();

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

    server.on('upgrade', async (req, socket, head) => {
        const adapter = await services.mustMakeInstance('adapter');
        adapter.useWebSocket(req, socket, head, async (context) => {
            await bot.run(context);
        });
    });

    return server;
}
