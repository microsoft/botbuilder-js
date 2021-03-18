// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { BlobsStorage } from 'botbuilder-azure-blobs';
import { BotFrameworkAdapter, MemoryStorage } from 'botbuilder';
import { Configuration, getRuntimeServices } from '../src';
import { CosmosDbPartitionedStorage } from 'botbuilder-azure';
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

    describe('storage', () => {
        it('defaults to memory storage', async () => {
            const [services] = await getRuntimeServices(__dirname, __dirname);
            ok(services);

            const storage = await services.mustMakeInstance('storage');
            ok(storage instanceof MemoryStorage);
        });

        it('supports blobs storage', async () => {
            const configuration = new Configuration().argv().env();

            configuration.set(['runtimeSettings', 'storage'], 'BlobsStorage');

            configuration.set(['BlobsStorage'], {
                connectionString: 'UseDevelopmentStorage=true',
                containerName: 'containerName',
            });

            const [services] = await getRuntimeServices(__dirname, configuration);
            ok(services);

            const storage = await services.mustMakeInstance('storage');
            ok(storage instanceof BlobsStorage);
        });

        it('supports cosmos storage', async () => {
            const configuration = new Configuration().argv().env();

            configuration.set(['runtimeSettings', 'storage'], 'CosmosDbPartitionedStorage');

            configuration.set(['CosmosDbPartitionedStorage'], {
                authKey: 'authKey',
                cosmosDbEndpoint: 'cosmosDbEndpoint',
                containerId: 'containerId',
                databaseId: 'databaseId',
            });

            const [services] = await getRuntimeServices(__dirname, configuration);
            ok(services);

            const storage = await services.mustMakeInstance('storage');
            ok(storage instanceof CosmosDbPartitionedStorage);
        });
    });
});
