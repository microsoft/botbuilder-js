import {
    Activity, Middleware, BotService,
    Storage, StoreItems, StoreItem,
    SearchEngine, SearchCatalog, SearchHit
} from 'botbuilder-core';
var elasticLunr = require('elasticlunr');

export class LunrSearchCatalog implements SearchCatalog {
    private changes: StoreItems = {};
    private deletes: string[] = [];

    constructor(public name: string, private index: any, private storage: Storage) {
    }

    /**
     * add document to catalog
     */
    async add(document: any): Promise<void> {
        this.index.addDoc(document);
        let key = this.getDocKey((<any>document)[this.index._ref]);
        this.changes[key] = { eTag: "*", document: document };
    }

    /**
     * update document to catalog
     */
    async update(document: object): Promise<void> {
        this.index.updateDoc(document);
        let key = this.getDocKey((<any>document)[this.index._ref]);
        this.changes[key] = { eTag: "*", document: document };
    }

    /**
     * Delete document from catalog
     */
    async delete(id: string): Promise<void> {
        this.index.removeDocByRef(id);
        let key = this.getDocKey((<any>document)[this.index._ref]);
        this.deletes.push(key);
    }

    /**
     * Search catalog for query string, or with filter object
     */
    async search(query: string): Promise<SearchHit[]> {
        let results = this.index.search(query);
        let hits: SearchHit[] = [];
        for (let result of results) {
            hits.push({
                score: result.score,
                docId: result.ref
            });
        }
        return hits;
    }

    /**
     * get doc by id
     * @param id docid 
     */
    async get(id: string): Promise<object> {
        let key = this.getDocKey(id);
        var storeItems: StoreItems = await this.storage.read([key]);
        return storeItems[key].document;
    }

    /**
    * Get all documents ids in the catalog
    */
    async getAllIds(): Promise<string[]> {
        let ids: string[] = [];
        for (let id in this.index.documentStore.docInfo) {
            ids.push(id);
        }
        return ids;
    }

    /** flush any pending changes  */
    async flush(): Promise<void> {
        let catalogKey = this.getCatalogKey();
        this.changes[catalogKey] = this.index.toJSON();
        this.changes[catalogKey].eTag = '*';
        await this.storage.write(this.changes);
        this.changes = {};
        await this.storage.delete(this.deletes);
        this.deletes = [];
    }

    getCatalogKey(): string {
        return 'lunrsearch-' + this.name;
    }

    getDocKey(id: string): string {
        return 'lunr-' + this.name + '-' + id;
    }
}
