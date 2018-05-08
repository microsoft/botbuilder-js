"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */
const schema_1 = require("../schema");
const connectedService_1 = require("./connectedService");
class DispatchService extends connectedService_1.ConnectedService {
    constructor(source = {}) {
        super(source);
        this.type = schema_1.ServiceType.Dispatch;
        this.appId = '';
        this.authoringKey = '';
        this.serviceIds = [];
        this.subscriptionKey = '';
        this.version = '';
        const { appId = '', authoringKey = '', serviceIds = [], subscriptionKey = '', version = '' } = source;
        this.id = appId;
        Object.assign(this, { appId, authoringKey, serviceIds, subscriptionKey, version });
    }
    toJSON() {
        const { appId, authoringKey, name, serviceIds, subscriptionKey, version } = this;
        return { type: schema_1.ServiceType.Dispatch, id: appId, name, appId, authoringKey, serviceIds, subscriptionKey, version };
    }
}
exports.DispatchService = DispatchService;
//# sourceMappingURL=dispatchService.js.map