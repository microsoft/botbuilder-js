/**
 * @module botbuilder-node
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Storage, StoreItems } from 'botbuilder-core-extensions';
/**
 * A file based storage provider. Items will be persisted to a folder on disk.
 *
 * @remarks
 * The following example shows how to construct a configured instance of the provider:
 *
 * ```JavaScript
 * const { FileStorage } = require('botbuilder');
 * const path = require('path');
 *
 * const storage = new FileStorage(path.join(__dirname, './state'));
 * ```
 */
export declare class FileStorage implements Storage {
    protected readonly path: string;
    static nextTag: number;
    private pEnsureFolder;
    /**
     * Creates a new FileStorage instance.
     * @param path Root filesystem path for where the provider should store its items.
     */
    constructor(path: string);
    read(keys: string[]): Promise<StoreItems>;
    write(changes: StoreItems): Promise<void>;
    delete(keys: string[]): Promise<void>;
    private ensureFolder();
    private getFileName(key);
    private getFilePath(key);
}
