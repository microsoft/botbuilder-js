const assert = require('assert');
const { TestAdapter, TurnContext } = require('botbuilder');
const ai = require('../');

// Save test keys
const knowlegeBaseId = process.env.QNAKNOWLEDGEBASEID;
const endpointKey = process.env.QNAENDPOINTKEY;
const hostname = process.env.QNAHOSTNAME;

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
    if (!endpointKey) {
        console.warn('WARNING: skipping QnAMaker test suite because QNAENDPOINTKEY environment variable is not defined');
        return;
    }
    if (!hostname) {
        console.warn('WARNING: skipping QnAMaker test suite because QNAHOSTNAME environment variable is not defined');
        return;
    }

    // Generate endpoints
    const endpoint = {
        knowledgeBaseId: knowlegeBaseId,
        endpointKey: endpointKey,
        host: hostname
    }
    const endpointString = `POST /knowledgebases/${knowlegeBaseId}/generateAnswer\r\nHost: ${hostname}\r\nAuthorization: EndpointKey ${endpointKey}\r\nContent-Type: application/json\r\n{"question":"hi"}`;
    const unixEndpointString = `POST /knowledgebases/${knowlegeBaseId}/generateAnswer\nHost: ${hostname}\nAuthorization: EndpointKey ${endpointKey}\nContent-Type: application/json\n{"question":"hi"}`;

    it('should work free standing', function () {
        const qna = new ai.QnAMaker(endpoint, { top: 1 });

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
        const qna = new ai.QnAMaker(endpoint, { top: 1 });

        qna.onTurn(context, () => Promise.resolve()).then(() => {
            assert(Array.isArray(context.sent) && context.sent.length === 1, `reply not sent.`);
            done();
        });
    });

    it('should only call service if no other reply sent when running in fallback mode', function (done) {
        const context = new TestContext({ text: `how do I clean the stove?`, type: 'message' });
        const qna = new ai.QnAMaker(endpoint, { top: 1 });

        qna.onTurn(context, () => context.sendActivity('foo')).then(() => {
            assert(Array.isArray(context.sent) && context.sent[0].text === 'foo', `service must have been called.`);
            done();
        });
    });

    it('should run as middleware in intercept mode', function (done) {
        let intercepted = true;
        const context = new TestContext({ text: `how do I clean the stove?`, type: 'message' });
        const qna = new ai.QnAMaker(endpoint, { top: 1, answerBeforeNext: true });

        qna.onTurn(context, () => {
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
        const qna = new ai.QnAMaker(endpoint, { top: 1, answerBeforeNext: true });

        qna.onTurn(context, () => {
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
        const qna = new ai.QnAMaker(endpoint, { top: 1, answerBeforeNext: true });

        qna.onTurn(context, () => {
            intercepted = false;
            return  Promise.resolve();
        }).then(() => {
            assert(!intercepted, `intercepted.`)
            done();
        });
    });
    
    it('should return 0 answers for an empty or undefined utterance', function () {
        const qna = new ai.QnAMaker(endpoint, { top: 1 });

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
        const qna = new ai.QnAMaker(endpoint, { top: 1 });

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
    
    it('should return "false" from answer() if no good answers found', function (done) {
        const context = new TestContext({ text: `foo`, type: 'message' });
        const qna = new ai.QnAMaker(endpoint, { top: 1 });

        qna.answer(context).then((found) => {
            assert(!found);
            done();
        });
    });
});
