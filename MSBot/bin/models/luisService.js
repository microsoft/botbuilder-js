"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */
const schema_1 = require("../schema");
const connectedService_1 = require("./connectedService");
class LuisService extends connectedService_1.ConnectedService {
    constructor(source = {}) {
        super(source);
        this.type = schema_1.ServiceType.Luis;
        this.appId = '';
        this.authoringKey = '';
        this.subscriptionKey = '';
        this.version = '';
        const { appId = '', authoringKey = '', subscriptionKey = '', version = '' } = source;
        this.id = appId;
        Object.assign(this, { appId, authoringKey, subscriptionKey, version });
    }
    toJSON() {
        const { appId, authoringKey, id, name, subscriptionKey, type, version } = this;
        return { type: schema_1.ServiceType.Luis, id: appId, name, version, appId, authoringKey, subscriptionKey };
    }
}
exports.LuisService = LuisService;
//# sourceMappingURL=luisService.js.map