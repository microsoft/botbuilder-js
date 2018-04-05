/**
 * @module botbuilder-azure
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Storage, StoreItems, StoreItem } from 'botbuilder';
import { DocumentClient, UriFactory } from 'documentdb';

export interface CosmosDbSqlStorageSettings {
    serviceEndpoint: string;
    authKey: string;
    databaseId: string;
    collectionId: string;
}

interface DocumentStoreItem {
    id: string;
    document: any;
}

let checkedCollections: { [key: string]: Promise<string>; } = {};

function getOrCreateDatabase(client: DocumentClient, databaseId: string): Promise<string> {
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

function getOrCreateCollection(client: DocumentClient, databaseLink: string, collectionId: string): Promise<string> {
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

function sanitizeKey(key: string): string {
    // TODO:
    return key;
}

export class CosmosDbSqlStorage implements Storage {
    private settings: CosmosDbSqlStorageSettings;
    private client: DocumentClient;

    public constructor(settings: CosmosDbSqlStorageSettings) {
        this.settings = Object.assign({}, settings);

        // TODO: Add connection policy with useragent string
        this.client = new DocumentClient(settings.serviceEndpoint, { masterKey: settings.authKey });
    }

    private ensureCollectionExists(): Promise<string> {
        let key = `${this.settings.databaseId}-${this.settings.collectionId}`;
        if (!checkedCollections[key]) {
            checkedCollections[key] = getOrCreateDatabase(this.client, this.settings.databaseId)
                .then(databaseLink => getOrCreateCollection(this.client, databaseLink, this.settings.collectionId))
            // .catch((err) => console.error('Error creating CosmosDB resources:', err));
        }

        return checkedCollections[key];
    }

    read(keys: string[]): Promise<StoreItems> {
        return this.ensureCollectionExists().then((collectionLink) => {
            return Promise.all(keys.map(k => {
                return new Promise<DocumentStoreItem>((resolve, reject) => {
                    let documentLink = UriFactory.createDocumentUri(this.settings.databaseId, this.settings.collectionId, sanitizeKey(k));
                    this.client.readDocument(documentLink, (err, response) => {
                        if (err) {
                            // console.error(`Error retrieving key: ${k}`, err);
                            if (err.code === 404) {
                                return resolve({ id: k, document: null });
                            } else {
                                return reject(err);
                            }
                        }

                        let documentStore = { id: k, document: response.document };
                        documentStore.document.eTag = response._etag;
                        resolve(documentStore);
                    })
                });
            })).then(items => {
                return items.filter(i => !!i.document)
                    .reduce((acc, item) => {
                        acc[item.id] = item.document
                        return acc;
                    }, {});
            })
        }).then((data) => {
            return data;
        })
    }

    write(changes: StoreItems): Promise<void> {
        // TODO: Should clone items?
        return this.ensureCollectionExists().then(() => {
            return Promise.all(Object.keys(changes).map(k => {
                let documentChange: DocumentStoreItem = {
                    id: sanitizeKey(k),
                    document: changes[k]
                };

                return new Promise((resolve, reject) => {
                    var handleCallback = (err, data) => err ? reject(err) : resolve();

                    let eTag = changes[k].eTag;
                    if (!eTag || eTag === '*') {
                        let uri = UriFactory.createDocumentCollectionUri(this.settings.databaseId, this.settings.collectionId);
                        this.client.upsertDocument(uri, documentChange, { disableAutomaticIdGeneration: true }, handleCallback);
                    } else if (eTag.length > 0) {
                        // Optimistic Update
                        let uri = UriFactory.createDocumentUri(this.settings.databaseId, this.settings.collectionId, documentChange.id);
                        let ac = { type: 'IfMatch', condition: eTag };
                        this.client.replaceDocument(uri, documentChange, { accessCondition: ac }, handleCallback);
                    } else {
                        reject(new Error('etag empty'));
                    }
                })
            })).then(() => { }); // void
        });
    }

    delete(keys: string[]): Promise<void> {
        return this.ensureCollectionExists().then(() =>
            Promise.all(keys.map(k =>
                new Promise((resolve, reject) =>
                    this.client.deleteDocument(
                        UriFactory.createDocumentUri(this.settings.databaseId, this.settings.collectionId, sanitizeKey(k)),
                        (err, data) => err ? reject(err) : resolve())))))
            .then(() => { }); // void
    }
}