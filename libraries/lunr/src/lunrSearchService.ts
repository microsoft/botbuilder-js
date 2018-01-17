import {
    Activity, Middleware, BotService,
    Storage, StoreItems, MemoryStorage,
    SearchEngine, SearchCatalog, SearchHit
} from 'botbuilder-core';
import { LunrSearchEngine } from './lunrSearchEngine';

/**
 * The LunrSearcher implements search contract locally in javascript
 */
export class LunrSearchService extends BotService<SearchEngine> {
    public constructor(private storage?: Storage) {
        super("search")
    }

    protected getService(context: BotContext): SearchEngine {
        return new LunrSearchEngine(this.storage);
    }
}
