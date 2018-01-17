import { BotService, Storage, SearchEngine } from 'botbuilder-core';
/**
 * The LunrSearcher implements search contract locally in javascript
 */
export declare class LunrSearchService extends BotService<SearchEngine> {
    private storage;
    constructor(storage?: Storage | undefined);
    protected getService(context: BotContext): SearchEngine;
}
