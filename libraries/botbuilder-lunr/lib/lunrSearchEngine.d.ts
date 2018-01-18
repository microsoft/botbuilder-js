import { Storage, SearchEngine, SearchCatalog } from 'botbuilder';
export declare class LunrSearchEngine implements SearchEngine {
    private storage;
    private loadedCatalogs;
    private CATALOGS;
    constructor(storage?: Storage);
    /** List all catalogs */
    listCatalogs(): Promise<string[]>;
    private getCatalogKey(name);
    /** get or create a catalog */
    createCatalog(catalogName: string, indexField: string, fields: string[]): Promise<SearchCatalog>;
    /** get a catalog */
    getCatalog(catalogName: string): Promise<SearchCatalog>;
    /** delete a catalog */
    deleteCatalog(catalogName: string): Promise<void>;
}
