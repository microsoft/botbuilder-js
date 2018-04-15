"use strict";
/**
 * @module botbuilder-azure
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const documentdb_1 = require("documentdb");
/**
 * Middleware that implements a CosmosDB SQL (DocumentDB) based storage provider for a bot.
 */
class CosmosDbSqlStorage {
    /**
     * Creates a new instance of the storage provider.
     *
     * @param settings Setting to configure the provider.
     * @param connectionPolicyConfigurator (Optional) An optional delegate that accepts a ConnectionPolicy for customizing policies.
     */
    constructor(settings, connectionPolicyConfigurator = null) {
        if (!settings) {
            throw new Error('The settings parameter is required.');
        }
        this.settings = Object.assign({}, settings);
        let policy = new documentdb_1.DocumentBase.ConnectionPolicy();
        if (connectionPolicyConfigurator && typeof connectionPolicyConfigurator === 'function') {
            connectionPolicyConfigurator(policy);
        }
        this.client = new documentdb_1.DocumentClient(settings.serviceEndpoint, { masterKey: settings.authKey }, policy);
    }
    /**
     * Loads store items from storage
     *
     * @param keys Array of item keys to read from the store.
     */
    read(keys) {
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
            return new Promise((resolve, reject) => {
                let storeItems = {};
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
                    });
                };
                // invoke the function
                getNext(query);
            });
        });
    }
    /**
     * Saves store items to storage.
     *
     * @param changes Map of items to write to storage.
     **/
    write(changes) {
        if (!changes) {
            throw new Error('Please provide a StoreItems with changes to persist.');
        }
        return this.ensureCollectionExists().then(() => {
            return Promise.all(Object.keys(changes).map(k => {
                let documentChange = {
                    id: sanitizeKey(k),
                    realId: k,
                    document: changes[k]
                };
                return new Promise((resolve, reject) => {
                    let handleCallback = (err, data) => err ? reject(err) : resolve();
                    let eTag = changes[k].eTag;
                    if (!eTag || eTag === '*') {
                        let uri = documentdb_1.UriFactory.createDocumentCollectionUri(this.settings.databaseId, this.settings.collectionId);
                        this.client.upsertDocument(uri, documentChange, { disableAutomaticIdGeneration: true }, handleCallback);
                    }
                    else if (eTag.length > 0) {
                        // Optimistic Update
                        let uri = documentdb_1.UriFactory.createDocumentUri(this.settings.databaseId, this.settings.collectionId, documentChange.id);
                        let ac = { type: 'IfMatch', condition: eTag };
                        this.client.replaceDocument(uri, documentChange, { accessCondition: ac }, handleCallback);
                    }
                    else {
                        reject(new Error('etag empty'));
                    }
                });
            })).then(() => { }); // void
        });
    }
    /**
     * Removes store items from storage
     *
     * @param keys Array of item keys to remove from the store.
     **/
    delete(keys) {
        return this.ensureCollectionExists().then(() => Promise.all(keys.map(k => new Promise((resolve, reject) => this.client.deleteDocument(documentdb_1.UriFactory.createDocumentUri(this.settings.databaseId, this.settings.collectionId, sanitizeKey(k)), (err, data) => err && err.code !== 404 ? reject(err) : resolve()))))) // handle notfound as Ok
            .then(() => { }); // void
    }
    ensureCollectionExists() {
        if (!this.collectionExists) {
            this.collectionExists = getOrCreateDatabase(this.client, this.settings.databaseId)
                .then(databaseLink => getOrCreateCollection(this.client, databaseLink, this.settings.collectionId));
        }
        return this.collectionExists;
    }
}
exports.CosmosDbSqlStorage = CosmosDbSqlStorage;
// Helpers
function getOrCreateDatabase(client, databaseId) {
    let querySpec = {
        query: 'SELECT * FROM root r WHERE r.id = @id',
        parameters: [{ name: '@id', value: databaseId }]
    };
    return new Promise((resolve, reject) => {
        client.queryDatabases(querySpec).toArray((err, results) => {
            if (err)
                return reject(err);
            if (results.length === 1)
                return resolve(results[0]._self);
            // create db
            client.createDatabase({ id: databaseId }, (err, databaseLink) => {
                if (err)
                    return reject(err);
                resolve(databaseLink._self);
            });
        });
    });
}
function getOrCreateCollection(client, databaseLink, collectionId) {
    let querySpec = {
        query: 'SELECT * FROM root r WHERE r.id=@id',
        parameters: [{ name: '@id', value: collectionId }]
    };
    return new Promise((resolve, reject) => {
        client.queryCollections(databaseLink, querySpec).toArray((err, results) => {
            if (err)
                return reject(err);
            if (results.length === 1)
                return resolve(results[0]._self);
            client.createCollection(databaseLink, { id: collectionId }, (err, collectionLink) => {
                if (err)
                    return reject(err);
                resolve(collectionLink._self);
            });
        });
    });
}
function sanitizeKey(key) {
    let badChars = ['\\', '?', '/', '#', '\t', '\n', '\r'];
    let sb = '';
    for (let iCh = 0; iCh < key.length; iCh++) {
        let ch = key[iCh];
        let isBad = false;
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
//# sourceMappingURL=cosmosDbSqlStorage.js.map