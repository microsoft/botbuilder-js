/**
 * @module botbuilder-azure
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Storage, StoreItems } from 'botbuilder';
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
 * Middleware that implements a BlobStorage based storage provider for a bot.
 *
 * @remarks
 * The BlobStorage implements its storage using a single Azure Storage Blob Container. Each entity
 * or StoreItem is serialized into a JSON string and stored in an individual text blob. Each blob
 * is named after the StoreItem key which is encoded and ensure it conforms a valid blob name.
 */
export declare class BlobStorage implements Storage {
    private settings;
    private client;
    private useEmulator;
    /**
     * Creates a new BlobStorage instance.
     * @param settings Settings for configuring an instance of BlobStorage.
     */
    constructor(settings: BlobStorageSettings);
    read(keys: string[]): Promise<StoreItems>;
    write(changes: StoreItems): Promise<void>;
    delete(keys: string[]): Promise<void>;
    /**
     * Get a blob name validated representation of an entity to be used as a key.
     * @param key The key used to identify the entity
     */
    private sanitizeKey(key);
    private checkContainerName(container);
    private ensureContainerExists();
    private createBlobService(storageAccountOrConnectionString, storageAccessKey, host);
    private denodeify<T>(thisArg, fn);
}
