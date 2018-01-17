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
var elasticLunr = require('elasticlunr');
class LunrSearchCatalog {
    constructor(name, index, storage) {
        this.name = name;
        this.index = index;
        this.storage = storage;
        this.changes = {};
        this.deletes = [];
    }
    /**
     * add document to catalog
     */
    add(document) {
        return __awaiter(this, void 0, void 0, function* () {
            this.index.addDoc(document);
            let key = this.getDocKey(document[this.index._ref]);
            this.changes[key] = { eTag: "*", document: document };
        });
    }
    /**
     * update document to catalog
     */
    update(document) {
        return __awaiter(this, void 0, void 0, function* () {
            this.index.updateDoc(document);
            let key = this.getDocKey(document[this.index._ref]);
            this.changes[key] = { eTag: "*", document: document };
        });
    }
    /**
     * Delete document from catalog
     */
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            this.index.removeDocByRef(id);
            let key = this.getDocKey(document[this.index._ref]);
            this.deletes.push(key);
        });
    }
    /**
     * Search catalog for query string, or with filter object
     */
    search(query) {
        return __awaiter(this, void 0, void 0, function* () {
            let results = this.index.search(query);
            let hits = [];
            for (let result of results) {
                hits.push({
                    score: result.score,
                    docId: result.ref
                });
            }
            return hits;
        });
    }
    /**
     * get doc by id
     * @param id docid
     */
    get(id) {
        return __awaiter(this, void 0, void 0, function* () {
            let key = this.getDocKey(id);
            var storeItems = yield this.storage.read([key]);
            return storeItems[key].document;
        });
    }
    /**
    * Get all documents ids in the catalog
    */
    getAllIds() {
        return __awaiter(this, void 0, void 0, function* () {
            let ids = [];
            for (let id in this.index.documentStore.docInfo) {
                ids.push(id);
            }
            return ids;
        });
    }
    /** flush any pending changes  */
    flush() {
        return __awaiter(this, void 0, void 0, function* () {
            let catalogKey = this.getCatalogKey();
            this.changes[catalogKey] = this.index.toJSON();
            this.changes[catalogKey].eTag = '*';
            yield this.storage.write(this.changes);
            this.changes = {};
            yield this.storage.delete(this.deletes);
            this.deletes = [];
        });
    }
    getCatalogKey() {
        return 'lunrsearch-' + this.name;
    }
    getDocKey(id) {
        return 'lunr-' + this.name + '-' + id;
    }
}
exports.LunrSearchCatalog = LunrSearchCatalog;
//# sourceMappingURL=lunrSearchCatalog.js.map