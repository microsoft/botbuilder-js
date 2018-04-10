/**
 * @module botbuilder-azure
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Storage, StoreItems, StoreItem } from 'botbuilder';
import { escape } from 'querystring';
import * as azure from 'azure-storage';

/** The host address. */
export interface Host {
    primaryHost: string;
    secondaryHost: string;
}

/** Additional settings for configuring an instance of [BlobStorage](../classes/botbuilder_azure_v4.blobstorage.html). */
export interface BlobStorageSettings {
    /** The storage account or the connection string. */
    storageAccountOrConnectionString: string;
    /** The storage access key. */
    storageAccessKey: string;
    /** The host address. */
    host: string | Host;
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

const ContainerNameCheck = new RegExp('^[a-z0-9](?!.*--)[a-z0-9-]{1,61}[a-z0-9]$');

let checkedCollections: { [key: string]: Promise<azure.BlobService.ContainerResult>; } = {};

/**
 * Middleware that implements a BlobStorage based storage provider for a bot.
 */
export class BlobStorage implements Storage {
    private settings: BlobStorageSettings
    private client: BlobServiceAsync

    public constructor(settings: BlobStorageSettings) {
        if (!settings) {
            throw new Error('The settings parameter is required.');
        }

        if (!settings.containerName) {
            throw new Error('The containerName is required.');
        }

        if (!this.checkContainerName(settings.containerName)) {
            throw new Error('Invalid container name.');
        }

        this.settings = Object.assign({}, settings)
        this.client = this.createBlobService(this.settings.storageAccountOrConnectionString, this.settings.storageAccessKey, this.settings.host);
    }

    /**
     * Loads store items from storage.
     * Returns the values for the specified keys that were found in the container.
     *
     * @param keys Array of item keys to read from the store.
     */
    read(keys: string[]): Promise<StoreItems> {
        if (!keys) {
            throw new Error('Please provide at least one key to read from storage.');
        }

        let sanitizedKeys = keys.filter(k => k).map((key) => this.sanitizeKey(key))
        return this.ensureContainerExists().then((container) => {
            return new Promise<StoreItems>((resolve, reject) => {
                Promise.all<DocumentStoreItem>(sanitizedKeys.map((key) => {
                    return new Promise((resolve, reject) => {
                        this.client.getBlobMetadataAsync(container.name, key).then((blobMetadata) => {
                            this.client.getBlobToTextAsync(blobMetadata.container, blobMetadata.name).then((result) => {
                                let document: DocumentStoreItem = JSON.parse(result as any);
                                document.document.eTag = blobMetadata.etag;
                                resolve(document);
                            }, err => resolve(null));
                        }, (err) => resolve(null));
                    });
                })).then((items) => {
                    if (items !== null && items.length > 0) {
                        let storeItems: StoreItems = {};
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
    write(changes: StoreItems): Promise<void> {
        if (!changes) {
            throw new Error('Please provide a StoreItems with changes to persist.');
        }

        return this.ensureContainerExists().then((container) => {
            let blobs = Object.keys(changes).map((key) => {
                let documentChange: DocumentStoreItem = {
                    id: this.sanitizeKey(key),
                    realId: key,
                    document: changes[key]
                };

                let payload = JSON.stringify(documentChange);
                let options: azure.BlobService.CreateBlobRequestOptions = {
                    accessConditions: azure.AccessCondition.generateIfMatchCondition(changes[key].eTag)
                }

                return {
                    blob: documentChange.id,
                    payload: payload,
                    options: options
                }

            });
            let createBlob = (index, callback) => {
                let current = blobs[index]
                this.client.createBlockBlobFromTextAsync(container.name, current.blob, current.payload, current.options)
                .then((result) => {
                    if (index < blobs.length - 1) {
                        createBlob(index + 1, callback)
                    } else {
                        callback()
                    }

                }, (err) => callback(err));
            }

            return new Promise<void>((resolve, reject) => {
                createBlob(0, (err) => err ? reject(err) : resolve())
            });
        });
    }

    /**
     * Removes store items from storage
     *
     * @param keys Array of item keys to remove from the store.
     **/
    delete(keys: string[]): Promise<void> {
        if (!keys) {
            throw new Error('Please provide at least one key to delete from storage.');
        }

        let sanitizedKeys = keys.filter(k => k).map((key) => this.sanitizeKey(key))
        return this.ensureContainerExists().then((container) => {
            return Promise.all(sanitizedKeys.map(key => {
                return this.client.deleteBlobIfExistsAsync(container.name, key);
            }));
        }).then(() => { }); //void
    }

    private sanitizeKey(key: string): string {
        let segments = key.split('/');
        let base = segments.splice(0)[0];
        // The number of path segments comprising the blob name cannot exceed 254
        let validKey = segments.reduce((acc, curr, index) => [acc, curr].join(index < 255 ? '/' : ''), base);
        // Reserved URL characters must be escaped.
        return escape(validKey).substr(0, 1024);
    }

    private checkContainerName(container: string): boolean {
        return ContainerNameCheck.test(container);
    }

    private ensureContainerExists(): Promise<azure.BlobService.ContainerResult> {
        let key = this.settings.containerName;
        if (!checkedCollections[key]) {
            checkedCollections[key] = this.client.createContainerIfNotExistsAsync(key);
        }
        return checkedCollections[key];
    }
    
    protected createBlobService(storageAccountOrConnectionString: string, storageAccessKey: string, host: any): BlobServiceAsync {
        if (!storageAccountOrConnectionString) {
            throw new Error('The storageAccountOrConnectionString parameter is required.');
        }

        const blobService = azure.createBlobService(storageAccountOrConnectionString, storageAccessKey, host).withFilter(new azure.LinearRetryPolicyFilter(5, 5));

        // create BlobServiceAsync by using denodeify to create promise wrappers around cb functions
        return {
            createContainerIfNotExistsAsync: this.denodeify(blobService, blobService.createContainerIfNotExists),
            deleteContainerIfExistsAsync: this.denodeify(blobService, blobService.deleteContainerIfExists),
            
            createBlockBlobFromTextAsync : this.denodeify(blobService, blobService.createBlockBlobFromText),
            getBlobMetadataAsync: this.denodeify(blobService, blobService.getBlobMetadata),
            getBlobToTextAsync: this.denodeify(blobService, blobService.getBlobToText),
            deleteBlobIfExistsAsync: this.denodeify(blobService, blobService.deleteBlobIfExists)
        } as any;
    }

    // turn a cb based azure method into a Promisified one
    private denodeify<T>(thisArg: any, fn: Function): (...args: any[]) => Promise<T> {
        return (...args: any[]) => {
            return new Promise<T>((resolve, reject) => {
                args.push((error: Error, result: any) => (error) ? reject(error) : resolve(result));
                fn.apply(thisArg, args);
            });
        };
    }
}

// Promise based methods created using denodeify function
export interface BlobServiceAsync extends azure.BlobService {
    createContainerIfNotExistsAsync(container: string): Promise<azure.BlobService.ContainerResult>;
    deleteContainerIfExistsAsync(container: string): Promise<boolean>;

    createBlockBlobFromTextAsync(container: string, blob: string, text: string | Buffer, options: azure.BlobService.CreateBlobRequestOptions): Promise<azure.BlobService.BlobResult>;
    getBlobMetadataAsync(container: string, blob: string): Promise<azure.BlobService.BlobResult>;
    getBlobToTextAsync(container: string, blob: string): Promise<azure.BlobService.BlobToText>;
    deleteBlobIfExistsAsync(container: string, blob: string): Promise<boolean>;
}