const assert = require('assert');
const { TestAdapter, TurnContext } = require('botbuilder');
const ai = require('../');
const nock = require('nock');
const fs = require('fs');

// Save test keys
const knowledgeBaseId = process.env.QNAKNOWLEDGEBASEID;
const endpointKey = process.env.QNAENDPOINTKEY;
const hostname = process.env.QNAHOSTNAME || 'botbuilder-test-app';
const forceMockQnA = false;
const mockQnA = forceMockQnA || !(knowledgeBaseId && endpointKey);

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

describe('QnAMaker', function () {
    const testFiles = fs.readdirSync(`${ __dirname }/TestData/${ this.title }/`);

    if (!knowledgeBaseId) {
        console.warn('WARNING: QnAMaker test suite QNAKNOWLEDGEBASEID environment variable is not defined');
    }
    if (!endpointKey) {
        console.warn('WARNING: QnAMaker test suite QNAENDPOINTKEY environment variable is not defined');
    }
    if (mockQnA) {
        console.info('INFO: QnAMaker test suite will execute using mocked responses');
    }

    // Generate endpoints
    const endpoint = {
        knowledgeBaseId: knowledgeBaseId,
        endpointKey: endpointKey,
        host: `https://${ hostname }.azurewebsites.net/qnamaker`
    }

    beforeEach(function(done){
        if (mockQnA) {
            var fileName = replaceCharacters(this.currentTest.title);
            var filePath = `${ __dirname }/TestData/${ this.test.parent.title }/`;
            var arr = testFiles.filter(function(file) { return file.startsWith(fileName + '.')} )

            arr.forEach(file => {
                nock(`https://${ hostname }.azurewebsites.net`).post(/qnamaker/)
                .replyWithFile(200, filePath + file)
            });
        }
        done();
    })

    afterEach(function(done){
        nock.cleanAll();
        done();
    });

    function replaceCharacters (testName, testDesc) {
        return testName
        .replace(/"/g, '')
        .replace(/ /g, '_');
    }

    it('should work free standing', function () {
        const qna = new ai.QnAMaker(endpoint, { top: 1 });
        let answer = 'BaseCamp: You can use a damp rag to clean around the Power Pack';

        return qna.generateAnswer(`how do I clean the stove?`)
            .then(res => {
                assert.notStrictEqual(res, true, `The response was returned as 'undefined'.`);
                assert.strictEqual(res.length, 1, 'Should have received just one answer on the first call.');
                assert.strictEqual(res[0].answer.startsWith(answer), true, `The answer should have started with '${ answer }' for the first call.`);
            })
            .then(() => qna.generateAnswer("is the stove hard to clean?"))
            .then(res => {
                assert.notStrictEqual(res, true, `The response was returned as 'undefined'.`);
                assert.strictEqual(res.length, 1, 'Should have received just one answer on the second call.');
                assert.strictEqual(res[0].answer.startsWith(answer), true, `The answer should have started with '${ answer }' for the second call.`);
            });
    });

    it('should return 0 answers for a question with no answer after a succesful call', function () {
        const qna = new ai.QnAMaker(endpoint, { top: 1 });
        let answer = 'BaseCamp: You can use a damp rag to clean around the Power Pack';

        return qna.generateAnswer(`how do I clean the stove?`)
            .then(res => {
                assert.notStrictEqual(res, true, `The response was returned as 'undefined'.`);
                assert.strictEqual(res.length, 1, 'Should have received just one answer on the first call.');
                assert.strictEqual(res[0].answer.startsWith(answer), true, `The answer should have started with '${ answer }' for the first call.`);
            })
            .then(() => qna.generateAnswer('how is the weather?'))
            .then(res => {
                assert.notStrictEqual(res, true, `The response was returned as 'undefined'.`);
                assert.strictEqual(res.length, 0, 'Should have not received answers for a question with no answers.');
            });
    });
    
    it('should return 0 answers for an empty or undefined utterance', function () {
        const qna = new ai.QnAMaker(endpoint, { top: 1 });
        
        return qna.generateAnswer(``)
            .then(res => {
                assert.notStrictEqual(res, true, `The response was returned as 'undefined'.`);
                assert.strictEqual(res.length, 0, 'Should have not received answers for an empty utterance.');
            })
            .then(() => qna.generateAnswer(undefined))
            .then(res => {
                assert.strictEqual(res.length, 0, 'Should have not received answers for an undefined utterance.');
            });
    });

    it('should return 0 answers for questions without an answer.', function () {
        const qna = new ai.QnAMaker(endpoint, { top: 1 });

        return qna.generateAnswer(`foo`)
            .then(res => {
                assert.notStrictEqual(res, true, `The response was returned as 'undefined'.`);
                assert.strictEqual(res.length, 0, `Should have not received answers for a question with no answer, it returned ${JSON.stringify(res)}.`);
            })
            .then(() => qna.generateAnswer(undefined))
            .then(res => {
                assert.strictEqual(res.length, 0, 'Should have not received answers for an undefined question.');
            });
    });
    
    it('should return "false" from answer() if no good answers found', function (done) {
        const context = new TestContext({ text: `foo`, type: 'message' });
        const qna = new ai.QnAMaker(endpoint, { top: 1 });

        qna.answer(context).then((found) => {
            assert.strictEqual(found, false, `Should have returned 'false' for questions with no good answers`);
            done();
        });
    });

    it('should emit trace info once per call to Answer', function (done) {
        const context = new TestContext({ text: `how do I clean the stove?`, type: 'message'});
        const qna = new ai.QnAMaker(endpoint, { top: 1 });

        qna.answer(context)
            .then((found) => {
                assert.strictEqual(found, true, `Found answer should have returned 'true'.`);
                let qnaMakerTraceActivies = context.sent.filter(s => s.type === 'trace' && s.name === 'QnAMaker');
                assert.strictEqual(qnaMakerTraceActivies.length, 1, 'Should have returned just one answer');
                traceActivity = qnaMakerTraceActivies[0];
                assert.strictEqual(traceActivity.type, 'trace', `Should have returned 'trace'.`);
                assert.strictEqual(traceActivity.name, 'QnAMaker', `Should have returned 'QnAMaker'.`);
                assert.strictEqual(traceActivity.label, 'QnAMaker Trace', `Should have returned 'QnAMaker Trace'.`);
                assert.strictEqual(traceActivity.valueType, 'https://www.qnamaker.ai/schemas/trace', `Should have returned 'https://www.qnamaker.ai/schemas/trace\'.`);
                assert.strictEqual(traceActivity.hasOwnProperty('value'), true, `'traceActivity' should have 'value' property.`);
                assert.strictEqual(traceActivity.value.hasOwnProperty('message'), true, `'traceActivity.value' should have 'message' property.`);
                assert.strictEqual(traceActivity.value.hasOwnProperty('queryResults'), true, `'traceActivity.value' should have 'queryResults' property.'`);
                assert.strictEqual(traceActivity.value.knowledgeBaseId, knowledgeBaseId, `Should have returned '${ knowledgeBaseId }'`);
                assert.strictEqual(traceActivity.value.hasOwnProperty('scoreThreshold'), true, `'traceActivity.value' should have 'scoreThreshold' property.'`);
                done();
            });
    });
});