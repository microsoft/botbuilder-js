/**
  * Copyright (c) Microsoft Corporation. All rights reserved.
  * Licensed under the MIT License.
  */
const {ServiceBase} = require('./serviceBase');
class Createasync extends ServiceBase {
    constructor() {
        super('/knowledgebases/createasync');
    }

    /**
    * Asynchronous operation to create a new knowledgebase.
    */
    createKnowledgebase(params , createKbPayload/* CreateKbDTO */) {
        return this.createRequest('', params, 'POST', createKbPayload);
    }
}
module.exports = Createasync;
