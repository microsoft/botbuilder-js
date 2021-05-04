const QnATelemetryConstants = require('../lib/qnaTelemetryConstants');
const assert = require('assert');
const fs = require('fs');
const nock = require('nock');
const path = require('path');
const sinon = require('sinon');
const { HttpRequestUtils } = require('../lib/qnamaker-utils/httpRequestUtils');
const { JoinOperator } = require('../lib/qnamaker-interfaces/joinOperator');
const { QnAMaker } = require('../');
const { TestAdapter, TurnContext, NullTelemetryClient } = require('botbuilder-core');
const { TrainUtils } = require('../lib/qnamaker-utils/trainUtils');
const { getFetch } = require('../lib/globals');

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
        this.onSendActivities((context, activities) => {
            this.sent = this.sent.concat(activities);
            context.responded = true;
        });
    }
}

describe('QnAMaker', function () {
    const testFiles = fs.readdirSync(path.join(__dirname, 'TestData', this.title));

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
        knowledgeBaseId,
        endpointKey,
        host: `https://${hostname}.azurewebsites.net/qnamaker`,
    };

    let sandbox;
    beforeEach(function () {
        sandbox = sinon.createSandbox();
        nock.cleanAll();

        if (mockQnA) {
            const fileName = this.currentTest.title.replace(/"/g, '').replace(/ /g, '_');
            const filePath = `${__dirname}/TestData/${this.test.parent.title}/`;
            testFiles
                .filter((file) => file.startsWith(`${fileName}.`))
                .forEach((file) => {
                    nock(`https://${hostname}.azurewebsites.net`)
                        .matchHeader('User-Agent', /botbuilder-ai\/4.*/)
                        .post(/qnamaker/)
                        .replyWithFile(200, `${filePath}${file}`);
                });
        }
    });

    afterEach(function () {
        sandbox.restore();
        nock.cleanAll();
    });

    describe('constructor', function () {
        it('succeeds with endpoint and no options', function () {
            new QnAMaker(endpoint);
        });

        it('succeeds with both endpoint and options', function () {
            const options = { top: 7, timeout: 333333 };
            const qna = new QnAMaker(endpoint, options);

            sinon.assert.match(qna._options, sinon.match(options));
        });

        it('throws an error without endpoint', function () {
            assert.throws(() => new QnAMaker(), {
                name: 'TypeError',
                message: 'QnAMaker requires valid QnAMakerEndpoint.',
            });
        });

        it('throws TypeError if options.scoreThreshold is not a number', function () {
            const context = new TestContext({ text: 'what happens when you hug a porcupine?' });
            const options = { scoreThreshold: "I should be a number, but I'm not." };

            assert.throws(() => new QnAMaker(context, options), {
                name: 'TypeError',
                message: `"${options.scoreThreshold}" is an invalid scoreThreshold. QnAMakerOptions.scoreThreshold must have a value between 0 and 1.`,
            });
        });

        it('throws error if options.scoreThreshold is not a number between 0 and 1', function () {
            const context = new TestContext({ text: 'do woodpeckers get concussions?' });
            const options = { scoreThreshold: 9000 };

            assert.throws(() => new QnAMaker(context, options), {
                name: 'TypeError',
                message: `"${options.scoreThreshold}" is an invalid scoreThreshold. QnAMakerOptions.scoreThreshold must have a value between 0 and 1.`,
            });
        });

        it('succeeds if QnAMakerOptions.scoreThreshold is 1', function () {
            const context = new TestContext({ text: 'do woodpeckers get concussions?' });
            const options = { scoreThreshold: 1 };

            new QnAMaker(context, options);
        });

        it('throws RangeError if options.top is not an integer', function () {
            const context = new TestContext({ text: 'what if ostriches could fly?' });
            const options = { top: 2.5 };

            assert.throws(() => new QnAMaker(context, options), {
                name: 'RangeError',
                message: `"${options.top}" is an invalid top value. QnAMakerOptions.top must be an integer greater than 0.`,
            });
        });

        it('throws RangeError if options.top is not a number', function () {
            const context = new TestContext({ text: 'why were there sloths at the post office?' });
            const options = { top: { key: 'value' } };

            assert.throws(() => new QnAMaker(context, options), {
                name: 'RangeError',
                message: `"${options.top}" is an invalid top value. QnAMakerOptions.top must be an integer greater than 0.`,
            });
        });

        it('throws RangeError if options.top is not >1', function () {
            const context = new TestContext({ text: 'why did my son think the wasabi was guacamole?' });
            const options = { top: -1 };

            assert.throws(() => new QnAMaker(context, options), {
                name: 'RangeError',
                message: `"${options.top}" is an invalid top value. QnAMakerOptions.top must be an integer greater than 0.`,
            });
        });

        it('works with null telemetry', function () {
            const options = { top: 7 };
            const qna = new QnAMaker(endpoint, options, null);

            sinon.assert.match(
                qna,
                sinon.match({
                    telemetryClient: sinon.match.instanceOf(NullTelemetryClient),
                    logPersonalInformation: false,
                })
            );
        });

        it('works with null telemetry and logPersonalInformation', function () {
            const options = { top: 7 };
            const qna = new QnAMaker(endpoint, options, null, null);

            sinon.assert.match(
                qna,
                sinon.match({
                    telemetryClient: sinon.match.instanceOf(NullTelemetryClient),
                    logPersonalInformation: false,
                })
            );
        });
    });

    describe('getAnswers', function () {
        it('returns answer without any options specified', async function () {
            const qna = new QnAMaker(endpoint);
            const context = new TestContext({ text: 'where are the unicorns?' });

            const results = await qna.getAnswers(context);

            assert.strictEqual(results.length, 1);
        });

        it('returns answer and active learning flag', async function () {
            const qna = new QnAMaker(endpoint);
            const context = new TestContext({ text: 'where are the unicorns?' });

            const results = await qna.getAnswersRaw(context);

            assert.strictEqual(results.answers.length, 1);
            assert.strictEqual(results.activeLearningEnabled, false);
        });

        it('sorts the answers in the qna results from highest to lowest score', async function () {
            const qna = new QnAMaker(endpoint);
            const context = new TestContext({ text: "what's your favorite animal?" });
            const options = { top: 5 };

            const results = await qna.getAnswers(context, options);
            const sorted = results.slice().sort((a, b) => b.score - a.score);

            assert.deepStrictEqual(results, sorted);
        });

        it('returns answer with prompts', async function () {
            const qna = new QnAMaker(endpoint);
            const context = new TestContext({ text: 'how do I clean the stove?' });
            const options = { top: 2 };

            const results = await qna.getAnswers(context, options);

            assert.strictEqual(results.length, 1);
            assert(results[0].context.prompts.length);
        });

        it('returns answer with high score provided context', async function () {
            const qna = new QnAMaker(endpoint);
            const context = new TestContext({ text: 'where can I buy?' });

            const options = {
                top: 2,
                context: {
                    previousQnAId: 5,
                    previousUserQuery: 'how do I clean the stove?',
                },
            };

            const results = await qna.getAnswers(context, options);

            assert.strictEqual(results.length, 1);
            assert.strictEqual(results[0].score, 1);
        });

        it('returns answer with high score provided id', async function () {
            const qna = new QnAMaker(endpoint);
            const context = new TestContext({ text: 'where can I buy?' });
            const options = { top: 2, qnaId: 55 };

            const results = await qna.getAnswers(context, options);

            assert.strictEqual(results.length, 1);
            assert.strictEqual(results[0].score, 1);
        });

        it('returns answer with low score not provided context', async function () {
            const qna = new QnAMaker(endpoint);
            const context = new TestContext({ text: 'where can I buy?' });
            const options = { top: 2, context: null };

            const results = await qna.getAnswers(context, options);

            assert.strictEqual(results.length, 2);
            assert(results[0].score < 1);
        });

        it('calls qnamaker with isTest true', async function () {
            const qna = new QnAMaker(endpoint);
            const context = new TestContext({ text: 'Q11' });
            const options = { top: 1, context: null, isTest: true };

            const results = await qna.getAnswers(context, options);

            assert.strictEqual(results.length, 0);
        });

        it('calls qnamaker with rankerType questionOnly', async function () {
            const qna = new QnAMaker(endpoint);
            const context = new TestContext({ text: 'Q11' });
            const options = { top: 1, context: null, rankerType: 'QuestionOnly' };

            const results = await qna.getAnswers(context, options);

            assert.strictEqual(results.length, 0);
        });

        it('returns answer with timeout option specified', async function () {
            const options = { timeout: 500000 };
            const qna = new QnAMaker(endpoint, options);
            const context = new TestContext({ text: 'where are the unicorns?' });

            const results = await qna.getAnswers(context, options);

            sinon.assert.match(qna._options, sinon.match(options));
            assert.strictEqual(results.length, 1);
        });

        it('converts legacy response property "qnaId" to "id"', async function () {
            const endpoint = {
                knowledgeBaseId: 'testKbId',
                endpointKey: 'testEndpointKey',
                host: 'https://westus.api.cognitive.microsoft.com/qnamaker/v3.0',
            };

            const qna = new QnAMaker(endpoint);

            const context = new TestContext({ text: 'How do I be the best?' });

            const qnaId = 18;
            nock('https://westus.api.cognitive.microsoft.com')
                .post(`/qnamaker/v3.0/knowledgebases/${endpoint.knowledgeBaseId}/generateanswer`)
                .reply(200, {
                    answers: [
                        {
                            answer: "To be the very best, you gotta catch 'em all",
                            qnaId,
                            questions: ['How do I be the best?'],
                            score: 30.500827898,
                            source: 'Custom Editorial',
                        },
                    ],
                });

            const results = await qna.getAnswers(context);
            assert.strictEqual(results.length, 1);

            const [result] = results;
            sinon.assert.match(
                result,
                sinon.match({
                    id: qnaId,
                    qnaId: sinon.match.undefined,
                })
            );
        });

        it('returns 0 answers for an empty utterance', async function () {
            const qna = new QnAMaker(endpoint, { top: 1 });
            const context = new TestContext({ text: '' });
            const results = await qna.getAnswers(context);

            assert.deepStrictEqual(results, []);
        });

        it('returns 0 answers for an undefined utterance', async function () {
            const qna = new QnAMaker(endpoint, { top: 1 });
            const context = new TestContext({ text: undefined });
            const results = await qna.getAnswers(context);

            assert.deepStrictEqual(results, []);
        });

        it('returns 0 answers for questions without an answer', async function () {
            const qna = new QnAMaker(endpoint, { top: 1 });
            const context = new TestContext({ text: 'foo' });
            const results = await qna.getAnswers(context);

            assert.deepStrictEqual(results, []);
        });

        it('throws TypeError if options.scoreThreshold is not a number in service call', async function () {
            const context = new TestContext({ text: "what's the number for 911?" });
            const qna = new QnAMaker(context);
            const options = { scoreThreshold: 'I should be a number' };

            await assert.rejects(qna.getAnswers(context, options), {
                name: 'TypeError',
                message: `"${options.scoreThreshold}" is an invalid scoreThreshold. QnAMakerOptions.scoreThreshold must have a value between 0 and 1.`,
            });
        });

        it('filters low score variation', async function () {
            const qna = new QnAMaker(endpoint, { top: 5 });
            const context = new TestContext({ text: 'Q11' });

            let results = await qna.getAnswers(context);
            assert.strictEqual(results.length, 4);

            // Apply low score variation
            results = qna.getLowScoreVariation(results);
            assert.strictEqual(results.length, 3);
        });

        it('logs telemetry', async function () {
            const telemetryClient = new NullTelemetryClient();

            sandbox
                .mock(telemetryClient)
                .expects('trackEvent')
                .withArgs(
                    sinon.match({
                        name: 'QnaMessage',
                        properties: sinon.match({
                            answer: sinon.match.string,
                            articleFound: 'true',
                            knowledgeBaseId,
                            question: sinon.match.string,
                            questionId: sinon.match.string,
                            username: sinon.match.string,
                        }),
                        metrics: sinon.match({
                            score: sinon.match.number,
                        }),
                    })
                )
                .once();

            const qna = new QnAMaker(endpoint, { top: 1 }, telemetryClient, true);
            const context = new TestContext({ text: 'where are the unicorns?', from: { name: 'testname' } });

            const results = await qna.getAnswers(context);

            sandbox.verify();
            assert.strictEqual(qna.logPersonalInformation, true);
            assert.strictEqual(results.length, 1);
        });

        it('logs telemetry when no answer found in kb', async function () {
            const telemetryClient = new NullTelemetryClient();

            sandbox
                .mock(telemetryClient)
                .expects('trackEvent')
                .withArgs(
                    sinon.match({
                        name: 'QnaMessage',
                        properties: sinon.match({
                            answer: sinon.match.string,
                            articleFound: 'false',
                            knowledgeBaseId,
                            matchedQuestion: 'No Qna Question matched',
                            question: 'where are the unicorns?',
                            questionId: 'No Qna Question Id matched',
                            username: sinon.match.string,
                        }),
                    })
                )
                .once();

            const qna = new QnAMaker(endpoint, { top: 1 }, telemetryClient, true);
            const context = new TestContext({ text: 'where are the unicorns?', from: { name: 'testname' } });

            const results = await qna.getAnswers(context);

            sandbox.verify();
            assert(qna.logPersonalInformation);
            assert.deepStrictEqual(results, []);
        });

        it('does not log telemetry pii', async function () {
            const telemetryClient = new NullTelemetryClient();

            sandbox
                .mock(telemetryClient)
                .expects('trackEvent')
                .withArgs(
                    sinon.match({
                        name: 'QnaMessage',
                        properties: sinon.match({
                            answer: sinon.match.string,
                            articleFound: 'true',
                            knowledgeBaseId,
                            question: sinon.match.undefined,
                            questionId: sinon.match.string,
                            username: sinon.match.undefined,
                        }),
                        metrics: sinon.match({
                            score: sinon.match.number,
                        }),
                    })
                )
                .once();

            const qna = new QnAMaker(endpoint, { top: 1 }, telemetryClient, false);
            const context = new TestContext({ text: 'where are the unicorns?', from: { name: 'testname' } });

            const results = await qna.getAnswers(context);

            sandbox.verify();
            assert.strictEqual(qna.logPersonalInformation, false);
            assert.strictEqual(results.length, 1);
        });

        it('logs telemetry using derived qna', async function () {
            const telemetryClient = new NullTelemetryClient();

            const telemetryMock = sandbox.mock(telemetryClient);

            telemetryMock
                .expects('trackEvent')
                .withArgs(
                    sinon.match({
                        properties: sinon.match({
                            foo: 'bar',
                            ImportantProperty: 'ImportantValue',
                        }),
                    })
                )
                .once();

            telemetryMock
                .expects('trackEvent')
                .withArgs(
                    sinon.match({
                        name: 'MyQnA',
                        properties: sinon.match({
                            answer: sinon.match.string,
                            articleFound: 'true',
                            knowledgeBaseId,
                            question: sinon.match.string,
                            questionId: 'OVERRIDE',
                            username: sinon.match.string,
                        }),
                        metrics: sinon.match({
                            score: sinon.match.number,
                        }),
                    })
                )
                .once();

            const qna = new OverrideTwoEventsWithOverrideLogger(endpoint, { top: 1 }, telemetryClient, true);
            const context = new TestContext({ text: 'where are the unicorns?', from: { name: 'testname' } });

            const results = await qna.getAnswers(context);

            sandbox.verify();
            assert(qna.logPersonalInformation);
            assert.strictEqual(results.length, 1);
        });

        it('logs telemetry additionalprops', async function () {
            const score = 3.14159;

            const telemetryClient = new NullTelemetryClient();

            sandbox
                .mock(telemetryClient)
                .expects('trackEvent')
                .withArgs(
                    sinon.match({
                        name: 'QnaMessage',
                        properties: sinon.match({
                            answer: sinon.match.string,
                            articleFound: 'true',
                            knowledgeBaseId,
                            question: 'OVERRIDE',
                            MyImportantProperty: 'MyImportantValue',
                            questionId: sinon.match.string,
                            username: sinon.match.string,
                        }),
                        metrics: sinon.match({ score }),
                    })
                )
                .once();

            const qna = new QnAMaker(endpoint, { top: 1 }, telemetryClient, true);
            const context = new TestContext({ text: 'where are the unicorns?', from: { name: 'testname' } });

            const results = await qna.getAnswers(
                context,
                null,
                { question: 'OVERRIDE', MyImportantProperty: 'MyImportantValue' },
                { score }
            );

            sandbox.verify();
            assert(qna.logPersonalInformation);
            assert.strictEqual(results.length, 1);
        });
    });

    describe('emitTraceInfo', function () {
        it('throws TypeError if context is undefined', async function () {
            const qna = new QnAMaker(endpoint);

            await assert.rejects(qna.getAnswers(undefined), {
                name: 'TypeError',
                message: 'QnAMaker.getAnswers() requires a TurnContext.',
            });
        });
    });

    describe('trainAPI', function () {
        it('calls train async function', async function () {
            const qna = new QnAMaker(endpoint);

            await qna.callTrain({
                feedbackRecords: [
                    {
                        userId: 'test',
                        userQuestion: 'How are you?',
                        qnaId: 1,
                    },
                    {
                        userId: 'test',
                        userQuestion: 'Whats up?',
                        qnaId: 2,
                    },
                ],
            });
        });
    });

    describe('Deprecated QnA Methods', function () {
        it('works free standing', async function () {
            const qna = new QnAMaker(endpoint, { top: 1 });
            const answer = 'BaseCamp: You can use a damp rag to clean around the Power Pack';

            let results = await qna.generateAnswer(`how do I clean the stove?`);

            assert(results);
            assert.strictEqual(results.length, 1);
            assert(results[0].answer.startsWith(answer));

            results = await qna.generateAnswer('is the stove hard to clean?');

            assert(results);
            assert.strictEqual(results.length, 1);
            assert(results[0].answer.startsWith(answer));
        });

        it('returns 0 answers for a question with no answer after a succesful call', async function () {
            const qna = new QnAMaker(endpoint, { top: 1 });
            const answer = 'BaseCamp: You can use a damp rag to clean around the Power Pack';

            let results = await qna.generateAnswer(`how do I clean the stove?`);

            assert(results);
            assert.strictEqual(results.length, 1);
            assert(results[0].answer.startsWith(answer));

            results = await qna.generateAnswer('how is the weather?');

            assert.deepStrictEqual(results, []);
        });

        it('returns 0 answers for an empty utterance', async function () {
            const qna = new QnAMaker(endpoint, { top: 1 });
            const results = await qna.generateAnswer('');

            assert.deepStrictEqual(results, []);
        });

        it('returns 0 answers for an undefined utterance', async function () {
            const qna = new QnAMaker(endpoint, { top: 1 });
            const results = await qna.generateAnswer(undefined);

            assert.deepStrictEqual(results, []);
        });

        it('returns 0 answers for questions without an answer', async function () {
            const qna = new QnAMaker(endpoint, { top: 1 });
            const results = await qna.generateAnswer(`foo`);

            assert.deepStrictEqual(results, []);
        });

        it('emits trace info once per call to Answer', async function () {
            const context = new TestContext({ text: `how do I clean the stove?`, type: 'message' });
            const qna = new QnAMaker(endpoint, { top: 1 });

            const found = await qna.answer(context);
            assert(found);

            const traceActivity = context.sent.find(
                (activity) => activity.type === 'trace' && activity.name === 'QnAMaker'
            );

            sinon.assert.match(
                traceActivity,
                sinon.match({
                    type: 'trace',
                    name: 'QnAMaker',
                    label: 'QnAMaker Trace',
                    valueType: 'https://www.qnamaker.ai/schemas/trace',
                    value: sinon.match({
                        message: sinon.match.object,
                        queryResults: sinon.match.array,
                        knowledgeBaseId,
                        scoreThreshold: sinon.match.number,
                    }),
                })
            );
        });

        it('returns false from answer if no good answers found', async function () {
            const context = new TestContext({ text: `foo`, type: 'message' });
            const qna = new QnAMaker(endpoint, { top: 1 });

            assert.strictEqual(await qna.answer(context), false);
        });

        it('throws TypeError from answer if no context', async function () {
            const qna = new QnAMaker(endpoint);

            await assert.rejects(qna.answer(undefined), {
                name: 'TypeError',
                message: 'QnAMaker.answer() requires a TurnContext.',
            });
        });

        it('sorts results from generateAnswers in descending order', async function () {
            const qna = new QnAMaker(endpoint);
            const question = "what's your favorite animal?";

            const results = await qna.generateAnswer(question, 5);
            const sorted = results.slice().sort((a, b) => b.score - a.score);

            assert.deepStrictEqual(results, sorted);
        });

        it('returns answer for question with answer with options.strictFilters applied', async function () {
            const qna = new QnAMaker(endpoint);
            const question = 'what happens when you hug a procupine?';

            const filters = [
                {
                    name: 'animal',
                    value: 'procupine',
                },
            ];

            const results = await qna.generateAnswer(question, filters);
            assert.strictEqual(results.length, 1);
        });

        it('returns answer for question with answer with two options.strictFilters applied', async function () {
            const qna = new QnAMaker(endpoint);
            const question = 'what happens when you hug a procupine?';

            const filters = [
                {
                    name: 'animal',
                    value: 'procupine',
                },
                {
                    name: 'animal',
                    value: 'tiger',
                },
            ];

            const results = await qna.generateAnswer(question, filters, JoinOperator.OR);
            assert.strictEqual(results.length, 1);
        });
    });

    describe('getFetch()', function () {
        it('returns fetch instance from global', function () {
            global.fetch = function () {
                return null;
            };

            const fetch = getFetch();
            assert.deepStrictEqual(fetch, global.fetch);

            delete global.fetch;
        });

        it('sets fetch if it does not exist', function () {
            if (global.fetch) {
                delete global.fetch;
            }

            const fetch = getFetch();
            assert(typeof fetch === 'function');
        });
    });

    describe('Active Learning', function () {
        const endpoint = {
            knowledgeBaseId: 'testKbId',
            endpointKey: 'testEndpointKey',
            host: 'https://dummyqna.azurewebsites.net/qnamaker',
        };

        const trainApi = `/knowledgebases/${endpoint.knowledgeBaseId}/train`;
        const feedbackRecords = [{ userId: 'user1', userQuestion: 'wi-fi', qnaId: '17' }];

        describe('executeHttpRequest', function () {
            it('returns JSON result from Train API response of 204 No-Content', async function () {
                nock(endpoint.host).post(trainApi).reply(204);

                const payload = JSON.stringify({ feedbackRecords });

                const httpUtils = new HttpRequestUtils();

                const result = await httpUtils.executeHttpRequest(endpoint.host + trainApi, payload, endpoint);

                assert.strictEqual(result, undefined);
            });

            it('throws when payload to QnA Service is malformed', async function () {
                nock(endpoint.host)
                    .post(trainApi)
                    .replyWithError({
                        error: {
                            code: 12,
                            message: 'Parameter is null',
                            target: null,
                            details: null,
                            innerError: null,
                        },
                    });

                const payload = JSON.stringify({
                    feedbackRecords: { feedbackRecords },
                });

                const httpUtils = new HttpRequestUtils();

                await assert.rejects(httpUtils.executeHttpRequest(`${endpoint.host}${trainApi}`, payload, endpoint));
            });
        });

        describe('callTrain', function () {
            it('sends correct payload body to Train API', async function () {
                nock(endpoint.host).post(trainApi).reply(204);

                const utils = new TrainUtils(endpoint);
                await utils.callTrain(feedbackRecords);
            });
        });
    });
});

class OverrideTwoEventsWithOverrideLogger extends QnAMaker {
    async onQnaResults(qnaResults, turnContext, _telemetryProperties, _telmetryMetrics) {
        // Track regular property
        this.telemetryClient.trackEvent({
            name: QnATelemetryConstants.qnaMessageEvent,
            properties: { foo: 'bar', ImportantProperty: 'ImportantValue' },
        });

        this.fillQnAEvent(qnaResults, turnContext, { questionId: 'OVERRIDE' }).then((data) => {
            // Add additional event
            this.telemetryClient.trackEvent({
                name: 'MyQnA',
                properties: data[0],
                metrics: data[1],
            });
        });
    }
}
