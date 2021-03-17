// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import express from 'express';
import * as http from 'http';
import * as t from 'runtypes';
import { Configuration, getRuntimeServices } from 'botbuilder-runtime';
import { IServices, ServiceCollection } from 'botbuilder-runtime-core';

const TypedOptions = t.Record({
    /**
     * Path that the server will listen to for [Activities](xref:botframework-schema.Activity)
     */
    messagingEndpointPath: t.String,

    /**
     * Port that server should listen on
     */
    port: t.Union(t.String, t.Number),
});

/**
 * Options for runtime Express adapter
 */
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
    options: Partial<Options> = {}
): Promise<void> {
    const [services, configuration] = await getRuntimeServices(applicationRoot, settingsDirectory);
    const [_, listen] = await makeApp(services, configuration, options);

    listen();
}

/**
 * Create an Express App using the runtime Express integration.
 *
 * @param services runtime service collection
 * @param configuration runtime configuration
 * @param options options bag for configuring Express Application
 * @returns the Express Application and a function to start the App & handle "upgrade" requests for Streaming
 */
export async function makeApp(
    services: ServiceCollection<IServices>,
    configuration: Configuration,
    options: Partial<Options> = {}
): Promise<[app: express.Application, listen: (callback?: () => void) => http.Server]> {
    const configOverrides: Partial<Options> = {};

    const port = (await Promise.all(['port', 'PORT'].map((key) => configuration.string([key])))).find(
        (port) => port !== undefined
    );

    if (port !== undefined) {
        configOverrides.port = port;
    }

    const validatedOptions = TypedOptions.check(Object.assign({}, defaultOptions, configOverrides, options));

    const { adapter, bot, customAdapters } = await services.mustMakeInstances('adapter', 'bot', 'customAdapters');

    const app = express();

    app.post(validatedOptions.messagingEndpointPath, (req, res) => {
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
                app.post(`/api/${settings.route}`, (req, res) => {
                    adapter.processActivity(req, res, async (turnContext) => {
                        await bot.run(turnContext);
                    });
                });
            } else {
                console.warn(`Custom Adapter for \`${settings.name}\` not registered.`);
            }
        });

    return [
        app,
        (callback) => {
            // The 'upgrade' event handler for processing WebSocket requests needs to be registered on the Node.js http.Server, not the Express.Application.
            // In Express the underlying http.Server is made available after the app starts listening for requests.
            const server = app.listen(
                validatedOptions.port,
                callback ?? (() => console.log(`server listening on port ${validatedOptions.port}`))
            );

            server.on('upgrade', async (req, socket, head) => {
                const adapter = await services.mustMakeInstance('adapter');
                adapter.useWebSocket(req, socket, head, async (context) => {
                    await bot.run(context);
                });
            });

            return server;
        },
    ];
}
