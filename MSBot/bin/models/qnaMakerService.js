"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */
const url = require("url");
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
        let { id = '', name = '', kbId = '', subscriptionKey = '', endpointKey = '', hostname = '' } = source;
        this.id = kbId;
        if (hostname) {
            hostname = url.resolve(hostname, '/qnamaker');
        }
        Object.assign(this, { id, name, kbId, subscriptionKey, endpointKey, hostname });
    }
    toJSON() {
        const { id, name, kbId, subscriptionKey, endpointKey, hostname } = this;
        return { type: schema_1.ServiceType.QnA, id: kbId, name, kbId, subscriptionKey, endpointKey, hostname };
    }
}
exports.QnaMakerService = QnaMakerService;
//# sourceMappingURL=qnaMakerService.js.map