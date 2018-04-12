"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const azure = require("azure-storage");
const utils_1 = require("./utils");
/**
 * Map of already initialized tables. Key = tableName, Value = Promise with TableResult creation.
 */
let checkedTables = {};
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
class TableStorage {
    /**
     * Creates a new instance of the storage provider.
     *
     * @param settings Setting to configure the provider.
     */
    constructor(settings) {
        if (!settings) {
            throw new Error('The settings parameter is required.');
        }
        if (!/^[A-Za-z][A-Za-z0-9]{2,62}$/.test(settings.tableName)) {
            throw new Error('The table name contains invalid characters.');
        }
        this.settings = Object.assign({}, settings);
        this.tableService = this.createTableService(this.settings.storageAccountOrConnectionString, this.settings.storageAccessKey, this.settings.host);
    }
    /**
     * Loads store items from storage
     *
     * @param keys Array of item keys to read from the store.
     **/
    read(keys) {
        if (!keys || !keys.length) {
            throw new Error('Please provide at least one key to read from storage.');
        }
        return this.ensureTable().then(() => {
            let readPromises = keys.map(key => {
                // get all items with the same PK as the sanitized(key)
                let query = new azure.TableQuery()
                    .where('PartitionKey eq ?', TableStorage.SanitizeKey(key));
                // convert chunks back into StoreItemContainer for reading
                return this.executeQuery(query)
                    .then(chunks => chunks.length ? StoreItemContainer.join(chunks) : null);
            });
            return Promise.all(readPromises)
                .then(results => results.filter(e => !!e)) // ignore null returns
                .then(results => results.reduce((acc, e) => {
                acc[e.key] = e.obj;
                return acc;
            }, {}));
        });
    }
    ;
    /**
     * Saves store items to storage.
     *
     * @param changes Map of items to write to storage.
     **/
    write(changes) {
        if (!changes) {
            throw new Error('Please provide a StoreItems with changes to persist.');
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
                .then(result => { }); // void
        });
    }
    ;
    /**
     * Removes store items from storage
     *
     * @param keys Array of item keys to remove from the store.
     **/
    delete(keys) {
        if (!keys || !keys.length)
            return Promise.resolve();
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
                    if (!batch.operations.length)
                        return Promise.resolve([]);
                    // execute
                    return this.tableService.executeBatchAsync(this.settings.tableName, batch);
                });
            });
            return Promise.all(batches)
                .then(() => { }); // void
        });
    }
    static SanitizeKey(key) {
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
            if (!isBad)
                sb += ch;
        }
        return sb;
    }
    /** Ensure the table is created. */
    ensureTable() {
        if (!checkedTables[this.settings.tableName])
            checkedTables[this.settings.tableName] = this.tableService.createTableIfNotExistsAsync(this.settings.tableName);
        return checkedTables[this.settings.tableName];
    }
    executeQuery(query) {
        return new Promise((resolve, reject) => {
            let collected = [];
            let getNext = (query, token = null) => {
                this.tableService.queryEntitiesAsync(this.settings.tableName, query, token, null)
                    .then(queryResults => {
                    // append items
                    collected = collected.concat(queryResults.entries);
                    if (queryResults.continuationToken) {
                        // continue reading
                        getNext(query, queryResults.continuationToken);
                    }
                    else {
                        // collect and return
                        resolve(collected);
                    }
                }).catch(reject);
            };
            getNext(query);
        });
    }
    deleteInBatch(batch, deleteQuery) {
        // retrieve all row based on query
        return this.executeQuery(deleteQuery)
            .then(rows => {
            // empty
            if (!rows.length)
                return batch;
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
    createTableService(storageAccountOrConnectionString, storageAccessKey, host) {
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
        };
    }
    // turn a cb based azure method into a Promisified one
    denodeify(thisArg, fn) {
        return (...args) => {
            return new Promise((resolve, reject) => {
                args.push((error, result) => (error) ? reject(error) : resolve(result));
                fn.apply(thisArg, args);
            });
        };
    }
}
exports.TableStorage = TableStorage;
/**
 * Internal data structure for splitting items into smaller pieces and overcome Azure Table Row size limit.
 * More info: https://docs.microsoft.com/en-us/rest/api/storageservices/understanding-the-table-service-data-model#property-types
 */
class StoreItemContainer {
    constructor(key, obj) {
        this.key = key;
        this.obj = obj;
        this.eTag = !!obj.eTag ? obj.eTag : null;
    }
    split() {
        let entGen = azure.TableUtilities.entityGenerator;
        let json = JSON.stringify(this.obj);
        let chunks = this.sliceString(json, StoreItemContainer.MaxRowSize);
        return chunks.map((chunk, ix) => ({
            PartitionKey: entGen.String(TableStorage.SanitizeKey(this.key)),
            RowKey: entGen.String(ix.toString()),
            RealKey: entGen.String(this.key),
            Json: entGen.String(chunk),
            '.metadata': !!this.eTag && ix === 0 ? { etag: this.eTag } : null // save etag as metadata for first element only
        }));
    }
    static join(chunks) {
        let ordered = chunks.sort((i1, i2) => parseInt(i1.RowKey._, 10) - parseInt(i2.RowKey._, 10));
        let key = ordered[0].RealKey._;
        let eTag = ordered[0]['.metadata'] ? ordered[0]['.metadata'].etag : null;
        let json = ordered.map(o => o.Json._).join('');
        let obj = JSON.parse(json, utils_1.JsonDateReviver);
        if (eTag)
            obj.eTag = eTag;
        return new StoreItemContainer(key, obj);
    }
    sliceString(str, sliceLen) {
        let chunks = [];
        let strLen = str.length;
        for (let ix = 0; ix < strLen; ix += sliceLen) {
            chunks.push(str.slice(ix, sliceLen + ix));
        }
        return chunks;
    }
}
StoreItemContainer.MaxRowSize = 32 * 1024;
exports.StoreItemContainer = StoreItemContainer;
//# sourceMappingURL=tableStorage.js.map