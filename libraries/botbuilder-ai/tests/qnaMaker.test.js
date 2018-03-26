const assert = require('assert');
const { TestAdapter, BotContext } = require('botbuilder');
const ai = require('../');

// Save test keys
const knowlegeBaseId = process.env.QNAKNOWLEDGEBASEID;
const subscriptionKey = process.env.QNASUBSCRIPTIONKEY;

class TestContext extends BotContext {
    constructor(request) {
        super(new TestAdapter(), request);
        this.sent = undefined;
        this.onSendActivity((context, activities, next) => {
            this.sent = activities;
        });
    }
}

describe('QnAMaker', function () {
    this.timeout(10000);
    if (!knowlegeBaseId) {
        console.warn('WARNING: skipping QnAMaker test suite because QNAKNOWLEDGEBASEID environment variable is not defined');
        return;
    }
    if (!subscriptionKey) {
        console.warn('WARNING: skipping QnAMaker test suite because QNASUBSCRIPTIONKEY environment variable is not defined');
        return;
    }

    it('remote service should work', function () {
        var qna = new ai.QnAMaker({
            knowledgeBaseId: knowlegeBaseId,
            subscriptionKey: subscriptionKey,
            top: 1
        });

        return qna.generateAnswer(`how do I clean the stove?`)
            .then(res => {
                assert(res);
                assert(res.length == 1);
                assert(res[0].answer.startsWith("BaseCamp: You can use a damp rag to clean around the Power Pack"));
            })
            .then(() => qna.generateAnswer("is the stove hard to clean?"))
            .then(res => {
                assert(res);
                assert(res.length == 1);
                assert(res[0].answer.startsWith("BaseCamp: You can use a damp rag to clean around the Power Pack"));
            });
        ;
    });

    it('should run as middleware in fallback mode', function (done) {
        const context = new TestContext({ text: `how do I clean the stove?`, type: 'message' });
        const qnaMaker = new ai.QnAMaker({
            knowledgeBaseId: knowlegeBaseId,
            subscriptionKey: subscriptionKey,
            top: 1
        });

        qnaMaker.onProcessRequest(context, () => Promise.resolve()).then(() => {
            assert(Array.isArray(context.sent) && context.sent.length === 1, `reply not sent.`);
            done();
        });
    });

    it('should run as middleware in intercept mode', function (done) {
        let intercepted = true;
        const context = new TestContext({ text: `how do I clean the stove?`, type: 'message' });
        const qnaMaker = new ai.QnAMaker({
            knowledgeBaseId: knowlegeBaseId,
            subscriptionKey: subscriptionKey,
            top: 1,
            answerBeforeNext: true
        });

        qnaMaker.onProcessRequest(context, () => {
            intercepted = false;
            return  Promise.resolve();
        }).then(() => {
            assert(intercepted, `not intercepted.`)
            assert(Array.isArray(context.sent) && context.sent.length === 1, `reply not sent.`);
            done();
        });
    });
});
