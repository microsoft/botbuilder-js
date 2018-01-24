/**
 * @module botbuilder-node
 */
/** second comment block */
import { Storage, StoreItems } from 'botbuilder-storage';
/** Settings for configuring an instance of [FileStorage](../classes/botbuilder_node.filestorage.html). */
export interface FileStorageSettings {
    /**
     * (Optional) path to the backing folder. The default is to use a `storage` folder off
     * the systems temporary directory.
     */
    path?: string;
}
/**
 * File based storage provider for a bot.
 */
export declare class FileStorage implements Storage {
    private settings;
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
    private ensureFolder();
    private getFileName(key);
    private getFilePath(key);
    private hashCode(input);
}
