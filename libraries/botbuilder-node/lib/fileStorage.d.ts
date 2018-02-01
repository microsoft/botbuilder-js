/**
 * @module botbuilder-node
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Storage, StorageMiddleware, StorageSettings, StoreItems } from 'botbuilder';
/** Additional settings for configuring an instance of [FileStorage](../classes/botbuilder_node.filestorage.html). */
export interface FileStorageSettings extends StorageSettings {
    /**
     * (Optional) path to the backing folder. The default is to use a `storage` folder off
     * the systems temporary directory.
     */
    path?: string;
}
/**
 * Middleware that implements a file based storage provider for a bot.
 *
 * __Extends BotContext:__
 * * context.storage - Storage provider for storing and retrieving objects.
 *
 * **Usage Example**
 *
 * ```js
 * bot.use(new FileStorage({
 *      path: path.join(__dirname, 'storage')
 * }));
 * ```
 */
export declare class FileStorage extends StorageMiddleware<FileStorageSettings> implements Storage {
    private checked;
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
    /** INTERNAL method that returns the storage instance to be added to the context object. */
    protected getStorage(context: BotContext): Storage;
    private ensureFolder();
    private getFileName(key);
    private getFilePath(key);
    private hashCode(input);
}
