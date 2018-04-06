"use strict";
/**
 * @module botbuilder-azure
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const azure = require("azure-storage");
let checkedCollections = {};
/**
 * Middleware that implements a BlobStorage based storage provider for a bot.
 */
class BlobStorage {
    constructor(settings) {
        if (!settings) {
            throw new Error('The settings parameter is required.');
        }
        this.settings = Object.assign({}, settings);
        this.client = new azure.BlobService(this.settings.storageAccountOrConnectionString, this.settings.storageAccessKey, this.settings.host, this.settings.sasToken, this.settings.endpointSuffix);
    }
    sanitizeKey(key) {
        let badChars = ['\\', '?', '/', '#', '\t', '\n', '\r'];
        let sb = '';
        for (let iCh = 0; iCh < key.length; iCh++) {
            let ch = key[iCh];
            let isBad = false;
            for (let iBad in badChars) {
                let badChar = badChars[iBad];
                if (ch === badChar) {
                    sb += '%' + ch.charCodeAt(0).toString(16);
                    isBad = true;
                    break;
                }
            }
            if (!isBad)
                sb += ch;
        }
        return sb;
    }
    ensureContainerExists() {
        let key = this.settings.containerName;
        if (!checkedCollections[key]) {
            checkedCollections[key] = this.getOrCreateContainer();
        }
        return checkedCollections[key];
    }
    getOrCreateContainer() {
        return new Promise((resolve, reject) => {
            this.client.createContainerIfNotExists(this.settings.containerName, {}, err => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(this.settings.containerName);
                }
            });
        });
    }
    /**
     * Loads store items from storage
     *
     * @param keys Array of item keys to read from the store.
     */
    read(keys) {
        let sanitizedKeys = keys.map((key) => this.sanitizeKey(key));
        return this.ensureContainerExists().then((containerName) => {
            return new Promise((resolve, reject) => {
                let storeItems = {};
                let results = sanitizedKeys.map(key => {
                    this.client.getBlobToText(containerName, key, (err, content, blob) => {
                        if (err) {
                            return null;
                        }
                        else {
                            return JSON.parse(content);
                        }
                    });
                });
                resolve(storeItems);
            });
        });
    }
    /**
     * Saves store items to storage.
     *
     * @param changes Map of items to write to storage.
     **/
    write(changes) {
        return this.ensureContainerExists().then((containerName) => {
            return Promise.all(Object.keys(changes).map(k => {
                let documentChange = {
                    id: this.sanitizeKey(k),
                    realId: k,
                    document: changes[k]
                };
                return new Promise((resolve, reject) => {
                    let handleCallback = (err, data) => err ? reject(err) : resolve(data);
                    let eTag = changes[k].eTag;
                    if (!eTag || eTag === '*') {
                        this.client.createBlockBlobFromText(containerName, k, JSON.stringify(documentChange), (err, result) => {
                            if (err) {
                                reject(err);
                            }
                            else {
                                resolve(result);
                            }
                        });
                    }
                });
            }));
        }).then(() => { });
    }
    /**
     * Removes store items from storage
     *
     * @param keys Array of item keys to remove from the store.
     **/
    delete(keys) {
        return this.ensureContainerExists().then((containerName) => {
            Promise.all(keys.map(key => {
                new Promise((resolve, reject) => {
                    this.client.deleteBlobIfExists(containerName, this.sanitizeKey(key), (err, result) => err ? reject(err) : resolve(result));
                });
            }));
        }).then(() => { }); //void
    }
}
exports.BlobStorage = BlobStorage;
//# sourceMappingURL=blobStorage.js.map