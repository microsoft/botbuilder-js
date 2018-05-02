const {ServiceBase} = require('./serviceBase');
class UpdateAsync extends ServiceBase {
    constructor() {
        super('/knowledgebases/{kbId}/UpdateAsync');
    }

    /**
    * 
    */
    updateKnowledgebase(params , updateKb/* UpdateKbOperationDTO */) {
        return this.createRequest('', params, 'PATCH', updateKb);
    }
}
module.exports = UpdateAsync;
