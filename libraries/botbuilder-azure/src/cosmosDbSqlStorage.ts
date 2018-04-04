/**
 * @module botbuilder-azure
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Storage, StoreItems, StoreItem } from 'botbuilder';
import * as documentdb from 'documentdb';

export interface CosmosDbSqlStorageSettings {
    serviceEndpoint: string;
    authKey: string;
    databaseId: string;
    collectionId: string;
}

let checkedResources: { [key: string]: Promise<void>; } = {};

function getOrCreateDatabase(client: documentdb.DocumentClient, databaseId: string): Promise<string> {
    let querySpec = {
        query: 'SELECT * FROM root r WHERE r.id = @id',
        parameters: [{ name: '@id', value: databaseId }]
    };

    return new Promise((resolve, reject) => {
        client.queryDatabases(querySpec).toArray((err, results) => {
            if (err) return reject(err);
            if (results.length === 1) return resolve(results[0]._self);

            // create db
            client.createDatabase({ id: databaseId }, (err, databaseLink) => {
                if (err) return reject(err);
                resolve(databaseLink._self);
            });
        });
    });
}

function getOrCreateCollection(client: documentdb.DocumentClient, databaseLink: string, collectionId: string): Promise<string> {
    let querySpec = {
        query: 'SELECT * FROM root r WHERE r.id=@id',
        parameters: [{ name: '@id', value: collectionId }]
    };

    return new Promise((resolve, reject) => {
        client.queryCollections(databaseLink, querySpec).toArray((err, results) => {
            if (err) return reject(err);
            if (results.length === 1) return resolve(results[0]._self);

            client.createCollection(databaseLink, { id: collectionId }, (err, collectionLink) => {
                if (err) return reject(err);
                resolve(collectionLink._self);
            });
        });
    });
}

export class CosmosDbSqlStorage implements Storage {
    private settings: CosmosDbSqlStorageSettings;
    private client: documentdb.DocumentClient;

    public constructor(settings: CosmosDbSqlStorageSettings) {
        this.settings = Object.assign({}, settings);
        this.client = new documentdb.DocumentClient(settings.serviceEndpoint, { masterKey: settings.authKey });
    }

    private ensureResourcesCreation(): Promise<void> {
        let key = `${this.settings.databaseId}-${this.settings.collectionId}`;
        if (!checkedResources[key]) {
            checkedResources[key] = getOrCreateDatabase(this.client, this.settings.databaseId)
                .then(databaseLink => getOrCreateCollection(this.client, databaseLink, this.settings.collectionId))
                .then(() => { })
                .catch((err) => console.error('Error creating CosmosDB resources:', err));
        }

        return checkedResources[key];
    }

    read(keys: string[]): Promise<StoreItems> {
        return this.ensureResourcesCreation().then(() => {
            throw new Error("Method not implemented.");
        });
    }
    write(changes: StoreItems): Promise<void> {
        return this.ensureResourcesCreation().then(() => {
            throw new Error("Method not implemented.");
        });
    }
    delete(keys: string[]): Promise<void> {
        return this.ensureResourcesCreation().then(() => {
            throw new Error("Method not implemented.");
        });
    }
}