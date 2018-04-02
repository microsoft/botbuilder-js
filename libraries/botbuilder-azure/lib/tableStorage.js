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
    sanitizeKey(key) {
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
    /** Delete backing table (mostly used for unit testing.) */
    deleteTable() {
        if (checkedTables[this.settings.tableName])
            delete checkedTables[this.settings.tableName];
        return this.tableService.deleteTableIfExistsAsync(this.settings.tableName);
    }
    /**
     * Loads store items from storage
     *
     * @param keys Array of item keys to read from the store.
     **/
    read(keys) {
        let storeItems = {};
        return this.ensureTable()
            .then((created) => {
            let promises = [];
            // foreach key, get a promise for the entity
            for (let iKey in keys) {
                let key = keys[iKey];
                var entityKey = this.sanitizeKey(key);
                // fetch entity
                promises.push(this.tableService.retrieveEntityAsync(this.settings.tableName, entityKey, '0')
                    .then((result) => {
                    let entity = result;
                    let storeItem = JSON.parse(entity.json._);
                    storeItem.eTag = entity['.metadata'].etag;
                    storeItems[key] = storeItem;
                }, (error) => {
                    if (error.statusCode === 404)
                        // we treat as null result
                        return;
                    else
                        throw error;
                }));
            }
            // wait for all promises to complete
            return Promise.all(promises)
                .then(result => storeItems);
        });
    }
    ;
    /**
     * Saves store items to storage.
     *
     * @param changes Map of items to write to storage.
     **/
    write(changes) {
        return this.ensureTable()
            .then((created) => {
            let promises = [];
            // foreach key => change
            for (let key in changes) {
                let storeItem = changes[key];
                var entityKey = this.sanitizeKey(key);
                // create entity for the json
                let entGen = azure.TableUtilities.entityGenerator;
                let entity = {
                    PartitionKey: entGen.String(entityKey),
                    RowKey: entGen.String('0'),
                    json: entGen.String(JSON.stringify(storeItem))
                };
                let metadata = { etag: storeItem.eTag };
                entity['.metadata'] = metadata;
                if (storeItem.eTag == null || storeItem.eTag == "*") {
                    // if new item or * then insert or replace unconditionaly
                    promises.push(this.tableService.insertOrReplaceEntityAsync(this.settings.tableName, entity));
                }
                else if (storeItem.eTag.length > 0) {
                    // if we have an etag, do opt. concurrency replace
                    promises.push(this.tableService.replaceEntityAsync(this.settings.tableName, entity));
                }
                else {
                    // bogus etag, it's empty string
                    throw new Error('etag empty');
                }
            }
            return Promise.all(promises)
                .then(result => { });
        });
    }
    ;
    /**
     * Removes store items from storage
     *
     * @param keys Array of item keys to remove from the store.
     **/
    delete(keys) {
        return this.ensureTable()
            .then((created) => {
            let promises = [];
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
                let metadata = { etag: '*' };
                entity['.metadata'] = metadata;
                // delete it
                promises.push(this.tableService.deleteEntityAsync(this.settings.tableName, entity)
                    .catch(error => { }));
            }
            // wait for promises to complete
            return Promise.all(promises)
                .then(result => { });
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
            deleteEntityAsync: this.denodeify(tableService, tableService.deleteEntity)
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
//# sourceMappingURL=tableStorage.js.map