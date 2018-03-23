const {ServiceBase} = require('./serviceBase');

class Knowledgebases extends ServiceBase {
    constructor() {
        super('/knowledgebases/{knowledgeBaseID}');
    }

    /**
     * Publish all unpublished in the knowledgebase to the prod endpoint
     */
    publishKnowledgeBase(params) {
        return this.createRequest('', params, 'put');
    }

    /**
     * Add or delete QnA Pairs and / or URLs to an existing knowledge base.
     */
    updateKnowledgeBase(params, updateKnowledgeBase/* UpdateKnowledgeBase */) {
        return this.createRequest('', params, 'patch', updateKnowledgeBase);
    }

    /**
     * Downloads all the data associated with the specified knowledge base.
     */
    downloadKnowledgeBase(params) {
        return this.createRequest('', params, 'get');
    }

    /**
     * Deletes the specified knowledge base and all data associated with it.
     */
    deleteKnowledgeBase(params) {
        return this.createRequest('', params, 'delete');
    }
}

module.exports = Knowledgebases;
