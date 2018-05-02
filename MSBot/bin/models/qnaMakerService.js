"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */
const schema_1 = require("../schema");
const connectedService_1 = require("./connectedService");
class QnaMakerService extends connectedService_1.ConnectedService {
    constructor(source = {}) {
        super(source);
        this.type = schema_1.ServiceType.QnA;
        this.kbId = '';
        this.subscriptionKey = '';
        this.hostname = '';
        this.endpointKey = '';
        const { kbId = '', name = '', subscriptionKey = '', endpointKey = '', hostname = '' } = source;
        Object.assign(this, { kbId, name, subscriptionKey, endpointKey, hostname });
    }
    toJSON() {
        const { kbId, id, name, subscriptionKey, endpointKey, hostname } = this;
        return { kbId, name, type: schema_1.ServiceType.QnA, subscriptionKey, id, endpointKey, hostname };
    }
}
exports.QnaMakerService = QnaMakerService;
//# sourceMappingURL=qnaMakerService.js.map