const {ServiceBase} = require('./serviceBase');
class GenerateAnswer extends ServiceBase {
    constructor() {
        super('/qnamaker/knowledgebases/{kbId}/generateAnswer', true /* useEndpoint */);
    }

    /**
    * 
    */
    generateAnswer(params , generateAnswerBody) {
        return this.createRequest('', params, 'post', generateAnswerBody);
    }
}
module.exports = GenerateAnswer;
