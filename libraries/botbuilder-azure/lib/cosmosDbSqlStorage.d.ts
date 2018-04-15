/**
 * @module botbuilder-azure
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Storage, StoreItems } from 'botbuilder';
import { DocumentBase } from 'documentdb';
/** Additional settings for configuring an instance of [CosmosDbSqlStorage](../classes/botbuilder_azure_v4.cosmosdbsqlstorage.html). */
export interface CosmosDbSqlStorageSettings {
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
 * Middleware that implements a CosmosDB SQL (DocumentDB) based storage provider for a bot.
 */
export declare class CosmosDbSqlStorage implements Storage {
    private settings;
    private client;
    private collectionExists;
    /**
     * Creates a new instance of the storage provider.
     *
     * @param settings Setting to configure the provider.
     * @param connectionPolicyConfigurator (Optional) An optional delegate that accepts a ConnectionPolicy for customizing policies.
     */
    constructor(settings: CosmosDbSqlStorageSettings, connectionPolicyConfigurator?: (policy: DocumentBase.ConnectionPolicy) => void);
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
    private ensureCollectionExists();
}
