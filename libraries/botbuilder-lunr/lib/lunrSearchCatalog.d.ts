import { Storage, SearchCatalog, SearchHit } from 'botbuilder';
export declare class LunrSearchCatalog implements SearchCatalog {
    name: string;
    private index;
    private storage;
    private changes;
    private deletes;
    constructor(name: string, index: any, storage: Storage);
    /**
     * add document to catalog
     */
    add(document: any): Promise<void>;
    /**
     * update document to catalog
     */
    update(document: object): Promise<void>;
    /**
     * Delete document from catalog
     */
    delete(id: string): Promise<void>;
    /**
     * Search catalog for query string, or with filter object
     */
    search(query: string): Promise<SearchHit[]>;
    /**
     * get doc by id
     * @param id docid
     */
    get(id: string): Promise<object>;
    /**
    * Get all documents ids in the catalog
    */
    getAllIds(): Promise<string[]>;
    /** flush any pending changes  */
    flush(): Promise<void>;
    getCatalogKey(): string;
    getDocKey(id: string): string;
}
