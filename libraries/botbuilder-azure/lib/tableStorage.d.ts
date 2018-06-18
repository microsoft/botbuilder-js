/**
 * @module botbuilder-azure
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Storage, StoreItems } from 'botbuilder';
import * as azure from 'azure-storage';
import { Host } from './blobStorage';
/**
 * Additional settings for configuring an instance of `TableStorage`.
 */
export interface TableStorageSettings {
    /**
     * Name of the table to use for storage.
     *
     * @remarks
     * Check table name rules: https://docs.microsoft.com/en-us/rest/api/storageservices/Understanding-the-Table-Service-Data-Model?redirectedfrom=MSDN#table-names
    */
    tableName: string;
    /** (Optional) storage access key. */
    storageAccessKey?: string;
    /** (Optional) storage account to use or connection string. */
    storageAccountOrConnectionString?: string;
    /** (Optional) azure storage host. */
    host?: Host;
}
/**
 * Middleware that implements an Azure Table based storage provider for a bot.
 *
 * @remarks
 * This example shows the typical creation and configuration pattern:
 *
 * ```JavaScript
 * const { TableStorage } = require('botbuilder-azure');
 *
 * const storage = new TableStorage({
 *     storageAccountOrConnectionString: 'UseDevelopmentStorage=true',
 *     tableName: 'mybotstate'
 * });
 * ```
*/
export declare class TableStorage implements Storage {
    private settings;
    private tableService;
    /**
     * Creates a new TableStorage instance.
     * @param settings Setting required to configure the provider.
     */
    constructor(settings: TableStorageSettings);
    /** Ensure the table is created. */
    ensureTable(): Promise<azure.TableService.TableResult>;
    /** Delete backing table (mostly used for unit testing.) */
    deleteTable(): Promise<boolean>;
    read(keys: string[]): Promise<StoreItems>;
    write(changes: StoreItems): Promise<void>;
    delete(keys: string[]): Promise<void>;
    private sanitizeKey(key);
    private createTableService(storageAccountOrConnectionString, storageAccessKey, host);
    private denodeify<T>(thisArg, fn);
}
