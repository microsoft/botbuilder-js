"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */
const encrypt_1 = require("../encrypt");
const schema_1 = require("../schema");
const connectedService_1 = require("./connectedService");
class AzureStorageService extends connectedService_1.ConnectedService {
    constructor(source = {}) {
        super(source);
        this.type = schema_1.ServiceTypes.AzureStorage;
        this.tenantId = '';
        this.subscriptionId = '';
        this.resourceGroup = '';
        this.connectionString = '';
        const { tenantId = '', subscriptionId = '', resourceGroup = '', connectionString = '' } = source;
        Object.assign(this, { tenantId, subscriptionId, resourceGroup, connectionString });
    }
    toJSON() {
        let { id, name, tenantId, subscriptionId, resourceGroup, connectionString } = this;
        return { type: schema_1.ServiceTypes.AzureStorage, id, name, tenantId, subscriptionId, resourceGroup, connectionString };
    }
    // encrypt keys in service
    encrypt(secret) {
        if (this.connectionString && this.connectionString.length > 0)
            this.connectionString = encrypt_1.encryptString(this.connectionString, secret);
    }
    // decrypt keys in service
    decrypt(secret) {
        if (this.connectionString && this.connectionString.length > 0)
            this.connectionString = encrypt_1.decryptString(this.connectionString, secret);
    }
}
exports.AzureStorageService = AzureStorageService;
//# sourceMappingURL=azureStorageService.js.map