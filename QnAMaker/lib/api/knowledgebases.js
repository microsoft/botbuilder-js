const {ServiceBase} = require('./serviceBase');
class Knowledgebases extends ServiceBase {
    constructor() {
        super('/knowledgebases');
    }

    /**
    * 
    */
    getKnowledgebasesForUser(params) {
        return this.createRequest('', params, 'get');
    }
    /**
    * 
    */
    replaceKnowledgebase(params , replaceKb/* ReplaceKbDTO */) {
        return this.createRequest('', params, 'put', replaceKb);
    }
    /**
    * 
    */
    publishKnowledgebase(params) {
        return this.createRequest('', params, 'post');
    }
    /**
    * 
    */
    deleteKnowledgebase(params) {
        return this.createRequest('', params, 'delete');
    }
    /**
    * 
    */
    getKnowledgebaseDetails(params) {
        return this.createRequest('', params, 'get');
    }
}
module.exports = Knowledgebases;
