/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */
const {ServiceBase} = require('./serviceBase');
class UpdateAsync extends ServiceBase {
    constructor() {
        super('/knowledgebases/{kbId}');
    }

    /**
    * 
    */
    updateKnowledgebase(params , updateKb/* UpdateKbOperationDTO */) {
        return this.createRequest('', params, 'PATCH', updateKb);
    }
}
module.exports = UpdateAsync;
