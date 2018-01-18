"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const botbuilder_1 = require("botbuilder");
const lunrSearchCatalog_1 = require("./lunrSearchCatalog");
var elasticLunr = require('elasticlunr');
class LunrSearchEngine {
    constructor(storage) {
        this.loadedCatalogs = new Map();
        this.CATALOGS = 'lunrSearchEngine/catalogs';
        if (storage)
            this.storage = storage;
        else
            this.storage = new botbuilder_1.MemoryStorage();
    }
    /** List all catalogs */
    listCatalogs() {
        return __awaiter(this, void 0, void 0, function* () {
            let items = yield this.storage.read([this.CATALOGS]);
            if (!items.hasOwnProperty(this.CATALOGS)) {
                items[this.CATALOGS] = { catalogs: [], eTag: "*" };
                yield this.storage.write(items);
            }
            return items[this.CATALOGS].catalogs;
        });
    }
    getCatalogKey(name) {
        return 'lunrsearch-' + name;
    }
    /** get or create a catalog */
    createCatalog(catalogName, indexField, fields) {
        return __awaiter(this, void 0, void 0, function* () {
            let catalogNames = yield this.listCatalogs();
            if (catalogNames.indexOf(catalogName) >= 0)
                throw new Error(`${catalogName} already exists`);
            // create index
            let searcher = elasticLunr(function () {
            });
            searcher.saveDocument(false); // we will do our own saving to the storage provider
            searcher.setRef(indexField);
            for (let field of fields) {
                searcher.addField(field);
            }
            let catalog = new lunrSearchCatalog_1.LunrSearchCatalog(catalogName, searcher, this.storage);
            this.loadedCatalogs.set(catalogName, catalog);
            // save out new catalog
            yield catalog.flush();
            // update catalogs list
            let storeItems = yield this.storage.read([this.CATALOGS])
                .catch((reason) => {
                let storeItems = {};
                storeItems[this.CATALOGS] = { catalogs: [], eTag: '*' };
                return storeItems;
            });
            storeItems[this.CATALOGS].catalogs.push(catalogName);
            yield this.storage.write(storeItems);
            return catalog;
        });
    }
    /** get a catalog */
    getCatalog(catalogName) {
        return __awaiter(this, void 0, void 0, function* () {
            let catalogNames = yield this.listCatalogs();
            if (catalogNames.indexOf(catalogName) < 0)
                throw new Error(`${catalogName} doesn't exist!`);
            // load it if not loaded
            if (!this.loadedCatalogs.has(catalogName)) {
                let key = this.getCatalogKey(catalogName);
                let storeItems = yield this.storage.read([key]);
                // load index from saved data
                let index = elasticLunr.Index.load(storeItems[key]);
                let catalog = new lunrSearchCatalog_1.LunrSearchCatalog(catalogName, index, this.storage);
                // add it to the loaded catalogs
                this.loadedCatalogs.set(catalogName, catalog);
            }
            // return it
            return this.loadedCatalogs.get(catalogName);
        });
    }
    /** delete a catalog */
    deleteCatalog(catalogName) {
        return __awaiter(this, void 0, void 0, function* () {
            let catalog = yield this.getCatalog(catalogName)
                .catch(() => undefined /* null for not there */);
            if (!catalog)
                return;
            // delete docs
            let ids = yield catalog.getAllIds();
            let keys = [];
            for (let id of ids) {
                keys.push(catalog.getDocKey(id));
            }
            // remove from loaded list
            this.loadedCatalogs.delete(catalogName);
            // update catalogs record
            let storeItems = yield this.storage.read([this.CATALOGS]);
            for (var i = 0; i < storeItems[this.CATALOGS].catalogs.length; i++) {
                if (storeItems[this.CATALOGS].catalogs[i] == catalogName) {
                    storeItems[this.CATALOGS].catalogs.splice(i, 1);
                    break;
                }
            }
            yield this.storage.write(storeItems);
            // delete index record too
            let key = this.getCatalogKey(catalogName);
            keys.push(key);
            yield this.storage.delete(keys)
                .catch(() => { });
            ;
        });
    }
}
exports.LunrSearchEngine = LunrSearchEngine;
//# sourceMappingURL=lunrSearchEngine.js.map