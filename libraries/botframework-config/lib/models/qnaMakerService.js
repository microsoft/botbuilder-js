"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */
const url = require("url");
const encrypt_1 = require("../encrypt");
const schema_1 = require("../schema");
const connectedService_1 = require("./connectedService");
class QnaMakerService extends connectedService_1.ConnectedService {
    constructor(source = {}) {
        super(source);
        this.type = schema_1.ServiceTypes.QnA;
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
        return { type: schema_1.ServiceTypes.QnA, id: kbId, name, kbId, subscriptionKey, endpointKey, hostname };
    }
    // encrypt keys in service
    encrypt(secret, iv) {
        this.endpointKey = encrypt_1.encryptString(this.endpointKey, secret, iv);
        this.subscriptionKey = encrypt_1.encryptString(this.subscriptionKey, secret, iv);
    }
    // decrypt keys in service
    decrypt(secret, iv) {
        this.endpointKey = encrypt_1.decryptString(this.endpointKey, secret, iv);
        this.subscriptionKey = encrypt_1.decryptString(this.subscriptionKey, secret, iv);
    }
}
exports.QnaMakerService = QnaMakerService;
//# sourceMappingURL=qnaMakerService.js.map