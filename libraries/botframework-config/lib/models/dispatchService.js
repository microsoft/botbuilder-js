"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */
const schema_1 = require("../schema");
const luisService_1 = require("./luisService");
class DispatchService extends luisService_1.LuisService {
    constructor(source = {}) {
        super(source);
        this.serviceIds = [];
        this.type = schema_1.ServiceTypes.Dispatch;
        const { appId = '', authoringKey = '', serviceIds = [], subscriptionKey = '', version = '', region = '' } = source;
        this.id = appId;
        Object.assign(this, { appId, authoringKey, serviceIds, subscriptionKey, version, region });
    }
    toJSON() {
        const { appId, authoringKey, name, serviceIds, subscriptionKey, version, region } = this;
        return { type: schema_1.ServiceTypes.Dispatch, id: appId, name, appId, authoringKey, serviceIds, subscriptionKey, version, region };
    }
}
exports.DispatchService = DispatchService;
//# sourceMappingURL=dispatchService.js.map