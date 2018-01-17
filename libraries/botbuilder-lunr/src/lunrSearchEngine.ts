import {
    Activity, Middleware, BotService,
    Storage, StoreItems, MemoryStorage,
    SearchEngine, SearchCatalog, SearchHit
} from 'botbuilder-core';
import { LunrSearchCatalog } from './lunrSearchCatalog';
var elasticLunr = require('elasticlunr');

export class LunrSearchEngine implements SearchEngine {
    private storage: Storage;
    private loadedCatalogs: Map<string, SearchCatalog> = new Map<string, SearchCatalog>();
    private CATALOGS: string = 'lunrSearchEngine/catalogs';

    public constructor(storage?: Storage) {
        if (storage)
            this.storage = <Storage>storage;
        else
            this.storage = new MemoryStorage();
    }

    /** List all catalogs */
    async listCatalogs(): Promise<string[]> {
        let items: StoreItems = await this.storage.read([this.CATALOGS]);
        if (!items.hasOwnProperty(this.CATALOGS)) {
            items[this.CATALOGS] = { catalogs: [], eTag: "*" };
            await this.storage.write(items);
        }
        return items[this.CATALOGS].catalogs;
    }

    private getCatalogKey(name: string): string {
        return 'lunrsearch-' + name;
    }

    /** get or create a catalog */
    async createCatalog(catalogName: string, indexField: string, fields: string[]): Promise<SearchCatalog> {
        let catalogNames = await this.listCatalogs();
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

        let catalog = new LunrSearchCatalog(catalogName, searcher, this.storage);
        this.loadedCatalogs.set(catalogName, catalog);

        // save out new catalog
        await catalog.flush();

        // update catalogs list
        let storeItems = await this.storage.read([this.CATALOGS])
            .catch((reason) => {
                let storeItems: StoreItems = {};
                storeItems[this.CATALOGS] = { catalogs: [], eTag: '*' };
                return storeItems;
            });
        storeItems[this.CATALOGS].catalogs.push(catalogName);
        await this.storage.write(storeItems);
        return catalog;
    }

    /** get a catalog */
    async getCatalog(catalogName: string): Promise<SearchCatalog> {
        let catalogNames = await this.listCatalogs();
        if (catalogNames.indexOf(catalogName) < 0)
            throw new Error(`${catalogName} doesn't exist!`);

        // load it if not loaded
        if (!this.loadedCatalogs.has(catalogName)) {
            let key = this.getCatalogKey(catalogName);
            let storeItems = await this.storage.read([key]);
            // load index from saved data
            let index = elasticLunr.Index.load(storeItems[key]);
            let catalog = new LunrSearchCatalog(catalogName, index, this.storage);

            // add it to the loaded catalogs
            this.loadedCatalogs.set(catalogName, catalog);
        }
        // return it
        return <SearchCatalog>this.loadedCatalogs.get(catalogName);
    }

    /** delete a catalog */
    async deleteCatalog(catalogName: string): Promise<void> {
        let catalog: LunrSearchCatalog = <LunrSearchCatalog>await this.getCatalog(catalogName)
            .catch(() => undefined /* null for not there */);
        if (!catalog)
            return;

        // delete docs
        let ids = await catalog.getAllIds();
        let keys: string[] = [];
        for (let id of ids) {
            keys.push(catalog.getDocKey(id));
        }

        // remove from loaded list
        this.loadedCatalogs.delete(catalogName);

        // update catalogs record
        let storeItems = await this.storage.read([this.CATALOGS]);
        for (var i = 0; i < storeItems[this.CATALOGS].catalogs.length; i++) {
            if (storeItems[this.CATALOGS].catalogs[i] == catalogName) {
                storeItems[this.CATALOGS].catalogs.splice(i, 1);
                break;
            }
        }
        await this.storage.write(storeItems);

        // delete index record too
        let key = this.getCatalogKey(catalogName);
        keys.push(key);
        await this.storage.delete(keys)
            .catch(() => { });;
    }
}




