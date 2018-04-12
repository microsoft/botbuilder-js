/**
 * @module botbuilder-azure
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Storage, StoreItems, StoreItem } from 'botbuilder';
import * as azure from 'azure-storage';
import { JsonDateReviver } from './utils';

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
 * Map of already initialized tables. Key = tableName, Value = Promise with TableResult creation.
 */
let checkedTables: { [name: string]: Promise<azure.TableService.TableResult>; } = {};

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
export class TableStorage implements Storage {

    private settings: TableStorageSettings;
    private tableService: TableServiceAsync;

    /**
     * Creates a new instance of the storage provider.
     *
     * @param settings Setting to configure the provider.
     */
    public constructor(settings: TableStorageSettings) {
        if (!settings) {
            throw new Error('The settings parameter is required.');
        }

        if (!/^[A-Za-z][A-Za-z0-9]{2,62}$/.test(settings.tableName)) {
            throw new Error('The table name contains invalid characters.')
        }

        this.settings = Object.assign({}, settings);
        this.tableService = this.createTableService(this.settings.storageAccountOrConnectionString, this.settings.storageAccessKey, this.settings.host)
    }

    /**
     * Loads store items from storage
     *
     * @param keys Array of item keys to read from the store.
     **/
    public read(keys: string[]): Promise<StoreItems> {
        if (!keys || !keys.length) {
            throw new Error('Please provide at least one key to read from storage.');
        }

        return this.ensureTable().then(() => {
            let readPromises = keys.map(key => {
                // get all items with the same PK as the sanitized(key)
                let query = new azure.TableQuery()
                    .where('PartitionKey eq ?', TableStorage.SanitizeKey(key));

                // convert chunks back into StoreItemContainer for reading
                return this.executeQuery<StoreItemEntity>(query)
                    .then(chunks => chunks.length ? StoreItemContainer.join(chunks) : null);
            });

            return Promise.all(readPromises)
                .then(results => results.filter(e => !!e))           // ignore null returns
                .then(results => results.reduce((acc, e) => {        // flatten as StoreItems
                    acc[e.key] = e.obj;
                    return acc;
                }, {}));
        });
    };

    /**
     * Saves store items to storage.
     *
     * @param changes Map of items to write to storage.
     **/
    public write(changes: StoreItems): Promise<void> {
        if (!changes) {
            throw new Error('Please provide a StoreItems with changes to persist.')
        }

        return this.ensureTable().then(() => {
            let batches = Object.keys(changes)
                .map(key => new StoreItemContainer(key, changes[key]))
                .map(entity => {

                    // Split entity into smaller chunks that fit within column max size and update (1)
                    // Then proceed to delete any remaining chunks that may remain from a previous object version (2)

                    let batch = new azure.TableBatch();

                    // (1)
                    let chunks = entity.split();
                    chunks.forEach(chunk => {
                        let eTag = chunk['.metadata'] ? chunk['.metadata'].etag : null;
                        if (eTag === null || eTag === "*") {
                            // When replacing with optimistic update, only check for the first chunk and replace the others directly
                            batch.insertOrReplaceEntity(chunk);
                        }
                        else if (eTag.length > 0) {
                            // Optimistic Update (first chunk only)
                            batch.replaceEntity(chunk);
                        }
                    });

                    // (2) Delete any remaining chunks from a previous obj version
                    let maxRowKey = chunks.length;
                    let query = new azure.TableQuery()
                        .select('PartitionKey', 'RowKey')
                        .where('PartitionKey eq ? && RowKey >= ?', TableStorage.SanitizeKey(entity.key), maxRowKey.toString());

                    // Retrieve and (if found) add to batch for deletion
                    return this.deleteInBatch(batch, query)
                        .then(batch => this.tableService.executeBatchAsync(this.settings.tableName, batch));
                });

            return Promise.all(batches)
                .then(result => { });           // void
        });
    };

    /**
     * Removes store items from storage
     *
     * @param keys Array of item keys to remove from the store.
     **/
    public delete(keys: string[]): Promise<void> {
        if (!keys || !keys.length) return Promise.resolve();

        return this.ensureTable().then(() => {
            // for each key, remove its rows based on PK
            let batches = keys.map(key => {
                let batch = new azure.TableBatch();
                let query = new azure.TableQuery()
                    .select('PartitionKey', 'RowKey')
                    .where('PartitionKey eq ?', TableStorage.SanitizeKey(key));
                return this.deleteInBatch(batch, query)
                    .then(batch => {
                        // no ops
                        if (!batch.operations.length) return Promise.resolve([]);
                        // execute
                        return this.tableService.executeBatchAsync(this.settings.tableName, batch)
                    });
            });

            return Promise.all(batches)
                .then(() => { });            // void
        });
    }

    public static SanitizeKey(key: string): string {
        let badChars = ['\\', '?', '/', '#', '\t', '\n', '\r'];
        let sb = '';
        for (let iCh = 0; iCh < key.length; iCh++) {
            let ch = key[iCh];
            let isBad: boolean = false;
            for (let iBad in badChars) {
                let badChar = badChars[iBad];
                if (ch === badChar) {
                    sb += '%' + ch.charCodeAt(0).toString(16);
                    isBad = true;
                    break;
                }
            }
            if (!isBad)
                sb += ch;
        }
        return sb;
    }

    /** Ensure the table is created. */
    private ensureTable(): Promise<azure.TableService.TableResult> {
        if (!checkedTables[this.settings.tableName])
            checkedTables[this.settings.tableName] = this.tableService.createTableIfNotExistsAsync(this.settings.tableName);
        return checkedTables[this.settings.tableName];
    }

    private executeQuery<T>(query: azure.TableQuery): Promise<T[]> {
        return new Promise<T[]>((resolve, reject) => {
            let collected: T[] = [];
            let getNext = (query, token: azure.TableService.TableContinuationToken = null) => {
                this.tableService.queryEntitiesAsync<T>(this.settings.tableName, query, token, null)
                    .then(queryResults => {

                        // append items
                        collected = collected.concat(queryResults.entries);

                        if (queryResults.continuationToken) {
                            // continue reading
                            getNext(query, queryResults.continuationToken);
                        } else {
                            // collect and return
                            resolve(collected);
                        }
                    }).catch(reject);
            }

            getNext(query);
        });
    }

    private deleteInBatch(batch: azure.TableBatch, deleteQuery: azure.TableQuery): Promise<azure.TableBatch> {
        // retrieve all row based on query
        return this.executeQuery<any>(deleteQuery)
            .then(rows => {
                // empty
                if (!rows.length) return batch;

                // batch delete using PrimaryKey and RowKey
                // let batch = new azure.TableBatch();
                rows.map(r => ({
                    PartitionKey: r.PartitionKey,
                    RowKey: r.RowKey,
                    '.metadata': { etag: '*' }
                })).forEach(r => batch.deleteEntity(r));

                return batch;
            });
    }

    private createTableService(storageAccountOrConnectionString: string, storageAccessKey: string, host: any): TableServiceAsync {
        const tableService = storageAccountOrConnectionString ? azure.createTableService(storageAccountOrConnectionString, storageAccessKey, host) : azure.createTableService();

        // create TableServiceAsync by using denodeify to create promise wrappers around cb functions
        return {
            createTableIfNotExistsAsync: this.denodeify(tableService, tableService.createTableIfNotExists),
            deleteTableIfExistsAsync: this.denodeify(tableService, tableService.deleteTableIfExists),
            retrieveEntityAsync: this.denodeify(tableService, tableService.retrieveEntity),
            insertOrReplaceEntityAsync: this.denodeify(tableService, tableService.insertOrReplaceEntity),
            replaceEntityAsync: this.denodeify(tableService, tableService.replaceEntity),
            deleteEntityAsync: this.denodeify(tableService, tableService.deleteEntity),
            queryEntitiesAsync: this.denodeify(tableService, tableService.queryEntities),
            executeBatchAsync: this.denodeify(tableService, tableService.executeBatch)
        } as any;
    }

    // turn a cb based azure method into a Promisified one
    private denodeify<T>(thisArg: any, fn: Function): (...args: any[]) => Promise<T> {
        return (...args: any[]) => {
            return new Promise<T>((resolve, reject) => {
                args.push((error: Error, result: any) => (error) ? reject(error) : resolve(result));
                fn.apply(thisArg, args);
            });
        };
    }
}

// Promise based methods created using denodeify function
interface TableServiceAsync extends azure.TableService {
    createTableIfNotExistsAsync(table: string): Promise<azure.TableService.TableResult>;
    deleteTableIfExistsAsync(table: string): Promise<boolean>;

    retrieveEntityAsync<T>(table: string, partitionKey: string, rowKey: string): Promise<T>;
    replaceEntityAsync<T>(table: string, entityDescriptor: T): Promise<azure.TableService.EntityMetadata>;
    insertOrReplaceEntityAsync<T>(table: string, entityDescriptor: T): Promise<azure.TableService.EntityMetadata>;
    deleteEntityAsync<T>(table: string, entityDescriptor: T): Promise<void>;

    queryEntitiesAsync<T>(table: string, tableQuery: azure.TableQuery, currentToken: azure.TableService.TableContinuationToken, options: azure.TableService.TableEntityRequestOptions): Promise<azure.TableService.QueryEntitiesResult<T>>;
    executeBatchAsync(table: string, batch: azure.TableBatch): Promise<azure.TableService.BatchResult[]>;
}

/**
 * Internal data structure for splitting items into smaller pieces and overcome Azure Table Row size limit.
 * More info: https://docs.microsoft.com/en-us/rest/api/storageservices/understanding-the-table-service-data-model#property-types
 */
export class StoreItemContainer {
    public static readonly MaxRowSize = 32 * 1024;
    public readonly key: string;
    public readonly obj: any;
    public readonly eTag: string;

    constructor(key: string, obj: any) {
        this.key = key;
        this.obj = obj;
        this.eTag = !!obj.eTag ? obj.eTag : null;
    }

    public split(): StoreItemEntity[] {
        let entGen = azure.TableUtilities.entityGenerator

        let json = JSON.stringify(this.obj);
        let chunks = this.sliceString(json, StoreItemContainer.MaxRowSize);
        return chunks.map((chunk, ix) => ({
            PartitionKey: entGen.String(TableStorage.SanitizeKey(this.key)),
            RowKey: entGen.String(ix.toString()),
            RealKey: entGen.String(this.key),
            Json: entGen.String(chunk),
            '.metadata': !!this.eTag && ix === 0 ? { etag: this.eTag } : null           // save etag as metadata for first element only
        }));
    }

    public static join(chunks: StoreItemEntity[]): StoreItemContainer {
        let ordered = chunks.sort((i1, i2) => parseInt(i1.RowKey._, 10) - parseInt(i2.RowKey._, 10));
        let key = ordered[0].RealKey._;
        let eTag = ordered[0]['.metadata'] ? ordered[0]['.metadata'].etag : null;
        let json = ordered.map(o => o.Json._).join('');

        let obj: any = JSON.parse(json, JsonDateReviver);
        if (eTag) obj.eTag = eTag;

        return new StoreItemContainer(key, obj);
    }

    private sliceString(str, sliceLen) {
        let chunks: string[] = [];
        let strLen: number = str.length;
        for (let ix: number = 0; ix < strLen; ix += sliceLen) {
            chunks.push(str.slice(ix, sliceLen + ix));
        }

        return chunks;
    }
}

/**
 * Internal data structure for storing items in Azure Tables
 */
export interface StoreItemEntity {
    PartitionKey: azure.TableUtilities.entityGenerator.EntityProperty<string>,
    RowKey: azure.TableUtilities.entityGenerator.EntityProperty<string>,
    RealKey: azure.TableUtilities.entityGenerator.EntityProperty<string>,
    Json: azure.TableUtilities.entityGenerator.EntityProperty<string>
}
