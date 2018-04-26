const {ServiceBase} = require('./serviceBase');
class GenerateAnswer extends ServiceBase {
    constructor() {
        super('/knowledgebases/{kbId}/generateAnswer');
    }

    /**
    * 
    */
    generateAnswer(params , generateAnswerBody) {
        return this.createRequest('', params, 'post', generateAnswerBody);
    }
}
module.exports = GenerateAnswer;
