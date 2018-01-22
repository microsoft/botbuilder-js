/**
 * @module botbuilder-azure-v4
 */
/** second comment block */
import { Storage, StorageSettings, StoreItems, StorageMiddleware } from 'botbuilder';
import * as azure from 'azure-storage';
/** Additional settings for configuring an instance of [TableStorage](../classes/botbuilder_azure_v4.tablestorage.html). */
export interface TableStorageSettings extends StorageSettings {
    /** Name of the table to use for storage. */
    tableName: string;
    /** Storage access key. */
    storageAccessKey?: string;
    /** (Optional) storage account to use or connection string. */
    storageAccountOrConnectionString?: string;
    /** (Optional) azure storage host. */
    host?: azure.StorageHost;
}
/**
 * Middleware that implements an Azure Table based storage provider for a bot.
 *
 * __Extends BotContext:__
 * * context.storage - Storage provider for storing and retrieving objects.
 *
 * **Usage Example**
 *
 * ```js
 * bot.use(new TableStorage({
 *      tableName: 'storage',
 *      storageAccountOrConnectionString: 'UseDevelopmentStorage=true'
 * }));
 * ```
*/
export declare class TableStorage extends StorageMiddleware<TableStorageSettings> implements Storage {
    private tableService;
    /**
     * Creates a new instance of the storage provider.
     *
     * @param settings (Optional) setting to configure the provider.
     */
    constructor(settings: TableStorageSettings);
    private sanitizeKey(key);
    /** Ensure the table is created. */
    ensureTable(): Promise<azure.TableService.TableResult>;
    /** Delete backing table (mostly used for unit testing.) */
    deleteTable(): Promise<boolean>;
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
}
