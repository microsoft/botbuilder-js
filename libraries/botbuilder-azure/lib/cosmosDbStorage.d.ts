/**
 * @module botbuilder-azure
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Storage, StoreItems } from 'botbuilder';
import { DocumentBase } from 'documentdb';
/**
 * Additional settings for configuring an instance of `CosmosDbStorage`.
 */
export interface CosmosDbStorageSettings {
    /** The endpoint Uri for the service endpoint from the Azure Cosmos DB service. */
    serviceEndpoint: string;
    /** The AuthKey used by the client from the Azure Cosmos DB service. */
    authKey: string;
    /** The Database ID. */
    databaseId: string;
    /** The Collection ID. */
    collectionId: string;
}
/**
 * Middleware that implements a CosmosDB based storage provider for a bot.
 *
 * @remarks
 * The `connectionPolicyConfigurator` handler can be used to further customize the connection to
 * CosmosDB (Connection mode, retry options, timeouts). More information at
 * http://azure.github.io/azure-documentdb-node/global.html#ConnectionPolicy
 */
export declare class CosmosDbStorage implements Storage {
    private settings;
    private client;
    private collectionExists;
    /**
     * Creates a new ConsmosDbStorage instance.
     *
     * @param settings Setting to configure the provider.
     * @param connectionPolicyConfigurator (Optional) An optional delegate that accepts a ConnectionPolicy for customizing policies. More information at http://azure.github.io/azure-documentdb-node/global.html#ConnectionPolicy
     */
    constructor(settings: CosmosDbStorageSettings, connectionPolicyConfigurator?: (policy: DocumentBase.ConnectionPolicy) => void);
    read(keys: string[]): Promise<StoreItems>;
    write(changes: StoreItems): Promise<void>;
    delete(keys: string[]): Promise<void>;
    /**
     * Delayed Database and Collection creation if they do not exist.
     */
    private ensureCollectionExists();
}
