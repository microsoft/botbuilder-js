/**
 * @module botbuilder
 */
/** second comment block */

/** Interface for a search engine that manages catalogs  **/
export interface SearchEngine {
    /** create a catalog */
    createCatalog(name: string, id: string, fields: string[]): Promise<SearchCatalog>;

    /** get a catalog, returns null if no catalog yet */
    getCatalog(name: string): Promise<SearchCatalog>;

    /** delete a catalog */
    deleteCatalog(name: string): Promise<void>;

    /** List all catalogs */
    listCatalogs(): Promise<string[]>;
}

/** result from performing a search */
export interface SearchHit {
    /** Score for result */
    score: number;

    /** document */
    docId: string;
}

/** interface for search catalog */
export interface SearchCatalog {
    /**
     * add document to catalog
     */
    add(document: object): Promise<void>;

    /**
     * update document to catalog
     */
    update(document: object): Promise<void>;

    /**
     * Delete document from catalog
     */
    delete(id: string): Promise<void>;

    /**
     * Get document for Id
     */
    get(id: string): Promise<object>;

    /**
     * Get all documents ids in the catalog
     */
    getAllIds(): Promise<string[]>;

    /**
     * Search catalog for query string, or with filter object
     */
    search(query: string | object): Promise<SearchHit[]>;

    /**
     * Flush pending changes
     */
    flush(): Promise<void>;
}
