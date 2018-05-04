/**
  * Copyright (c) Microsoft Corporation. All rights reserved.
  * Licensed under the MIT License.
  */
const {ServiceBase} = require('./serviceBase');
class Knowledgebases extends ServiceBase {
    constructor() {
        super('/knowledgebases');
    }

    /**
    * Gets all knowledgebases for a user.
    */
    getKnowledgebasesForUser(params) {
        return this.createRequest('', params, 'GET');
    }
}
module.exports = Knowledgebases;
