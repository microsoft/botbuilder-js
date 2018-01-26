/**
 * @module botbuilder-azure-v4
 */
/** second comment block */
import { Storage, StorageMiddleware, StorageSettings, StoreItem, StoreItems } from 'botbuilder';
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

let checkedTables: { [name: string]: Promise<azure.TableService.TableResult>; } = {};

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
export class TableStorage extends StorageMiddleware<TableStorageSettings> implements Storage {
    private tableService: TableServiceAsync;

    /**
     * Creates a new instance of the storage provider.
     *
     * @param settings (Optional) setting to configure the provider.
     */
    public constructor(settings: TableStorageSettings) {
        super(settings);

        if (this.settings.storageAccountOrConnectionString) {
            this.tableService = <TableServiceAsync>azure.createTableService(this.settings.storageAccountOrConnectionString as string, this.settings.storageAccessKey as string, this.settings.host);
        } else {
            // uses environment variables
            this.tableService = <TableServiceAsync>azure.createTableService();
        }

        // create TableServiceAsync by using denodeify to create promise wrappers around cb functions
        this.tableService.createTableIfNotExistsAsync = denodeify(this.tableService, this.tableService.createTableIfNotExists);
        this.tableService.deleteTableIfExistsAsync = denodeify(this.tableService, this.tableService.deleteTableIfExists);

        this.tableService.retrieveEntityAsync = denodeify(this.tableService, this.tableService.retrieveEntity);
        this.tableService.insertOrReplaceEntityAsync = denodeify(this.tableService, this.tableService.insertOrReplaceEntity);
        this.tableService.replaceEntityAsync = denodeify(this.tableService, this.tableService.replaceEntity);
        this.tableService.deleteEntityAsync = denodeify(this.tableService, this.tableService.deleteEntity);
    }

    /** Ensure the table is created. */
    public ensureTable(): Promise<azure.TableService.TableResult> {
        if (!checkedTables[this.settings.tableName]) {
            checkedTables[this.settings.tableName] = this.tableService.createTableIfNotExistsAsync(this.settings.tableName);
        }
        return checkedTables[this.settings.tableName];
    }

    /** Delete backing table (mostly used for unit testing.) */
    public deleteTable(): Promise<boolean> {
        if (checkedTables[this.settings.tableName]) {
            delete checkedTables[this.settings.tableName];
        }
        return this.tableService.deleteTableIfExistsAsync(this.settings.tableName);
    }

    /**
     * Loads store items from storage
     *
     * @param keys Array of item keys to read from the store.
     **/
    public read(keys: string[]): Promise<StoreItems> {
        let storeItems: StoreItems = {};
        return this.ensureTable()
            .then((created) => {
                let promises: Promise<void>[] = [];

                // foreach key, get a promise for the entity
                for (let iKey in keys) {
                    let key = keys[iKey];
                    const entityKey = this.sanitizeKey(key);

                    // fetch entity
                    promises.push(this.tableService.retrieveEntityAsync<void>(this.settings.tableName, entityKey, '0')
                        .then((result) => {
                                let entity: any = result;
                                let storeItem: StoreItem = JSON.parse(entity.json._);
                                storeItem.eTag = entity['.metadata'].etag;
                                storeItems[key] = storeItem;
                            },
                            (error) => {
                                if ((<any>error).statusCode === 404) {
                                    // we treat as null result
                                    return;
                                } else {
                                    throw error;
                                }
                            }));
                }
                // wait for all promises to complete
                return Promise.all(promises)
                // return storeItems result
                    .then(result => storeItems);
            });
    }


    /**
     * Saves store items to storage.
     *
     * @param changes Map of items to write to storage.
     **/
    public write(changes: StoreItems): Promise<void> {
        return this.ensureTable()
            .then((created) => {
                let promises: Promise<azure.TableService.EntityMetadata>[] = [];
                // foreach key => change
                for (let key in changes) {
                    let storeItem: StoreItem = changes[key];
                    var entityKey = this.sanitizeKey(key);
                    // create entity for the json
                    let entGen = azure.TableUtilities.entityGenerator;
                    let entity = {
                        PartitionKey: entGen.String(entityKey),
                        RowKey: entGen.String('0'),
                        json: entGen.String(JSON.stringify(storeItem))
                    };
                    let metadata = {etag: storeItem.eTag};
                    (<any>entity)['.metadata'] = metadata;

                    if (storeItem.eTag == null || storeItem.eTag === '*') {
                        // if new item or * then insert or replace unconditionaly
                        promises.push(this.tableService.insertOrReplaceEntityAsync(this.settings.tableName, entity));
                    } else if (storeItem.eTag.length > 0) {
                        // if we have an etag, do opt. concurrency replace
                        promises.push(this.tableService.replaceEntityAsync(this.settings.tableName, entity));
                    } else {
                        // bogus etag, it's empty string
                        throw new Error('etag empty');
                    }
                }
                return Promise.all(promises)
                    .then(result => {
                    });
            });
    }

    /**
     * Removes store items from storage
     *
     * @param keys Array of item keys to remove from the store.
     **/
    public delete(keys: string[]): Promise<void> {
        return this.ensureTable()
            .then((created) => {
                let promises: Promise<void>[] = [];
                let entGen = azure.TableUtilities.entityGenerator;
                // foreach key to delete
                for (let iKey in keys) {
                    let key = keys[iKey];
                    let entityKey = this.sanitizeKey(key);
                    // create entity for it with * etag
                    let entity = {
                        PartitionKey: entGen.String(entityKey),
                        RowKey: entGen.String('0')
                    };
                    let metadata = {etag: '*'};
                    (<any>entity)['.metadata'] = metadata;
                    // delete it
                    promises.push(this.tableService.deleteEntityAsync(this.settings.tableName, entity)
                        .catch(error => {
                        }));
                }
                // wait for promises to complete
                return Promise.all(promises)
                    .then(result => {
                    });
            });
    }

    /** INTERNAL method that returns the storage instance to be added to the context object. */
    protected getStorage(context: BotContext): Storage {
        return this;
    }

    private sanitizeKey(key: string): string {
        let badChars = ['\\', '?', '/', '#', '\t', '\n', '\r'];
        let sb = '';
        for (let iCh = 0; iCh < key.length; iCh++) {
            let ch = key[iCh];
            let isBad = false;
            for (let iBad in badChars) {
                let badChar = badChars[iBad];
                if (ch === badChar) {
                    sb += '%' + ch.charCodeAt(0).toString(16);
                    isBad = true;
                    break;
                }
            }
            if (!isBad) {
                sb += ch;
            }
        }
        return sb;
    }
}

// turn a cb based azure method into a Promisified one
function denodeify<T>(thisArg: any, fn: Function): (...args: any[]) => Promise<T> {
    return (...args: any[]) => {
        return new Promise<T>((resolve, reject) => {
            args.push((error: Error, result: any) => (error) ? reject(error) : resolve(result));
            fn.apply(thisArg, args);
        });
    };
}

// Promise based methods created using denodeify function
interface TableServiceAsync extends azure.TableService {
    createTableIfNotExistsAsync(table: string): Promise<azure.TableService.TableResult>;

    deleteTableIfExistsAsync(table: string): Promise<boolean>;

    retrieveEntityAsync<T>(table: string, partitionKey: string, rowKey: string): Promise<T>;

    replaceEntityAsync<T>(table: string, entityDescriptor: T): Promise<azure.TableService.EntityMetadata>;

    insertOrReplaceEntityAsync<T>(table: string, entityDescriptor: T): Promise<azure.TableService.EntityMetadata>;

    deleteEntityAsync<T>(table: string, entityDescriptor: T): Promise<void>;
}

