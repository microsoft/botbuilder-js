"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const schema_1 = require("../schema");
const connectedService_1 = require("./connectedService");
class LuisService extends connectedService_1.ConnectedService {
    constructor(source = {}) {
        super(source);
        this.type = schema_1.ServiceType.Luis;
        this.appId = '';
        this.authoringKey = '';
        this.id = '';
        this.subscriptionKey = '';
        this.version = '';
        const { appId = '', authoringKey = '', subscriptionKey = '', version = '' } = source;
        Object.assign(this, { appId, authoringKey, subscriptionKey, version });
    }
    toJSON() {
        let { appId, authoringKey, id, name, subscriptionKey, type, version } = this;
        if (!id) {
            id = appId;
        }
        return { id, type, name, version, appId, authoringKey, subscriptionKey };
    }
}
exports.LuisService = LuisService;
//# sourceMappingURL=luisService.js.map