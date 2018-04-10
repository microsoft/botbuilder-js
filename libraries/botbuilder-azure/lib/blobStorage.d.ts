/// <reference types="node" />
/**
 * @module botbuilder-azure
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Storage, StoreItems } from 'botbuilder';
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
 * Middleware that implements a BlobStorage based storage provider for a bot.
 */
export declare class BlobStorage implements Storage {
    private settings;
    private client;
    constructor(settings: BlobStorageSettings);
    /**
     * Loads store items from storage.
     * Returns the values for the specified keys that were found in the container.
     *
     * @param keys Array of item keys to read from the store.
     */
    read(keys: string[]): Promise<StoreItems>;
    /**
     * Saves store items to storage.
     *
     * @param changes Map of items to write to storage.
     **/
    write(changes: StoreItems): Promise<void>;
    /**
     * Removes store items from storage
     *
     * @param keys Array of item keys to remove from the store.
     **/
    delete(keys: string[]): Promise<void>;
    private sanitizeKey(key);
    private checkContainerName(container);
    private ensureContainerExists();
    protected createBlobService(storageAccountOrConnectionString: string, storageAccessKey: string, host: any): BlobServiceAsync;
    private denodeify<T>(thisArg, fn);
}
export interface BlobServiceAsync extends azure.BlobService {
    createContainerIfNotExistsAsync(container: string): Promise<azure.BlobService.ContainerResult>;
    deleteContainerIfExistsAsync(container: string): Promise<boolean>;
    createBlockBlobFromTextAsync(container: string, blob: string, text: string | Buffer, options: azure.BlobService.CreateBlobRequestOptions): Promise<azure.BlobService.BlobResult>;
    getBlobMetadataAsync(container: string, blob: string): Promise<azure.BlobService.BlobResult>;
    getBlobToTextAsync(container: string, blob: string): Promise<azure.BlobService.BlobToText>;
    deleteBlobIfExistsAsync(container: string, blob: string): Promise<boolean>;
}
