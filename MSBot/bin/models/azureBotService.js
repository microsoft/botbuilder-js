"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */
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
        Object.assign(this, { tenantId, subscriptionId, resourceGroup });
    }
    toJSON() {
        let { id, name, tenantId, subscriptionId, resourceGroup } = this;
        return { type: schema_1.ServiceType.AzureBotService, id, name, tenantId, subscriptionId, resourceGroup };
    }
}
exports.AzureBotService = AzureBotService;
//# sourceMappingURL=azureBotService.js.map