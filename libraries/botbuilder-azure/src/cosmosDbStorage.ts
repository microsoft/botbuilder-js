/**
 * @module botbuilder-azure
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Storage, StoreItems } from 'botbuilder';
import { DocumentBase, DocumentClient, UriFactory } from 'documentdb';

/**
 * Additional settings for configuring an instance of `CosmosDbStorage`.
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
}

/**
 * @private
 * Internal data structure for storing items in DocumentDB
 */
interface DocumentStoreItem {
    /**
     * Represents the Sanitized Key and used as PartitionKey on DocumentDB
     */
    id: string;
    /**
     * Represents the original Id/Key
     */
   realId: string;
    /**
     * The item itself + eTag information
     */
   document: any;
}

/**
 * Middleware that implements a CosmosDB based storage provider for a bot.
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

    /**
     * Creates a new ConsmosDbStorage instance.
     *
     * @param settings Setting to configure the provider.
     * @param connectionPolicyConfigurator (Optional) An optional delegate that accepts a ConnectionPolicy for customizing policies. More information at http://azure.github.io/azure-documentdb-node/global.html#ConnectionPolicy
     */
    public constructor(settings: CosmosDbStorageSettings, connectionPolicyConfigurator: (policy: DocumentBase.ConnectionPolicy) => void = null) {
        if (!settings) {
            throw new Error('The settings parameter is required.');
        }

        this.settings = {...settings};

        // Invoke collectionPolicy delegate to further customize settings
        const policy: DocumentBase.ConnectionPolicy = new DocumentBase.ConnectionPolicy();
        if (connectionPolicyConfigurator && typeof connectionPolicyConfigurator === 'function') {
            connectionPolicyConfigurator(policy);
        }

        this.client = new DocumentClient(settings.serviceEndpoint, { masterKey: settings.authKey }, policy);
    }

    public read(keys: string[]): Promise<StoreItems> {
        if (!keys || keys.length === 0) {
            throw new Error('Please provide at least one key to read from storage.');
        }

        const parameterSequence: string = Array.from(Array(keys.length).keys())
            .map((ix: number) => `@id${ix}`)
            .join(',');
        const parameterValues: {
            name: string;
            value: string;
        }[] = keys.map((key: string, ix: number) => ({
            name: `@id${ix}`,
            value: sanitizeKey(key)
        }));

        const querySpec: {
            query: string;
            parameters: {
                name: string;
                value: string;
            }[];
        } = {
            query: `SELECT c.id, c.realId, c.document, c._etag FROM c WHERE c.id in (${parameterSequence})`,
            parameters: parameterValues
        };

        return this.ensureCollectionExists().then((collectionLink: string) => {
            return new Promise<StoreItems>((resolve: any, reject: any): void => {
                const storeItems: StoreItems = {};
                const query: any = this.client.queryDocuments(collectionLink, querySpec);
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

    public write(changes: StoreItems): Promise<void> {
        if (!changes) {
            throw new Error('Please provide a StoreItems with changes to persist.');
        }

        return this.ensureCollectionExists().then(() => {
            return Promise.all(Object.keys(changes).map((k: string) => {
                const changesCopy:  any = {...changes[k]};

                // Remove etag from JSON object that was copied from IStoreItem.
                // The ETag information is updated as an _etag attribute in the document metadata.
                delete changesCopy.eTag;
                const documentChange: DocumentStoreItem = {
                    id: sanitizeKey(k),
                    realId: k,
                    document: changesCopy
                };

                return new Promise((resolve: any, reject: any): void => {
                    const handleCallback: (err: any, data: any) => void = (err: any, data: any): void => err ? reject(err) : resolve();

                    const eTag: string = changes[k].eTag;
                    if (!eTag || eTag === '*') {
                        // if new item or * then insert or replace unconditionaly
                        const uri: any = UriFactory.createDocumentCollectionUri(this.settings.databaseId, this.settings.collectionId);
                        this.client.upsertDocument(uri, documentChange, { disableAutomaticIdGeneration: true }, handleCallback);
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
            })).then(() => {
                return;
            }); // void
        });
    }

    public delete(keys: string[]): Promise<void> {
        return this.ensureCollectionExists().then(() =>
            Promise.all(keys.map((k: string) =>
                new Promise((resolve: any, reject: any): void =>
                    this.client.deleteDocument(
                        UriFactory.createDocumentUri(this.settings.databaseId, this.settings.collectionId, sanitizeKey(k)),
                        (err: any, data: any): void =>
                            err && err.code !== 404 ? reject(err) : resolve()
                        )
                    )
            ))
        ) // handle notfound as Ok
        .then(() => {
            return;
         }); // void
    }

    /**
     * Delayed Database and Collection creation if they do not exist.
     */
    private ensureCollectionExists(): Promise<string> {
        if (!this.collectionExists) {
            this.collectionExists = getOrCreateDatabase(this.client, this.settings.databaseId)
                .then((databaseLink: string) => getOrCreateCollection(this.client, databaseLink, this.settings.collectionId));
        }

        return this.collectionExists;
    }
}

/**
 * @private
 */
function getOrCreateDatabase(client: DocumentClient, databaseId: string): Promise<string> {
    const querySpec: {
        query: string;
        parameters: {
            name: string;
            value: string;
        }[];
    } = {
        query: 'SELECT * FROM root r WHERE r.id = @id',
        parameters: [{ name: '@id', value: databaseId }]
    };

    return new Promise((resolve: any, reject: any): void => {
        client.queryDatabases(querySpec).toArray((err: any, results: any): void => {
            if (err) { return reject(err); }
            if (results.length === 1) { return resolve(results[0]._self); }

            // create db
            client.createDatabase({ id: databaseId }, (db_create_err: any, databaseLink: any) => {
                if (db_create_err) { return reject(db_create_err); }
                resolve(databaseLink._self);
            });
        });
    });
}

/**
 * @private
 */
function getOrCreateCollection(client: DocumentClient, databaseLink: string, collectionId: string): Promise<string> {
    const querySpec: {
        query: string;
        parameters: {
            name: string;
            value: string;
        }[];
    } = {
        query: 'SELECT * FROM root r WHERE r.id=@id',
        parameters: [{ name: '@id', value: collectionId }]
    };

    return new Promise((resolve: any, reject: any): void => {
        client.queryCollections(databaseLink, querySpec).toArray((err: any, results: any): void => {
            if (err) { return reject(err); }
            if (results.length === 1) { return resolve(results[0]._self); }

            client.createCollection(databaseLink, { id: collectionId }, (err2: any, collectionLink: any) => {
                if (err2) { return reject(err2); }
                resolve(collectionLink._self);
            });
        });
    });
}

/**
 * @private
 * Converts the key into a DocumentID that can be used safely with CosmosDB.
 * The following characters are restricted and cannot be used in the Id property: '/', '\', '?', '#'
 * More information at https://docs.microsoft.com/en-us/dotnet/api/microsoft.azure.documents.resource.id?view=azure-dotnet#remarks
 */
function sanitizeKey(key: string): string {
    const badChars: string[] = ['\\', '?', '/', '#', '\t', '\n', '\r'];
    let sb: string = '';
    for (const ch of key) {
        let isBad: boolean = false;
        for (const badChar of badChars) {
            if (ch === badChar) {
                // We cannot use % because DocumentClient will try to re-encode the % with encodeURI()
                // tslint:disable-next-line:prefer-template
                sb += '*' + ch.charCodeAt(0).toString(16);
                isBad = true;
                break;
            }
        }
        if (!isBad) {
            sb += ch;
        }
    }

    return sb;
}
