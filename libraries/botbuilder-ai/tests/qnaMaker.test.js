const assert = require('assert');
const { TestAdapter, TurnContext } = require('botbuilder');
const ai = require('../');

// Save test keys
const knowledgeBaseId = process.env.QNAKNOWLEDGEBASEID;
const endpointKey = process.env.QNAENDPOINTKEY;
const hostname = process.env.QNAHOSTNAME;

class TestContext extends TurnContext {
    constructor(request) {
        super(new TestAdapter(), request);
        this.sent = [];
        this.onSendActivities((context, activities, next) => {
            this.sent = this.sent.concat(activities);
            context.responded = true;
        });
    }
}

xdescribe('QnAMaker', function () {
    this.timeout(10000);
    if (!knowledgeBaseId) {
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
        knowledgeBaseId: knowledgeBaseId,
        endpointKey: endpointKey,
        host: hostname
    }
    const endpointString = `POST /knowledgebases/${knowledgeBaseId}/generateAnswer\r\nHost: ${hostname}\r\nAuthorization: EndpointKey ${endpointKey}\r\nContent-Type: application/json\r\n{"question":"hi"}`;
    const unixEndpointString = `POST /knowledgebases/${knowledgeBaseId}/generateAnswer\nHost: ${hostname}\nAuthorization: EndpointKey ${endpointKey}\nContent-Type: application/json\n{"question":"hi"}`;

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

    it('should emit trace info once per call to Answer', function (done) {
        const context = new TestContext({ text: `how do I clean the stove?`, type: 'message'});
        const qna = new ai.QnAMaker(endpoint, { top: 1 });

        qna.answer(context)
            .then((found) => {
                assert(found);
                let qnaMakerTraceActivies = context.sent.filter(s => s.type === 'trace' && s.name === 'QnAMaker');
                assert(qnaMakerTraceActivies.length === 1);
                traceActivity = qnaMakerTraceActivies[0];
                assert(traceActivity.type === 'trace');
                assert(traceActivity.name === 'QnAMaker');
                assert(traceActivity.label === 'QnAMaker Trace');
                assert(traceActivity.valueType === 'https://www.qnamaker.ai/schemas/trace');
                assert(traceActivity.value);
                assert(traceActivity.value.message);
                assert(traceActivity.value.queryResults);
                assert(traceActivity.value.knowledgeBaseId === knowledgeBaseId);
                assert(traceActivity.value.scoreThreshold);
                done();
            });
    });
});
