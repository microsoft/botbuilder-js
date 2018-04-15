/**
 * @module botbuilder-azure
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Storage, StoreItems } from 'botbuilder';
import { DocumentBase } from 'documentdb';
/** Additional settings for configuring an instance of [CosmosDbStorage](../classes/botbuilder_azure_v4.cosmosdbstorage.html). */
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
 * The ConnectionPolicy delegate can be used to further customize the connection to CosmosDB (Connection mode, retry options, timeouts).
 * More information at http://azure.github.io/azure-documentdb-node/global.html#ConnectionPolicy
 */
export declare class CosmosDbStorage implements Storage {
    private settings;
    private client;
    private collectionExists;
    /**
     * Creates a new instance of the storage provider.
     *
     * @param settings Setting to configure the provider.
     * @param connectionPolicyConfigurator (Optional) An optional delegate that accepts a ConnectionPolicy for customizing policies. More information at http://azure.github.io/azure-documentdb-node/global.html#ConnectionPolicy
     */
    constructor(settings: CosmosDbStorageSettings, connectionPolicyConfigurator?: (policy: DocumentBase.ConnectionPolicy) => void);
    /**
     * Loads store items from storage
     *
     * @param keys Array of item keys to read from the store.
     */
    read(keys: string[]): Promise<StoreItems>;
    /**
     * Saves store items to storage.
     *
     * @param changes Map of items to write to storage.
     **/
    write(changes: StoreItems): Promise<void>;
    /**
     * Removes store items from storage
     *
     * @param keys Array of item keys to remove from the store.
     **/
    delete(keys: string[]): Promise<void>;
    /**
     * Delayed Database and Collection creation if they do not exist.
     */
    private ensureCollectionExists();
}
