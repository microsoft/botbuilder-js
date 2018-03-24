const {ServiceBase} = require('./serviceBase');

class GenerateAnswer extends ServiceBase {
    constructor() {
        super('/knowledgebases/{knowledgeBaseID}/generateAnswer');
    }

    /**
     * Returns the list of answers for the given question sorted in descending order of ranking score.
     */
    generateAnswer(params, generateAnswer/* GenerateAnswer */) {
        return this.createRequest('', params, 'post', generateAnswer);
    }
}

module.exports = GenerateAnswer;
