"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */
const encrypt_1 = require("../encrypt");
const schema_1 = require("../schema");
const azureService_1 = require("./azureService");
class AppInsightsService extends azureService_1.AzureService {
    constructor(source = {}) {
        super(source, schema_1.ServiceTypes.AppInsights);
        this.instrumentationKey = '';
        this.applicationId = '';
        this.apiKeys = {};
        const { instrumentationKey = '', applicationId, apiKeys } = source;
        Object.assign(this, { instrumentationKey, applicationId, apiKeys });
    }
    toJSON() {
        let { id, type, name, tenantId, subscriptionId, resourceGroup, serviceName, instrumentationKey, applicationId, apiKeys } = this;
        return { type, id, name, tenantId, subscriptionId, resourceGroup, serviceName, instrumentationKey, applicationId, apiKeys };
    }
    // encrypt keys in service
    encrypt(secret) {
        if (this.instrumentationKey && this.instrumentationKey.length > 0)
            this.instrumentationKey = encrypt_1.encryptString(this.instrumentationKey, secret);
        if (this.apiKeys) {
            for (let prop in this.apiKeys) {
                this.apiKeys[prop] = encrypt_1.encryptString(this.apiKeys[prop], secret);
            }
        }
    }
    // decrypt keys in service
    decrypt(secret) {
        if (this.instrumentationKey && this.instrumentationKey.length > 0)
            this.instrumentationKey = encrypt_1.decryptString(this.instrumentationKey, secret);
        if (this.apiKeys) {
            for (let prop in this.apiKeys) {
                this.apiKeys[prop] = encrypt_1.decryptString(this.apiKeys[prop], secret);
            }
        }
    }
}
exports.AppInsightsService = AppInsightsService;
//# sourceMappingURL=appInsightsService.js.map