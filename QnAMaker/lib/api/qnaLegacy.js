/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */
const request = require('request-promise-native');

const { ServiceBase } = require('./serviceBase');
class QnaLegacy extends ServiceBase {
    constructor() {
        super('/knowledgebases/{kbId}');
    }

    /**
    * 
    */
    async downloadLegacyKnowledgebase(params) {
        params.legacy = true;
        return await this.createRequest('', params, 'get');
    }
}
module.exports = QnaLegacy;
