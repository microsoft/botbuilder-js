/**
 * @module botbuilder-node
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Storage, StoreItems } from 'botbuilder-core-extensions';
/**
 * :package: **botbuilder**
 *
 * Additional settings for configuring an instance of `FileStorage`.
 */
export interface FileStorageSettings {
    /**
     * (Optional) path to the backing folder. The default is to use a `storage` folder off
     * the systems temporary directory.
     */
    path?: string;
}
/**
 * :package: **botbuilder**
 *
 * A file based storage provider.
 *
 * **Usage Example**
 *
 * ```JavaScript
 * ```
 */
export declare class FileStorage implements Storage {
    static nextTag: number;
    private pEnsureFolder;
    protected readonly path: string;
    /**
     * Creates a new instance of the storage provider.
     *
     * @param settings (Optional) setting to configure the provider.
     */
    constructor(settings?: FileStorageSettings);
    /**
     * Loads store items from storage
     *
     * @param keys Array of item keys to read from the store.
     **/
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
    private ensureFolder();
    private getFileName(key);
    private getFilePath(key);
    private hashCode(input);
}
