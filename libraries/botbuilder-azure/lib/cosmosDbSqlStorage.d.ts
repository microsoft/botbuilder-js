/**
 * @module botbuilder-azure
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Storage, StoreItems } from 'botbuilder';
import { DocumentBase } from 'documentdb';
export interface CosmosDbSqlStorageSettings {
    serviceEndpoint: string;
    authKey: string;
    databaseId: string;
    collectionId: string;
}
export declare class CosmosDbSqlStorage implements Storage {
    private settings;
    private client;
    constructor(settings: CosmosDbSqlStorageSettings, connectionPolicyConfigurator?: (policy: DocumentBase.ConnectionPolicy) => void);
    private ensureCollectionExists();
    read(keys: string[]): Promise<StoreItems>;
    write(changes: StoreItems): Promise<void>;
    delete(keys: string[]): Promise<void>;
}
