"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const azure = require("azure-storage");
const flat_1 = require("flat");
const EntityGenerator = azure.TableUtilities.entityGenerator;
/**
 * @private
 * Map of already initialized tables. Key = tableName, Value = Promise with TableResult creation.
 */
const checkedTables = {};
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
class TableStorage {
    /**
     * Creates a new TableStorage instance.
     * @param settings Setting required to configure the provider.
     */
    constructor(settings) {
        if (!settings) {
            throw new Error('The settings parameter is required.');
        }
        // https://docs.microsoft.com/en-us/rest/api/storageservices/Understanding-the-Table-Service-Data-Model?redirectedfrom=MSDN#table-names
        if (!/^[A-Za-z][A-Za-z0-9]{2,62}$/.test(settings.tableName)) {
            throw new Error('The table name contains invalid characters.');
        }
        this.settings = Object.assign({}, settings);
        this.tableService = this.createTableService(this.settings.storageAccountOrConnectionString, this.settings.storageAccessKey, this.settings.host);
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
    read(keys) {
        if (!keys || !keys.length) {
            throw new Error('Please provide at least one key to read from storage.');
        }
        return this.ensureTable().then(() => {
            var reads = keys.map(key => {
                let pk = this.sanitizeKey(key);
                return this.tableService.retrieveEntityAsync(this.settings.tableName, pk, '', { entityResolver: entityResolver })
                    .then(result => {
                    let value = flat_1.unflatten(result, flattenOptions);
                    value.eTag = value['.metadata'].etag;
                    // remove TableRow Properties from storeItem
                    ['PartitionKey', 'RowKey', '.metadata'].forEach(k => delete value[k]);
                    return { key, value };
                }).catch(handleNotFoundWith({ key, value: null }));
            });
            return Promise.all(reads)
                .then(items => items
                .filter(prop => prop.value !== null)
                .reduce(propsReducer, {})); // as StoreItems
        });
    }
    ;
    write(changes) {
        if (!changes) {
            throw new Error('Please provide a StoreItems with changes to persist.');
        }
        // Check for bogus etags
        Object.keys(changes).map(key => {
            let eTag = changes[key].eTag;
            if (eTag != null && eTag.trim() === "") {
                throw new Error('Etag empty for key ' + key);
            }
        });
        return this.ensureTable().then(() => {
            var writes = Object.keys(changes).map(key => {
                let storeItem = changes[key];
                // flatten the object graph into single columns
                let flat = flat_1.flatten(storeItem, flattenOptions);
                let entity = asEntityDescriptor(flat);
                delete entity.eTag;
                // add PK/RK and ETag
                let pk = this.sanitizeKey(key);
                entity.PartitionKey = EntityGenerator.String(pk);
                entity.RowKey = EntityGenerator.String('');
                entity['.metadata'] = { etag: storeItem.eTag };
                if (storeItem.eTag == null || storeItem.eTag === "*") {
                    // if new item or * then insert or replace unconditionaly
                    return this.tableService.insertOrReplaceEntityAsync(this.settings.tableName, entity);
                }
                else if (storeItem.eTag.length > 0) {
                    // if we have an etag, do opt. concurrency replace
                    return this.tableService.replaceEntityAsync(this.settings.tableName, entity);
                }
            });
            return Promise.all(writes)
                .then(() => { }); // void
        });
    }
    ;
    delete(keys) {
        if (!keys || !keys.length)
            return Promise.resolve();
        return this.ensureTable().then(() => {
            let deletes = keys.map(key => {
                let pk = this.sanitizeKey(key);
                let entity = {
                    PartitionKey: EntityGenerator.String(pk),
                    RowKey: EntityGenerator.String('')
                };
                entity['.metadata'] = { etag: '*' };
                return this.tableService
                    .deleteEntityAsync(this.settings.tableName, entity)
                    .catch(handleNotFoundWith(null));
            });
            return Promise.all(deletes)
                .then(() => { }); // void
        });
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
    // create TableServiceAsync instance based on connection config
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
/**
 * @private
 * Handle service 404 and 204 responses as null returns, throw any other error
 */
const handleNotFoundWith = (defaultValue) => (error) => {
    // return defaultValue when not found or no content
    if (error.statusCode === 404 || error.statusCode === 204)
        return defaultValue;
    else
        throw error;
};
/**
 * @private
 * Convert an object into EDM types
 */
const asEntityDescriptor = (obj) => {
    return Object.keys(obj)
        .map(key => ({
        key,
        value: asEntityProperty(obj[key])
    })).reduce(propsReducer, {});
};
/**
 * @private
 */
const asEntityProperty = (value) => {
    switch (getTypeOf(value)) {
        case 'date': return EntityGenerator.DateTime(value);
        case 'boolean': return EntityGenerator.Boolean(value);
        case 'number':
            let maxSafeInt32 = Math.pow(2, 32) - 1;
            if (isFloat(value))
                return EntityGenerator.Double(value);
            if (Math.abs(value) > maxSafeInt32)
                return EntityGenerator.Int64(value);
            return EntityGenerator.Int32(value);
        case 'string':
        default:
            return EntityGenerator.String(value);
    }
};
/**
 * @private
 */
const getTypeOf = (obj) => ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
/**
 * @private
 */
const isFloat = (n) => Number(n) === n && n % 1 !== 0;
/**
 * @private
 * Convert EDM types back to an JS object
 */
const entityResolver = (entity) => {
    return Object.keys(entity)
        .map(key => ({ key, value: getEdmValue(entity[key]) }))
        .reduce(propsReducer, {});
};
/**
 * @private
 */
const getEdmValue = (entityValue) => {
    return entityValue.$ === azure.TableUtilities.EdmType.INT64
        ? Number(entityValue._)
        : entityValue._;
};
/**
 * @private
 * Reduces pairs for key/value into an object (e.g.: StoreItems)
 */
const propsReducer = (resolved, propValue) => {
    resolved[propValue.key] = propValue.value;
    return resolved;
};
/**
 * @private
 * flat/flatten options to use '_' as delimiter (same as C#'s TableEntity.Flatten default delimiter)
 */
const flattenOptions = {
    delimiter: '_'
};
//# sourceMappingURL=tableStorage.js.map