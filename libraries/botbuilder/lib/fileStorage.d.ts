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
 * A file based storage provider.
 *
 * **Usage Example**
 *
 * ```JavaScript
 * ```
 */
export declare class FileStorage implements Storage {
    protected readonly path: string;
    static nextTag: number;
    private pEnsureFolder;
    /**
     * Creates a new instance of the storage provider.
     *
     * @param path Root filesystem path for where the provider should store its objects.
     */
    constructor(path: string);
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
}
