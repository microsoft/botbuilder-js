"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */
const schema_1 = require("../schema");
const connectedService_1 = require("./connectedService");
class EndpointService extends connectedService_1.ConnectedService {
    constructor(source) {
        super(source);
        this.type = schema_1.ServiceType.Endpoint;
        this.appId = '';
        this.appPassword = '';
        this.endpoint = '';
        const { appId = '', appPassword = '', endpoint = '' } = source;
        this.id = endpoint;
        Object.assign(this, { appId, appPassword, endpoint });
    }
    toJSON() {
        const { appId = '', id = '', appPassword = '', endpoint = '', name = '' } = this;
        return { type: schema_1.ServiceType.Endpoint, name, id: endpoint, appId, appPassword, endpoint };
    }
}
exports.EndpointService = EndpointService;
//# sourceMappingURL=endpointService.js.map