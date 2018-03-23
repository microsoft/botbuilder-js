const {ServiceBase} = require('./serviceBase');

class Train extends ServiceBase {
    constructor() {
        super('/knowledgebases/{knowledgeBaseID}/train');
    }

    /**
     * The developer of the knowledge base service can use this API to submit user feedback for tuning question-answer matching. QnA Maker uses active learning to learn from the user utterances that come on a published Knowledge base service. In this process, QnA Maker records user feedback from different users and trains the knowledge base to respond accordingly, when there are sufficient number of users sending the same feedback. Every user feedback is logged and model training is triggered when there are 50 new feedback instances. Typically, the model updates are reflected when same question-answer pair from the knowledge base is sent as feedback for a given user query by at least 20 users. Most changes are immediately reflected in both the published and the saved knowledge bases. Some new question-answer pairs are only added to the saved knowledge base and they are moved to the published version in the next knowledge base publish operation by the developer. This gives the flexibility to the developer to keep or discard the newly added question-answer pairs.
     */
    trainKnowledgeBase(params, trainKnowledgeBase/* TrainKnowledgeBase */) {
        return this.createRequest('', params, 'patch', trainKnowledgeBase);
    }
}

module.exports = Train;
