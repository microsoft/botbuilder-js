const {ServiceBase} = require('./serviceBase');
class Qna extends ServiceBase {
    constructor() {
        super('/knowledgebases/{kbId}/{environment}/qna');
    }

    /**
    * 
    */
    downloadKnowledgebase(params) {
        return this.createRequest('', params, 'get');
    }
}
module.exports = Qna;
