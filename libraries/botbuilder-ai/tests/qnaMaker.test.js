const assert = require('assert');
const { TestAdapter, TurnContext } = require('botbuilder');
const ai = require('../');

// Save test keys
const knowlegeBaseId = process.env.QNAKNOWLEDGEBASEID;
const subscriptionKey = process.env.QNASUBSCRIPTIONKEY;

class TestContext extends TurnContext {
    constructor(request) {
        super(new TestAdapter(), request);
        this.sent = undefined;
        this.onSendActivities((context, activities, next) => {
            this.sent = activities;
            context.responded = true;
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

    it('should work free standing', function () {
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
    });

    it('should run as middleware in fallback mode', function (done) {
        const context = new TestContext({ text: `how do I clean the stove?`, type: 'message' });
        const qnaMaker = new ai.QnAMaker({
            knowledgeBaseId: knowlegeBaseId,
            subscriptionKey: subscriptionKey,
            top: 1
        });

        qnaMaker.onTurn(context, () => Promise.resolve()).then(() => {
            assert(Array.isArray(context.sent) && context.sent.length === 1, `reply not sent.`);
            done();
        });
    });

    it('should only call service if no other reply sent when running in fallback mode', function (done) {
        const context = new TestContext({ text: `how do I clean the stove?`, type: 'message' });
        const qnaMaker = new ai.QnAMaker({
            knowledgeBaseId: knowlegeBaseId,
            subscriptionKey: subscriptionKey,
            top: 1
        });

        qnaMaker.onTurn(context, () => context.sendActivity('foo')).then(() => {
            assert(Array.isArray(context.sent) && context.sent[0].text === 'foo', `service must have been called.`);
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

        qnaMaker.onTurn(context, () => {
            intercepted = false;
            return  Promise.resolve();
        }).then(() => {
            assert(intercepted, `not intercepted.`)
            assert(Array.isArray(context.sent) && context.sent.length === 1, `reply not sent.`);
            done();
        });
    });

    it('should bypass calling service in middleware for non-message activities.', function (done) {
        let intercepted = true;
        const context = new TestContext({ text: `how do I clean the stove?`, type: 'foo' });
        const qnaMaker = new ai.QnAMaker({
            knowledgeBaseId: knowlegeBaseId,
            subscriptionKey: subscriptionKey,
            top: 1,
            answerBeforeNext: true
        });

        qnaMaker.onTurn(context, () => {
            intercepted = false;
            return  Promise.resolve();
        }).then(() => {
            assert(!intercepted, `intercepted.`)
            done();
        });
    });
    
    it('should continue on to bot logic when run as intercept middleware and no answer found', function (done) {
        let intercepted = true;
        const context = new TestContext({ text: `foo`, type: 'message' });
        const qnaMaker = new ai.QnAMaker({
            knowledgeBaseId: knowlegeBaseId,
            subscriptionKey: subscriptionKey,
            top: 1,
            answerBeforeNext: true
        });

        qnaMaker.onTurn(context, () => {
            intercepted = false;
            return  Promise.resolve();
        }).then(() => {
            assert(!intercepted, `intercepted.`)
            done();
        });
    });
    
    it('should return 0 answers for an empty or undefined utterance', function () {
        var qna = new ai.QnAMaker({
            knowledgeBaseId: knowlegeBaseId,
            subscriptionKey: subscriptionKey,
            top: 1
        });

        return qna.generateAnswer(``)
            .then(res => {
                assert(res);
                assert(res.length == 0);
            })
            .then(() => qna.generateAnswer(undefined))
            .then(res => {
                assert(res.length == 0);
            });
    });

    it('should return 0 answers for questions without an answer.', function () {
        var qna = new ai.QnAMaker({
            knowledgeBaseId: knowlegeBaseId,
            subscriptionKey: subscriptionKey,
            top: 1
        });

        return qna.generateAnswer(`foo`)
            .then(res => {
                assert(res);
                assert(res.length == 0, `returned ${JSON.stringify(res)}`);
            })
            .then(() => qna.generateAnswer(undefined))
            .then(res => {
                assert(res.length == 0);
            });
    });

    it('should support changing endpoint', function () {
        var qna = new ai.QnAMaker({
            knowledgeBaseId: knowlegeBaseId,
            subscriptionKey: subscriptionKey,
            serviceEndpoint: 'https://westus.api.cognitive.microsoft.com/',
            top: 1
        });

        return qna.generateAnswer(`how do I clean the stove?`).then(res => {
            assert(res);
            assert(res.length == 1);
            assert(res[0].answer.startsWith("BaseCamp: You can use a damp rag to clean around the Power Pack"));
        });
    });
    
    it('should add trailing "/" to changed endpoint', function () {
        var qna = new ai.QnAMaker({
            knowledgeBaseId: knowlegeBaseId,
            subscriptionKey: subscriptionKey,
            serviceEndpoint: 'https://westus.api.cognitive.microsoft.com',
            top: 1
        });

        return qna.generateAnswer(`how do I clean the stove?`).then(res => {
            assert(res);
            assert(res.length == 1);
            assert(res[0].answer.startsWith("BaseCamp: You can use a damp rag to clean around the Power Pack"));
        });
    });

    it('should return "false" from answer() if no good answers found', function (done) {
        const context = new TestContext({ text: `foo`, type: 'message' });
        const qnaMaker = new ai.QnAMaker({
            knowledgeBaseId: knowlegeBaseId,
            subscriptionKey: subscriptionKey,
            top: 1
        });

        qnaMaker.answer(context).then((found) => {
            assert(!found);
            done();
        });
    });
});
