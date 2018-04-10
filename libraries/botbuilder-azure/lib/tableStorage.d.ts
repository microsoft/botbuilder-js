/**
 * @module botbuilder-azure
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Storage, StoreItems } from 'botbuilder';
import * as azure from 'azure-storage';
/** Additional settings for configuring an instance of [TableStorage](../classes/botbuilder_azure_v4.tablestorage.html). */
export interface TableStorageSettings {
    /** Name of the table to use for storage.
     *  Check table name rules: https://docs.microsoft.com/en-us/rest/api/storageservices/Understanding-the-Table-Service-Data-Model?redirectedfrom=MSDN#table-names
    */
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
 * **Usage Example**
 *
 * ```javascript
 * const BotBuilderAzure = require('botbuilder-azure');
 * const storage = new BotBuilderAzure.TableStorage({
 *     storageAccountOrConnectionString: 'UseDevelopmentStorage=true',
 *     tableName: 'mybotstate'
 *   });
 *
 * // Add state middleware
 * const state = new BotStateManager(storage);
 * adapter.use(state);
 * ```
*/
export declare class TableStorage implements Storage {
    private settings;
    private tableService;
    /**
     * Creates a new instance of the storage provider.
     *
     * @param settings Setting to configure the provider.
     */
    constructor(settings: TableStorageSettings);
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
    static SanitizeKey(key: string): string;
    /** Ensure the table is created. */
    private ensureTable();
    private executeQuery<T>(query);
    private deleteInBatch(batch, deleteQuery);
    private createTableService(storageAccountOrConnectionString, storageAccessKey, host);
    private denodeify<T>(thisArg, fn);
}
/**
 * Internal data structure for splitting items into smaller pieces and overcome Azure Table Row size limit.
 * More info: https://docs.microsoft.com/en-us/rest/api/storageservices/understanding-the-table-service-data-model#property-types
 */
export declare class StoreItemContainer {
    static readonly MaxRowSize: number;
    readonly key: string;
    readonly obj: any;
    readonly eTag: string;
    constructor(key: string, obj: any);
    split(): StoreItemEntity[];
    static join(chunks: StoreItemEntity[]): StoreItemContainer;
    private sliceString(str, sliceLen);
}
/**
 * Internal data structure for storing items in Azure Tables
 */
export interface StoreItemEntity {
    PartitionKey: azure.TableUtilities.entityGenerator.EntityProperty<string>;
    RowKey: azure.TableUtilities.entityGenerator.EntityProperty<string>;
    RealKey: azure.TableUtilities.entityGenerator.EntityProperty<string>;
    Json: azure.TableUtilities.entityGenerator.EntityProperty<string>;
}
