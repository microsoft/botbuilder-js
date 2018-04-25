"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const schema_1 = require("../schema");
const connectedService_1 = require("./connectedService");
class AzureBotService extends connectedService_1.ConnectedService {
    constructor(source = {}) {
        super(source);
        this.type = schema_1.ServiceType.AzureBotService;
        this.appId = '';
        const { appId = '' } = source;
        this.appId = appId;
    }
    toJSON() {
        let { name, appId, id } = this;
        if (!id) {
            id = appId;
        }
        return { type: schema_1.ServiceType.AzureBotService, name, appId, id };
    }
}
exports.AzureBotService = AzureBotService;
//# sourceMappingURL=azureBotService.js.map