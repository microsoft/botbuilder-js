/**
 * @module botbuilder-azure
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Storage, StoreItems } from 'botbuilder';
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
 * Middleware that implements a BlobStorage based storage provider for a bot.
 */
export declare class BlobStorage implements Storage {
    private settings;
    private client;
    constructor(settings: BlobStorageSettings);
    private sanitizeKey(key);
    private ensureContainerExists();
    private getOrCreateContainer();
    /**
     * Loads store items from storage
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
}
