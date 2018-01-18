"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const botbuilder_1 = require("botbuilder");
const lunrSearchEngine_1 = require("./lunrSearchEngine");
/**
 * The LunrSearcher implements search contract locally in javascript
 */
class LunrSearchService extends botbuilder_1.BotService {
    constructor(storage) {
        super("search");
        this.storage = storage;
    }
    getService(context) {
        return new lunrSearchEngine_1.LunrSearchEngine(this.storage);
    }
}
exports.LunrSearchService = LunrSearchService;
//# sourceMappingURL=lunrSearchService.js.map