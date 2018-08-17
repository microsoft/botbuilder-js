"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */
const encrypt_1 = require("../encrypt");
const schema_1 = require("../schema");
const connectedService_1 = require("./connectedService");
class LuisService extends connectedService_1.ConnectedService {
    constructor(source = {}) {
        super(source);
        this.type = schema_1.ServiceTypes.Luis;
        this.appId = '';
        this.authoringKey = '';
        this.subscriptionKey = '';
        this.version = '';
        this.region = '';
        const { appId = '', authoringKey = '', subscriptionKey = '', version = '', region = '' } = source;
        this.id = appId;
        Object.assign(this, { appId, authoringKey, subscriptionKey, version, region });
    }
    toJSON() {
        const { appId, authoringKey, id, name, subscriptionKey, type, version, region } = this;
        return { type: schema_1.ServiceTypes.Luis, id: appId, name, version, appId, authoringKey, subscriptionKey, region };
    }
    // encrypt keys in service
    encrypt(secret) {
        if (this.authoringKey && this.authoringKey.length > 0)
            this.authoringKey = encrypt_1.encryptString(this.authoringKey, secret);
        if (this.subscriptionKey && this.subscriptionKey.length > 0)
            this.subscriptionKey = encrypt_1.encryptString(this.subscriptionKey, secret);
    }
    // decrypt keys in service
    decrypt(secret) {
        if (this.authoringKey && this.authoringKey.length > 0)
            this.authoringKey = encrypt_1.decryptString(this.authoringKey, secret);
        if (this.subscriptionKey && this.subscriptionKey.length > 0)
            this.subscriptionKey = encrypt_1.decryptString(this.subscriptionKey, secret);
    }
}
exports.LuisService = LuisService;
//# sourceMappingURL=luisService.js.map