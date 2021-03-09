// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { BotFrameworkAdapter } from 'botbuilder';
import { Configuration, getRuntimeServices } from '../src';
import { ok } from 'assert';
import { plugin } from 'botbuilder-runtime-core';

describe('getRuntimeServices', () => {
    it('works', async () => {
        const [services] = await getRuntimeServices(__dirname, __dirname);
        ok(services);
        ok(await services.makeInstances());
    });

    it('works with preset configuration', async () => {
        const [services] = await getRuntimeServices(__dirname, new Configuration());
        ok(services);
        ok(await services.makeInstances());
    });

    it('supports plugins and late binding configuration', async () => {
        const [services, configuration] = await getRuntimeServices(__dirname, __dirname);

        await Promise.resolve(
            plugin(async (services, configuration) => {
                services.composeFactory('customAdapters', async (customAdapters) => {
                    const name = await configuration.get(['customAdapter', 'name']);
                    ok(typeof name === 'string');

                    customAdapters.set(name, new BotFrameworkAdapter());

                    return customAdapters;
                });
            })(services, configuration)
        );

        await configuration.set(['customAdapter', 'name'], 'foo');

        const customAdapter = await services.mustMakeInstance('customAdapters');
        ok(customAdapter.get('foo'));
    });
});
