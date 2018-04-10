"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const azure = require("azure-storage");
let checkedTables = {};
/**
 * Middleware that implements an Azure Table based storage provider for a bot.
 *
 * **Usage Example**
 *
 * ```javascript
 * ```
*/
class TableStorage {
    /**
     * Creates a new instance of the storage provider.
     *
     * @param settings (Optional) setting to configure the provider.
     */
    constructor(settings) {
        this.settings = Object.assign({}, settings);
        this.tableService = this.createTableService(this.settings.storageAccountOrConnectionString, this.settings.storageAccessKey, this.settings.host);
    }
    /** Ensure the table is created. */
    ensureTable() {
        if (!checkedTables[this.settings.tableName])
            checkedTables[this.settings.tableName] = this.tableService.createTableIfNotExistsAsync(this.settings.tableName);
        return checkedTables[this.settings.tableName];
    }
    /**
     * Loads store items from storage
     *
     * @param keys Array of item keys to read from the store.
     **/
    read(keys) {
        let storeItems = {};
        return this.ensureTable().then((created) => {
            let promises = keys.map(key => {
                // get all items with the same PK as the sanitized(key)
                let query = new azure.TableQuery()
                    .where('PartitionKey eq ?', sanitizeKey(key));
                // convert chunks back into StoreItemContainer for reading
                return this.executeQuery(this.tableService, this.settings.tableName, query)
                    .then(chunks => chunks.length ? StoreItemContainer.join(chunks) : null);
            });
            return Promise.all(promises)
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
        return this.ensureTable().then((created) => {
            let promises = Object.keys(changes)
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
                    .where('PartitionKey eq ? && RowKey >= ?', sanitizeKey(entity.key), maxRowKey.toString());
                // Retrieve and (if found) add to batch for deletion
                return this.deleteInBatch(batch, query)
                    .then(batch => this.tableService.executeBatchAsync(this.settings.tableName, batch));
            });
            return Promise.all(promises)
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
        return this.ensureTable().then((created) => {
            // for each key, remove its rows based on PK
            let promises = keys.map(key => {
                return this.deleteInBatch(new azure.TableBatch(), new azure.TableQuery().select('PartitionKey', 'RowKey')
                    .where('PartitionKey eq ?', sanitizeKey(key)))
                    .then(batch => {
                    if (!batch.operations.length)
                        return Promise.resolve([]); // no records (and operations) were generated from querying the PK
                    return this.tableService.executeBatchAsync(this.settings.tableName, batch);
                });
            });
            return Promise.all(promises)
                .then(() => { }); // void
        });
    }
    executeQuery(tableService, tableName, query) {
        return new Promise((resolve, reject) => {
            let collected = [];
            let getNext = function (query, token = null) {
                tableService.queryEntitiesAsync(tableName, query, token, null)
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
    deleteInBatch(batch, query) {
        // retrieve all row based on query
        return this.executeQuery(this.tableService, this.settings.tableName, query)
            .then(rows => {
            // empty? return...
            if (!rows.length)
                return Promise.resolve(batch);
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
const chunkMaxSize = 32 * 1024;
class StoreItemContainer {
    constructor(key, obj) {
        this.key = key;
        this.obj = obj;
        this.eTag = !!obj.eTag ? obj.eTag : null;
    }
    split() {
        let entGen = azure.TableUtilities.entityGenerator;
        let json = JSON.stringify(this.obj);
        let chunks = splitSlice(json, chunkMaxSize);
        return chunks.map((chunk, ix) => ({
            PartitionKey: entGen.String(sanitizeKey(this.key)),
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
        let obj = JSON.parse(json);
        if (eTag)
            obj.eTag = eTag;
        return new StoreItemContainer(key, obj);
    }
}
exports.StoreItemContainer = StoreItemContainer;
// Helpers
function sanitizeKey(key) {
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
function splitSlice(str, len) {
    let chunks = [];
    let strLen = str.length;
    for (let ix = 0; ix < strLen; ix += len) {
        chunks.push(str.slice(ix, len + ix));
    }
    return chunks;
}
const flatten = (acc, curr) => acc.concat(curr);
//# sourceMappingURL=tableStorage.js.map