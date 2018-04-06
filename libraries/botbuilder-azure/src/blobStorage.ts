/**
 * @module botbuilder-azure
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Storage, StoreItems, StoreItem } from 'botbuilder';
import * as azure from 'azure-storage';

/** Additional settings for configuring an instance of [BlobStorage](../classes/botbuilder_azure_v4.blobstorage.html). */
export interface BlobStorageSettings {
    /** The storage account or the connection string. */
    storageAccountOrConnectionString: string;
    /** The storage access key. */
    storageAccessKey: string;
    /** The host address. */
    host: string;
    /** The Shared Access Signature token. */
    sasToken: string;
    /** The endpoint suffix. */
    endpointSuffix: string;
    /** The container name. */
    containerName: string;
}

/**
 * Internal data structure for storing items in BlobStorage
 */
interface DocumentStoreItem {
    /** Represents the Sanitized Key and used as name of blob */
    id: string;
    /** Represents the original Id/Key */
    realId: string;
    /** The item itself + eTag information */
    document: any;
}

let checkedCollections: { [key: string]: Promise<string>; } = {};

/**
 * Middleware that implements a BlobStorage based storage provider for a bot.
 */
export class BlobStorage implements Storage {
    private settings: BlobStorageSettings
    private client: azure.BlobService

    public constructor(settings: BlobStorageSettings) {
        if (!settings) {
            throw new Error('The settings parameter is required.');
        }

        this.settings = Object.assign({}, settings)

        this.client = new azure.BlobService(this.settings.storageAccountOrConnectionString, this.settings.storageAccessKey, this.settings.host, this.settings.sasToken, this.settings.endpointSuffix)
    }

    private sanitizeKey(key: string): string {
        let badChars = ['\\', '?', '/', '#', '\t', '\n', '\r'];
        let sb = '';
        for (let iCh = 0; iCh < key.length; iCh++) {
            let ch = key[iCh];
            let isBad: boolean = false;
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

    private ensureContainerExists(): Promise<string> {
        let key = this.settings.containerName;
        if (!checkedCollections[key]) {
            checkedCollections[key] = this.getOrCreateContainer();
        }
        return checkedCollections[key];
    }

    private getOrCreateContainer(): Promise<string> {
        return new Promise((resolve, reject) => {
            this.client.createContainerIfNotExists(this.settings.containerName, {}, err => {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.settings.containerName)
                }
            })
        })
    }
    
    /**
     * Loads store items from storage
     *
     * @param keys Array of item keys to read from the store.
     */
    read(keys: string[]): Promise<StoreItems> {
        let sanitizedKeys = keys.map((key) => this.sanitizeKey(key))
        return this.ensureContainerExists().then((containerName) => {
            return new Promise<StoreItems>((resolve, reject) => {
                let storeItems: StoreItems = {};
                let results = sanitizedKeys.map(key => {
                    this.client.getBlobToText(containerName, key, (err, content, blob) => {
                        if (err) {
                            return null
                        } else {
                            return JSON.parse(content)
                        }
                    });
                });
                resolve(storeItems);
            })
        })
    }

    /**
     * Saves store items to storage.
     *
     * @param changes Map of items to write to storage.
     **/
    write(changes: StoreItems): Promise<void> {
        return this.ensureContainerExists().then((containerName) => {
            return Promise.all(Object.keys(changes).map(k => {
                let documentChange: DocumentStoreItem = {
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
                                reject(err)
                            } else {
                                resolve(result)
                            }
                        })
                    }
                });
            }))
        }).then(() => { });
    }

    /**
     * Removes store items from storage
     *
     * @param keys Array of item keys to remove from the store.
     **/
    delete(keys: string[]): Promise<void> {
        return this.ensureContainerExists().then((containerName) => {
            Promise.all(keys.map(key => {
                new Promise((resolve, reject) => {
                    this.client.deleteBlobIfExists(containerName, this.sanitizeKey(key), (err, result) => err ? reject(err) : resolve(result))
                });
            }));
        }).then(() => { }); //void
    }
}