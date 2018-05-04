/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */
const { ServiceBase } = require('./serviceBase');
class Knowledgebase extends ServiceBase {
    constructor() {
        super('/knowledgebases/{kbId}');
    }

    /**
    * Asynchronous operation to modify a knowledgebase.
    */
    updateKnowledgebase(params, updateKb/* UpdateKbOperationDTO */) {
        return this.createRequest('', params, 'PATCH', updateKb);
    }
    /**
    * Replace knowledgebase contents.
    */
    replaceKnowledgebase(params, replaceKb/* ReplaceKbDTO */) {
        return this.createRequest('', params, 'PUT', replaceKb);
    }
    /**
    * Publishes all changes in test index of a knowledgebase to its prod index.
    */
    publishKnowledgebase(params) {
        return this.createRequest('', params, 'POST');
    }
    /**
    * Deletes the knowledgebase and all its data.
    */
    deleteKnowledgebase(params) {
        return this.createRequest('', params, 'DELETE');
    }
    /**
    * Gets details of a specific knowledgebase.
    */
    getKnowledgebaseDetails(params) {
        return this.createRequest('', params, 'GET');
    }
}
module.exports = Knowledgebase;
