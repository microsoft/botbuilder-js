/**
 * @module botbuilder-azure
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Storage, StoreItems, StoreItem } from 'botbuilder';
import { DocumentClient, DocumentBase, UriFactory } from 'documentdb';

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
 * @private
 * Internal data structure for storing items in DocumentDB
 */
interface DocumentStoreItem {
    /** Represents the Sanitized Key and used as PartitionKey on DocumentDB */
    id: string;
    /** Represents the original Id/Key */
    realId: string;
    /** The item itself + eTag information */
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

        this.settings = Object.assign({}, settings);

        // Invoke collectionPolicy delegate to further customize settings
        let policy = new DocumentBase.ConnectionPolicy();
        if (connectionPolicyConfigurator && typeof connectionPolicyConfigurator === 'function') {
            connectionPolicyConfigurator(policy);
        }

        this.client = new DocumentClient(settings.serviceEndpoint, { masterKey: settings.authKey }, policy);
    }

    read(keys: string[]): Promise<StoreItems> {
        if (!keys || keys.length === 0) {
            throw new Error('Please provide at least one key to read from storage.');
        }

        let parameterSequence = Array.from(Array(keys.length).keys())
            .map(ix => `@id${ix}`)
            .join(',');
        let parameterValues = keys.map((key, ix) => ({
            name: `@id${ix}`,
            value: sanitizeKey(key)
        }));

        let querySpec = {
            query: `SELECT c.id, c.realId, c.document, c._etag FROM c WHERE c.id in (${parameterSequence})`,
            parameters: parameterValues
        };

        return this.ensureCollectionExists().then((collectionLink) => {
            return new Promise<StoreItems>((resolve, reject) => {
                let storeItems: StoreItems = {};
                let query = this.client.queryDocuments(collectionLink, querySpec);
                let getNext = function (query) {
                    query.nextItem(function (err, resource) {
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
                        getNext(query);
                    })
                }
                // invoke the function
                getNext(query);
            });
        });
    }

    write(changes: StoreItems): Promise<void> {
        if (!changes) {
            throw new Error('Please provide a StoreItems with changes to persist.');
        }

        return this.ensureCollectionExists().then(() => {
            return Promise.all(Object.keys(changes).map(k => {
                let changesCopy = Object.assign({}, changes[k]);

                // Remove etag from JSON object that was copied from IStoreItem.
                // The ETag information is updated as an _etag attribute in the document metadata.
                delete changesCopy.eTag;
                let documentChange: DocumentStoreItem = {
                    id: sanitizeKey(k),
                    realId: k,
                    document: changesCopy
                };

                return new Promise((resolve, reject) => {
                    let handleCallback = (err, data) => err ? reject(err) : resolve();

                    let eTag = changes[k].eTag;
                    if (!eTag || eTag === '*') {
                        // if new item or * then insert or replace unconditionaly
                        let uri = UriFactory.createDocumentCollectionUri(this.settings.databaseId, this.settings.collectionId);
                        this.client.upsertDocument(uri, documentChange, { disableAutomaticIdGeneration: true }, handleCallback);
                    } else if (eTag.length > 0) {
                        // if we have an etag, do opt. concurrency replace
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
                        (err, data) => err && err.code !== 404 ? reject(err) : resolve())))))           // handle notfound as Ok
            .then(() => { }); // void
    }

    /**
     * Delayed Database and Collection creation if they do not exist.
     */
    private ensureCollectionExists(): Promise<string> {
        if (!this.collectionExists) {
            this.collectionExists = getOrCreateDatabase(this.client, this.settings.databaseId)
                .then(databaseLink => getOrCreateCollection(this.client, databaseLink, this.settings.collectionId))
        }

        return this.collectionExists;
    }
}

/**
 * @private
 */
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

/**
 * @private
 */
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

/**
 * @private
 * Converts the key into a DocumentID that can be used safely with CosmosDB.
 * The following characters are restricted and cannot be used in the Id property: '/', '\', '?', '#'
 * More information at https://docs.microsoft.com/en-us/dotnet/api/microsoft.azure.documents.resource.id?view=azure-dotnet#remarks
 */
function sanitizeKey(key: string): string {
    let badChars = ['\\', '?', '/', '#', '\t', '\n', '\r'];
    let sb = '';
    for (let iCh = 0; iCh < key.length; iCh++) {
        let ch = key[iCh];
        let isBad: boolean = false;
        for (let iBad in badChars) {
            let badChar = badChars[iBad];
            if (ch === badChar) {
                // We cannot use % because DocumentClient will try to re-encode the % with encodeURI()
                sb += '*' + ch.charCodeAt(0).toString(16);
                isBad = true;
                break;
            }
        }
        if (!isBad)
            sb += ch;
    }
    return sb;
}