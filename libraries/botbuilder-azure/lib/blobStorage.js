"use strict";
/**
 * @module botbuilder-azure
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const querystring_1 = require("querystring");
const azure = require("azure-storage");
const ContainerNameCheck = new RegExp('^[a-z0-9](?!.*--)[a-z0-9-]{1,61}[a-z0-9]$');
let checkedCollections = {};
/**
 * Middleware that implements a BlobStorage based storage provider for a bot.
 */
class BlobStorage {
    constructor(settings) {
        if (!settings) {
            throw new Error('The settings parameter is required.');
        }
        if (!settings.containerName || !this.checkContainerName(settings.containerName)) {
            throw new Error('Invalid container name.');
        }
        this.settings = Object.assign({}, settings);
        this.client = this.createBlobService(this.settings.storageAccountOrConnectionString, this.settings.storageAccessKey, this.settings.host);
    }
    /**
     * Loads store items from storage
     *
     * @param keys Array of item keys to read from the store.
     */
    read(keys) {
        if (!keys) {
            throw new Error('The keys parameter is required.');
        }
        let sanitizedKeys = keys.filter(k => k).map((key) => this.sanitizeKey(key));
        return this.ensureContainerExists().then((container) => {
            return new Promise((resolve, reject) => {
                Promise.all(sanitizedKeys.map((key) => {
                    return new Promise((resolve, reject) => {
                        this.client.getBlobMetadataAsync(container.name, key).then((blobMetadata) => {
                            this.client.getBlobToTextAsync(blobMetadata.container, blobMetadata.name).then((result) => {
                                let document = JSON.parse(result);
                                document.document.eTag = blobMetadata.etag;
                                resolve(document);
                            }, err => resolve(null));
                        }, (err) => resolve(null));
                    });
                })).then((items) => {
                    if (items !== null && items.length > 0) {
                        let storeItems = {};
                        items.filter(x => x).forEach((item) => {
                            storeItems[item.realId] = item.document;
                        });
                        resolve(storeItems);
                    }
                });
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
            throw new Error('The changes parameter is required.');
        }
        return this.ensureContainerExists().then((container) => {
            let blobs = Object.keys(changes).map((key) => {
                let documentChange = {
                    id: this.sanitizeKey(key),
                    realId: key,
                    document: changes[key]
                };
                let payload = JSON.stringify(documentChange);
                let options = {
                    accessConditions: azure.AccessCondition.generateIfMatchCondition(changes[key].eTag)
                };
                return {
                    blob: documentChange.id,
                    payload: payload,
                    options: options
                };
            });
            let createBlob = (index, callback) => {
                let current = blobs[index];
                this.client.createBlockBlobFromTextAsync(container.name, current.blob, current.payload, current.options)
                    .then((result) => {
                    if (index < blobs.length - 1) {
                        createBlob(index + 1, callback);
                    }
                    else {
                        callback();
                    }
                }, (err) => callback(err));
            };
            return new Promise((resolve, reject) => {
                createBlob(0, (err) => err ? reject(err) : resolve());
            });
        });
    }
    /**
     * Removes store items from storage
     *
     * @param keys Array of item keys to remove from the store.
     **/
    delete(keys) {
        if (!keys) {
            throw new Error('The keys parameter is required.');
        }
        let sanitizedKeys = keys.filter(k => k).map((key) => this.sanitizeKey(key));
        return this.ensureContainerExists().then((container) => {
            return Promise.all(sanitizedKeys.map(key => {
                return this.client.deleteBlobIfExistsAsync(container.name, key);
            }));
        }).then(() => { }); //void
    }
    sanitizeKey(key) {
        let segments = key.split('/');
        let base = segments.splice(0)[0];
        // The number of path segments comprising the blob name cannot exceed 254
        let validKey = segments.reduce((acc, curr, index) => [acc, curr].join(index < 255 ? '/' : ''), base);
        // Reserved URL characters must be properly escaped.
        return querystring_1.escape(validKey).substr(0, 1024);
    }
    checkContainerName(container) {
        return ContainerNameCheck.test(container);
    }
    ensureContainerExists() {
        let key = this.settings.containerName;
        if (!checkedCollections[key]) {
            checkedCollections[key] = this.client.createContainerIfNotExistsAsync(key);
        }
        return checkedCollections[key];
    }
    createBlobService(storageAccountOrConnectionString, storageAccessKey, host) {
        if (!storageAccountOrConnectionString) {
            throw new Error('The storageAccountOrConnectionString parameter is required.');
        }
        const blobService = azure.createBlobService(storageAccountOrConnectionString, storageAccessKey, host).withFilter(new azure.LinearRetryPolicyFilter(5, 5));
        // create BlobServiceAsync by using denodeify to create promise wrappers around cb functions
        return {
            createContainerIfNotExistsAsync: this.denodeify(blobService, blobService.createContainerIfNotExists),
            deleteContainerIfExistsAsync: this.denodeify(blobService, blobService.deleteContainerIfExists),
            createBlockBlobFromTextAsync: this.denodeify(blobService, blobService.createBlockBlobFromText),
            getBlobMetadataAsync: this.denodeify(blobService, blobService.getBlobMetadata),
            getBlobToTextAsync: this.denodeify(blobService, blobService.getBlobToText),
            deleteBlobIfExistsAsync: this.denodeify(blobService, blobService.deleteBlobIfExists)
        };
    }
    // turn a cb based azure method into a Promisified one
    denodeify(thisArg, fn) {
        return (...args) => {
            return new Promise((resolve, reject) => {
                args.push((error, result) => (error) ? reject(error) : resolve(result));
                fn.apply(thisArg, args);
            });
        };
    }
}
exports.BlobStorage = BlobStorage;
//# sourceMappingURL=blobStorage.js.map