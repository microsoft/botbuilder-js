const FeedbackRecord = require('./feedbackRecord');

class TrainKnowledgeBase {

    /**
     * @property {FeedbackRecord[]} feedbackRecords
     */


    constructor({feedbackRecords /* FeedbackRecord[] */} = {}) {
        Object.assign(this, {feedbackRecords /* FeedbackRecord[] */});
    }
}

TrainKnowledgeBase.fromJSON = function (source) {
    if (!source) {
        return null;
    }
    if (Array.isArray(source)) {
        return source.map(TrainKnowledgeBase.fromJSON);
    }

    source.feedbackRecords = FeedbackRecord.fromJSON(source.feedbackRecords) || undefined;

    const {feedbackRecords /* FeedbackRecord[] */} = source;
    return new TrainKnowledgeBase({feedbackRecords /* FeedbackRecord[] */});
};

module.exports = TrainKnowledgeBase;
