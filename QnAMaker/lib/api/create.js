const {ServiceBase} = require('./serviceBase');

class Create extends ServiceBase {
    constructor() {
        super('/knowledgebases/create');
    }

    /**
     * Creates a new knowledge base.
     */
    createKnowledgeBase(params, createKnowledgeBase/* CreateKnowledgeBase */) {
        return this.createRequest('', params, 'post', createKnowledgeBase);
    }
}

module.exports = Create;
