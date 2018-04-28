"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const schema_1 = require("../schema");
const connectedService_1 = require("./connectedService");
class AzureBotService extends connectedService_1.ConnectedService {
    constructor(source = {}) {
        super(source);
        this.type = schema_1.ServiceType.AzureBotService;
        this.appId = '';
        this.tenantId = '';
        this.subscriptionId = '';
        this.resourceGroup = '';
        const { appId = '', tenantId = '', subscriptionId = '', resourceGroup = '' } = source;
        this.appId = appId;
        this.tenantId = tenantId;
        this.subscriptionId = subscriptionId;
        this.resourceGroup = resourceGroup;
    }
    toJSON() {
        let { name, appId, id, tenantId, subscriptionId, resourceGroup } = this;
        return { type: schema_1.ServiceType.AzureBotService, name, appId, id, tenantId, subscriptionId, resourceGroup };
    }
}
exports.AzureBotService = AzureBotService;
//# sourceMappingURL=azureBotService.js.map