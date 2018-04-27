const {ServiceBase} = require('./serviceBase');
class UpdateAsync extends ServiceBase {
    constructor() {
        super('/knowledgebases/{kbId}/UpdateAsync');
    }

    /**
    * 
    */
    updateKnowledgebase(params , updateKb/* UpdateKbOperationDTO */) {
        return this.createRequest('', params, 'patch', updateKb);
    }
}
module.exports = UpdateAsync;
