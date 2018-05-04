/**
  * Copyright (c) Microsoft Corporation. All rights reserved.
  * Licensed under the MIT License.
  */
const {ServiceBase} = require('./serviceBase');
class Qna extends ServiceBase {
    constructor() {
        super('/knowledgebases/{kbId}/{environment}/qna');
    }

    /**
    * Download the knowledgebase.
    */
    downloadKnowledgebase(params) {
        return this.createRequest('', params, 'GET');
    }
}
module.exports = Qna;
