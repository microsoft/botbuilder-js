// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { BlobsStorage } from 'botbuilder-azure-blobs';
import { BotComponent, BotFrameworkAdapter, MemoryStorage } from 'botbuilder';
import { Configuration, getRuntimeServices } from '../src';
import { CosmosDbPartitionedStorage } from 'botbuilder-azure';
import { ok } from 'assert';
import { ServiceCollection, Configuration as CoreConfiguration } from 'botbuilder-runtime-core';

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

    it('supports bot components and late binding configuration', async () => {
        class MyComponent extends BotComponent {
            configureServices(services: ServiceCollection, configuration: CoreConfiguration): void {
                services.composeFactory<Map<string, BotFrameworkAdapter>>('customAdapters', async (customAdapters) => {
                    const name = configuration.get(['customAdapter', 'name']);
                    ok(typeof name === 'string');

                    customAdapters.set(name, new BotFrameworkAdapter());

                    return customAdapters;
                });
            }
        }

        const [services, configuration] = await getRuntimeServices(__dirname, __dirname);

        const myComponent = new MyComponent();

        await Promise.resolve(myComponent.configureServices(services, configuration));

        configuration.set(['customAdapter', 'name'], 'foo');

        const customAdapter = await services.mustMakeInstance<Map<string, BotFrameworkAdapter>>('customAdapters');
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
