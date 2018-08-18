"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */
const encrypt_1 = require("../encrypt");
const schema_1 = require("../schema");
const connectedService_1 = require("./connectedService");
class AppInsightsService extends connectedService_1.ConnectedService {
    constructor(source = {}) {
        super(source);
        this.type = schema_1.ServiceTypes.AppInsights;
        this.tenantId = '';
        this.subscriptionId = '';
        this.resourceGroup = '';
        this.instrumentationKey = '';
        const { tenantId = '', subscriptionId = '', resourceGroup = '', instrumentationKey = '' } = source;
        Object.assign(this, { tenantId, subscriptionId, resourceGroup, instrumentationKey });
    }
    toJSON() {
        let { id, name, tenantId, subscriptionId, resourceGroup, instrumentationKey } = this;
        return { type: schema_1.ServiceTypes.AppInsights, id, name, tenantId, subscriptionId, resourceGroup, instrumentationKey };
    }
    // encrypt keys in service
    encrypt(secret) {
        if (this.instrumentationKey && this.instrumentationKey.length > 0)
            this.instrumentationKey = encrypt_1.encryptString(this.instrumentationKey, secret);
    }
    // decrypt keys in service
    decrypt(secret) {
        if (this.instrumentationKey && this.instrumentationKey.length > 0)
            this.instrumentationKey = encrypt_1.decryptString(this.instrumentationKey, secret);
    }
}
exports.AppInsightsService = AppInsightsService;
//# sourceMappingURL=appInsightsService.js.map