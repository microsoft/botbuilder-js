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

/** A host address. */
export interface Host {
    /** Primary host address. */
    primaryHost: string;

    /** Secondary host address. */
    secondaryHost: string;
}

/** 
 * Settings for configuring an instance of `BlobStorage`. 
 */
export interface BlobStorageSettings {
    /** Root container name to use. */
    containerName: string;

    /** The storage account or the connection string. */
    storageAccountOrConnectionString: string;

    /** The storage access key. */
    storageAccessKey: string;

    /** (Optional) azure storage host. */
    host?: string | Host;
}

/**
 * @private
 * Internal data structure for storing items in BlobStorage.
 */
interface DocumentStoreItem {
    /** Represents the Sanitized Key and used as name of blob */
    id: string;
    /** Represents the original Id/Key */
    realId: string;
    /** The item itself + eTag information */
    document: any;
}

/**
 * @private
 */
const ContainerNameCheck = new RegExp('^[a-z0-9](?!.*--)[a-z0-9-]{1,61}[a-z0-9]$');

/**
 * @private
 */
const ResolvePromisesSerial = (values, promise) => values.map(value => () => promise(value)).reduce((promise, func) => promise.then(result => func().then(Array.prototype.concat.bind(result))), Promise.resolve([]));

/**
 * @private
 */
const ResolvePromisesParallel = (values, promise) => Promise.all(values.map(promise));


/**
 * @private
 * Internal dictionary with the containers where entities will be stored.
 */
const checkedCollections: { [key: string]: Promise<azure.BlobService.ContainerResult>; } = {};



/**
 * Middleware that implements a BlobStorage based storage provider for a bot.
 * 
 * @remarks
 * The BlobStorage implements its storage using a single Azure Storage Blob Container. Each entity 
 * or StoreItem is serialized into a JSON string and stored in an individual text blob. Each blob 
 * is named after the StoreItem key which is encoded and ensure it conforms a valid blob name.
 */
export class BlobStorage implements Storage {
    private settings: BlobStorageSettings
    private client: BlobServiceAsync
    private useEmulator: boolean

    /**
     * Creates a new BlobStorage instance.
     * @param settings Settings for configuring an instance of BlobStorage.
     */
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
        this.useEmulator = settings.storageAccountOrConnectionString == 'UseDevelopmentStorage=true;';
    }

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
                    accessConditions: azure.AccessCondition.generateIfMatchCondition(changes[key].eTag),
                    parallelOperationThreadCount: 4
                };

                return {
                    id: documentChange.id,
                    data: payload,
                    options: options
                };
            });

            let promise = (blob) => this.client.createBlockBlobFromTextAsync(container.name, blob.id, blob.data, blob.options);

            // if the blob service client is using the storage emulator, all write operations must be performed in a sequential mode
            // because of the storage emulator internal implementation, that includes a SQL LocalDb
            // that crash with a deadlock when performing parallel uploads.
            // This behavior does not occur when using an Azure Blob Storage account.
            let results = this.useEmulator ? ResolvePromisesSerial(blobs, promise) : ResolvePromisesParallel(blobs, promise);

            return results.then(() => { }); //void
        });
    }

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

    /**
     * Get a blob name validated representation of an entity to be used as a key.
     * @param key The key used to identify the entity
     */
    private sanitizeKey(key: string): string {
        if (!key || key.length < 1) {
            throw new Error('Please provide a not empty key.');
        }

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

    private createBlobService(storageAccountOrConnectionString: string, storageAccessKey: string, host: any): BlobServiceAsync {
        if (!storageAccountOrConnectionString) {
            throw new Error('The storageAccountOrConnectionString parameter is required.');
        }

        const blobService = azure.createBlobService(storageAccountOrConnectionString, storageAccessKey, host).withFilter(new azure.LinearRetryPolicyFilter(5, 500));

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

/**
 * @private
 * Promise based methods created using denodeify function
 */
interface BlobServiceAsync extends azure.BlobService {
    createContainerIfNotExistsAsync(container: string): Promise<azure.BlobService.ContainerResult>;
    deleteContainerIfExistsAsync(container: string): Promise<boolean>;

    createBlockBlobFromTextAsync(container: string, blob: string, text: string | Buffer, options: azure.BlobService.CreateBlobRequestOptions): Promise<azure.BlobService.BlobResult>;
    getBlobMetadataAsync(container: string, blob: string): Promise<azure.BlobService.BlobResult>;
    getBlobToTextAsync(container: string, blob: string): Promise<azure.BlobService.BlobToText>;
    deleteBlobIfExistsAsync(container: string, blob: string): Promise<boolean>;
}