"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const schema_1 = require("../schema");
const connectedService_1 = require("./connectedService");
class AzureBotService extends connectedService_1.ConnectedService {
    constructor(source = {}) {
        super(source);
        this.type = schema_1.ServiceType.AzureBotService;
        this.tenantId = '';
        this.subscriptionId = '';
        this.resourceGroup = '';
        const { tenantId = '', subscriptionId = '', resourceGroup = '' } = source;
        this.tenantId = tenantId;
        this.subscriptionId = subscriptionId;
        this.resourceGroup = resourceGroup;
    }
    toJSON() {
        let { name, id, tenantId, subscriptionId, resourceGroup } = this;
        return { type: schema_1.ServiceType.AzureBotService, name, id, tenantId, subscriptionId, resourceGroup };
    }
}
exports.AzureBotService = AzureBotService;
//# sourceMappingURL=azureBotService.js.map