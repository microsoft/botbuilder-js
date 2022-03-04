/**
 * @module botbuilder-azure
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import * as semaphore from 'semaphore';
import type { Agent } from 'http';
import { ConnectionPolicy, DocumentClient, RequestOptions, UriFactory, FeedOptions } from 'documentdb';
import { CosmosDbKeyEscape } from './cosmosDbKeyEscape';
import { Storage, StoreItems } from 'botbuilder';

const _semaphore: semaphore.Semaphore = semaphore(1);

// @types/documentdb does not have DocumentBase definition
// eslint-disable-next-line @typescript-eslint/no-var-requires
const DocumentBase: any = require('documentdb').DocumentBase;

/**
 * Additional settings for configuring an instance of `CosmosDbStorage`.
 *
 * @deprecated Please use CosmosDbPartitionedStorageOptions with CosmosDbPartitionedStorage instead.
 */
export interface CosmosDbStorageSettings {
    /**
     * The endpoint Uri for the service endpoint from the Azure Cosmos DB service.
     */
    serviceEndpoint: string;
    /**
     * The AuthKey used by the client from the Azure Cosmos DB service.
     */
    authKey: string;
    /**
     * The Database ID.
     */
    databaseId: string;
    /**
     * The Collection ID.
     */
    collectionId: string;
    /**
     * (Optional) Cosmos DB RequestOptions that are passed when the database is created.
     */
    databaseCreationRequestOptions?: RequestOptions;
    /**
     * (Optional) Cosmos DB RequestOptiones that are passed when the document collection is created.
     */
    documentCollectionRequestOptions?: RequestOptions;
    /**
     * (Optional) partitionKey that are passed when the document CosmosDbStorage is created.
     *
     * @deprecated Please use [[CosmosDbPartitionedStorage]]. See https://github.com/microsoft/botframework-sdk/issues/5467
     */
    partitionKey?: string;
    /**
     * (Optional) http agent to use for outbound requests
     */
    agent?: Agent;
}

/**
 * @private
 * Internal data structure for storing items in DocumentDB.
 */
interface DocumentStoreItem {
    /**
     * Represents the Sanitized Key and used as PartitionKey on DocumentDB.
     */
    id: string;
    /**
     * Represents the original Id/Key.
     */
    realId: string;
    /**
     * The item itself + eTag information.
     */
    document: any;
}

/**
 * Middleware that implements a CosmosDB based storage provider for a bot.
 *
 * @deprecated Please use CosmosDbPartitionedStorage instead.
 *
 * @remarks
 * The `connectionPolicyConfigurator` handler can be used to further customize the connection to
 * CosmosDB (Connection mode, retry options, timeouts). More information at
 * http://azure.github.io/azure-documentdb-node/global.html#ConnectionPolicy
 */
export class CosmosDbStorage implements Storage {
    private settings: CosmosDbStorageSettings;
    private client: DocumentClient;
    private collectionExists: Promise<string>;
    private documentCollectionCreationRequestOption: RequestOptions;
    private databaseCreationRequestOption: RequestOptions;

    /**
     * Creates a new CosmosDbStorage instance.
     *
     * @param settings Setting to configure the provider.
     * @param connectionPolicyConfigurator (Optional) An optional delegate that accepts a ConnectionPolicy for customizing policies. More information at http://azure.github.io/azure-documentdb-node/global.html#ConnectionPolicy
     */
    constructor(
        settings: CosmosDbStorageSettings,
        connectionPolicyConfigurator: (policy: ConnectionPolicy) => void = null
    ) {
        if (!settings) {
            throw new Error('The settings parameter is required.');
        }

        if (!settings.serviceEndpoint || settings.serviceEndpoint.trim() === '') {
            throw new Error('The settings service Endpoint is required.');
        }

        if (!settings.authKey || settings.authKey.trim() === '') {
            throw new Error('The settings authKey is required.');
        }

        if (!settings.databaseId || settings.databaseId.trim() === '') {
            throw new Error('The settings dataBase ID is required.');
        }

        if (!settings.collectionId || settings.collectionId.trim() === '') {
            throw new Error('The settings collection ID is required.');
        }

        this.settings = { ...settings };

        // Invoke collectionPolicy delegate to further customize settings
        const policy: ConnectionPolicy = new DocumentBase.ConnectionPolicy();
        if (connectionPolicyConfigurator && typeof connectionPolicyConfigurator === 'function') {
            connectionPolicyConfigurator(policy);
        }

        this.client = new DocumentClient(settings.serviceEndpoint, { masterKey: settings.authKey }, policy);

        // Note: hack, however it works with our version
        if (settings.agent) {
            const anyClient = this.client as any;
            if (anyClient.requestAgent) {
                anyClient.requestAgent = settings.agent;
            }
        }

        this.databaseCreationRequestOption = settings.databaseCreationRequestOptions;
        this.documentCollectionCreationRequestOption = settings.documentCollectionRequestOptions;
    }

    /**
     * Read storage items from storage.
     *
     * @param keys Keys of the items to read from the store.
     * @returns The read items.
     */
    read(keys: string[]): Promise<StoreItems> {
        if (!keys || keys.length === 0) {
            // No keys passed in, no result to return.
            return Promise.resolve({});
        }

        const parameterSequence: string = Array.from(Array(keys.length).keys())
            .map((ix: number) => `@id${ix}`)
            .join(',');
        const parameterValues: {
            name: string;
            value: string;
        }[] = keys.map((key: string, ix: number) => ({
            name: `@id${ix}`,
            value: CosmosDbKeyEscape.escapeKey(key),
        }));

        const querySpec: {
            query: string;
            parameters: {
                name: string;
                value: string;
            }[];
        } = {
            query: `SELECT c.id, c.realId, c.document, c._etag FROM c WHERE c.id in (${parameterSequence})`,
            parameters: parameterValues,
        };

        let options: FeedOptions;

        if (this.settings.partitionKey !== null) {
            options = {
                partitionKey: this.settings.partitionKey,
            };
        }

        return this.ensureCollectionExists().then((collectionLink: string) => {
            return new Promise<StoreItems>((resolve: any, reject: any): void => {
                const storeItems: StoreItems = {};
                const query: any = this.client.queryDocuments(collectionLink, querySpec, options);
                const getNext: any = (q: any): any => {
                    q.nextItem((err: any, resource: any): any => {
                        if (err) {
                            return reject(err);
                        }

                        if (resource === undefined) {
                            // completed
                            return resolve(storeItems);
                        }

                        // push item
                        storeItems[resource.realId] = resource.document;
                        storeItems[resource.realId].eTag = resource._etag;

                        // visit the remaining results recursively
                        getNext(q);
                    });
                };

                // invoke the function
                getNext(query);
            });
        });
    }

    /**
     * Write storage items to storage.
     *
     * @param changes Items to write to storage, indexed by key.
     * @returns A promise representing the asynchronous operation.
     */
    write(changes: StoreItems): Promise<void> {
        if (!changes || Object.keys(changes).length === 0) {
            return Promise.resolve();
        }

        return this.ensureCollectionExists().then(() => {
            return Promise.all(
                Object.keys(changes).map((k: string) => {
                    const changesCopy: any = { ...changes[k] };

                    // Remove etag from JSON object that was copied from IStoreItem.
                    // The ETag information is updated as an _etag attribute in the document metadata.
                    delete changesCopy.eTag;
                    const documentChange: DocumentStoreItem = {
                        id: CosmosDbKeyEscape.escapeKey(k),
                        realId: k,
                        document: changesCopy,
                    };

                    return new Promise((resolve: any, reject: any): void => {
                        const handleCallback: (err: any, data: any) => void = (err: any): void =>
                            err ? reject(err) : resolve();

                        const eTag: string = changes[k].eTag;
                        if (!eTag || eTag === '*') {
                            // if new item or * then insert or replace unconditionaly
                            const uri: any = UriFactory.createDocumentCollectionUri(
                                this.settings.databaseId,
                                this.settings.collectionId
                            );
                            this.client.upsertDocument(
                                uri,
                                documentChange,
                                { disableAutomaticIdGeneration: true },
                                handleCallback
                            );
                        } else if (eTag.length > 0) {
                            // if we have an etag, do opt. concurrency replace
                            const uri: any = UriFactory.createDocumentUri(
                                this.settings.databaseId,
                                this.settings.collectionId,
                                documentChange.id
                            );
                            const ac: any = { type: 'IfMatch', condition: eTag };
                            this.client.replaceDocument(uri, documentChange, { accessCondition: ac }, handleCallback);
                        } else {
                            reject(new Error('etag empty'));
                        }
                    });
                })
            ).then(() => {
                return;
            }); // void
        });
    }

    /**
     * Delete storage items from storage.
     *
     * @param keys Keys of the items to remove from the store.
     * @returns A promise representing the asynchronous operation.
     */
    delete(keys: string[]): Promise<void> {
        if (!keys || keys.length === 0) {
            return Promise.resolve();
        }

        let options: RequestOptions;

        if (this.settings.partitionKey !== null) {
            options = {
                partitionKey: this.settings.partitionKey,
            };
        }

        return this.ensureCollectionExists()
            .then(() =>
                Promise.all(
                    keys.map(
                        (k: string) =>
                            new Promise((resolve: any, reject: any): void =>
                                this.client.deleteDocument(
                                    UriFactory.createDocumentUri(
                                        this.settings.databaseId,
                                        this.settings.collectionId,
                                        CosmosDbKeyEscape.escapeKey(k)
                                    ),
                                    options,
                                    (err: any): void => (err && err.code !== 404 ? reject(err) : resolve())
                                )
                            )
                    )
                )
            ) // handle notfound as Ok
            .then(() => {
                return;
            }); // void
    }

    /**
     * Delayed Database and Collection creation if they do not exist.
     *
     * @returns A promise representing the asynchronous operation.
     */
    private ensureCollectionExists(): Promise<string> {
        if (!this.collectionExists) {
            // eslint-disable-next-line @typescript-eslint/ban-types
            this.collectionExists = new Promise((resolve: Function): void => {
                _semaphore.take(() => {
                    const result: Promise<string> = this.collectionExists
                        ? this.collectionExists
                        : getOrCreateDatabase(
                              this.client,
                              this.settings.databaseId,
                              this.databaseCreationRequestOption
                          ).then((databaseLink: string) =>
                              getOrCreateCollection(
                                  this.client,
                                  databaseLink,
                                  this.settings.collectionId,
                                  this.documentCollectionCreationRequestOption
                              )
                          );
                    _semaphore.leave();
                    resolve(result);
                });
            });
        }

        return this.collectionExists;
    }
}

/**
 * @private
 */
function getOrCreateDatabase(
    client: DocumentClient,
    databaseId: string,
    databaseCreationRequestOption: RequestOptions
): Promise<string> {
    const querySpec: {
        query: string;
        parameters: {
            name: string;
            value: string;
        }[];
    } = {
        query: 'SELECT r._self FROM root r WHERE r.id = @id',
        parameters: [{ name: '@id', value: databaseId }],
    };

    return new Promise((resolve: any, reject: any): void => {
        client.queryDatabases(querySpec).toArray((err: any, results: any): void => {
            if (err) {
                return reject(err);
            }
            if (results.length === 1) {
                return resolve(results[0]._self);
            }

            // create db
            client.createDatabase(
                { id: databaseId },
                databaseCreationRequestOption,
                (dbCreateErr: any, databaseLink: any) => {
                    if (dbCreateErr) {
                        return reject(dbCreateErr);
                    }
                    resolve(databaseLink._self);
                }
            );
        });
    });
}

/**
 * @private
 */
function getOrCreateCollection(
    client: DocumentClient,
    databaseLink: string,
    collectionId: string,
    documentCollectionCreationRequestOption: RequestOptions
): Promise<string> {
    const querySpec: {
        query: string;
        parameters: {
            name: string;
            value: string;
        }[];
    } = {
        query: 'SELECT r._self FROM root r WHERE r.id=@id',
        parameters: [{ name: '@id', value: collectionId }],
    };

    return new Promise((resolve: any, reject: any): void => {
        client.queryCollections(databaseLink, querySpec).toArray((err: any, results: any): void => {
            if (err) {
                return reject(err);
            }
            if (results.length === 1) {
                return resolve(results[0]._self);
            }

            client.createCollection(
                databaseLink,
                { id: collectionId },
                documentCollectionCreationRequestOption,
                (err2: any, collectionLink: any) => {
                    if (err2) {
                        return reject(err2);
                    }
                    resolve(collectionLink._self);
                }
            );
        });
    });
}
