const {ServiceBase} = require('./serviceBase');
class Createasync extends ServiceBase {
    constructor() {
        super('/knowledgebases/createasync');
    }

    /**
    * 
    */
    createKnowledgebase(params , createKbPayload/* CreateKbDTO */) {
        return this.createRequest('', params, 'post', createKbPayload);
    }
}
module.exports = Createasync;
