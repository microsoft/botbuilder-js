const QnATelemetryConstants = require('../lib/qnaTelemetryConstants');
const assert = require('assert');
const fs = require('fs');
const nock = require('nock');
const path = require('path');
const sinon = require('sinon');
const { HttpRequestUtils } = require('../lib/qnamaker-utils/httpRequestUtils');
const { ServiceType } = require('../lib/qnamaker-interfaces/serviceType');
const { CustomQuestionAnswering, QnAMakerDialog, JoinOperator, RankerTypes } = require('../');
const { TestAdapter, TurnContext, NullTelemetryClient } = require('botbuilder-core');
const { getFetch } = require('../lib/globals');

// Save test keys
const knowledgeBaseId = process.env.QNAKNOWLEDGEBASEID || 'dummy-id';
const endpointKey = process.env.QNAENDPOINTKEY || 'dummy-key';
const hostname = process.env.QNAHOSTNAME || 'botbuilder-test-app';
const forceMockQnA = true;
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

describe('LanguageService', function () {
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
        host: `https://${hostname}.cognitiveservices.azure.com`,
        qnaServiceType: ServiceType.language,
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
                    nock(`https://${hostname}.cognitiveservices.azure.com`)
                        .matchHeader('user-Agent', /botbuilder-ai\/4.*/)
                        .post(
                            `/language/:query-knowledgebases?projectName=${knowledgeBaseId}&deploymentName=production&api-version=2021-10-01`
                        )
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
            new CustomQuestionAnswering(endpoint);
        });

        it('succeeds with both endpoint and options', function () {
            const options = { top: 7, timeout: 333333 };
            const qna = new CustomQuestionAnswering(endpoint, options);

            sinon.assert.match(qna._options, sinon.match(options));
        });

        it('throws an error without endpoint', function () {
            assert.throws(() => new CustomQuestionAnswering(), {
                name: 'TypeError',
                message: 'QnAMaker requires valid QnAMakerEndpoint.',
            });
        });

        it('throws TypeError if options.scoreThreshold is not a number', function () {
            const context = new TestContext({ text: 'what happens when you hug a porcupine?' });
            const options = { scoreThreshold: "I should be a number, but I'm not." };

            assert.throws(() => new CustomQuestionAnswering(context, options), {
                name: 'TypeError',
                message: `"${options.scoreThreshold}" is an invalid scoreThreshold. QnAMakerOptions.scoreThreshold must have a value between 0 and 1.`,
            });
        });

        it('throws error if options.scoreThreshold is not a number between 0 and 1', function () {
            const context = new TestContext({ text: 'do woodpeckers get concussions?' });
            const options = { scoreThreshold: 9000 };

            assert.throws(() => new CustomQuestionAnswering(context, options), {
                name: 'TypeError',
                message: `"${options.scoreThreshold}" is an invalid scoreThreshold. QnAMakerOptions.scoreThreshold must have a value between 0 and 1.`,
            });
        });

        it('succeeds if QnAMakerOptions.scoreThreshold is 1', function () {
            const context = new TestContext({ text: 'do woodpeckers get concussions?' });
            const options = { scoreThreshold: 1 };

            new CustomQuestionAnswering(context, options);
        });

        it('throws RangeError if options.top is not an integer', function () {
            const context = new TestContext({ text: 'what if ostriches could fly?' });
            const options = { top: 2.5 };

            assert.throws(() => new CustomQuestionAnswering(context, options), {
                name: 'RangeError',
                message: `"${options.top}" is an invalid top value. QnAMakerOptions.top must be an integer greater than 0.`,
            });
        });

        it('throws RangeError if options.top is not a number', function () {
            const context = new TestContext({ text: 'why were there sloths at the post office?' });
            const options = { top: { key: 'value' } };

            assert.throws(() => new CustomQuestionAnswering(context, options), {
                name: 'RangeError',
                message: `"${options.top}" is an invalid top value. QnAMakerOptions.top must be an integer greater than 0.`,
            });
        });

        it('throws RangeError if options.top is not >1', function () {
            const context = new TestContext({ text: 'why did my son think the wasabi was guacamole?' });
            const options = { top: -1 };

            assert.throws(() => new CustomQuestionAnswering(context, options), {
                name: 'RangeError',
                message: `"${options.top}" is an invalid top value. QnAMakerOptions.top must be an integer greater than 0.`,
            });
        });

        it('works with null telemetry', function () {
            const options = { top: 7 };
            const qna = new CustomQuestionAnswering(endpoint, options, null);

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
            const qna = new CustomQuestionAnswering(endpoint, options, null, null);

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
        it('returns answer for question with answer with options.filters applied', async function () {
            const qna = new CustomQuestionAnswering(endpoint);
            const context = new TestContext({ text: 'what happens when you hug a procupine?' });
            const filters = {
                metadataFilter: {
                    metadata: [
                        {
                            key: 'animal',
                            value: 'procupine',
                        },
                    ],
                },
            };
            const options = {
                filters: {
                    filters,
                },
            };

            const results = await qna.getAnswers(context, options);
            assert.strictEqual(results.length, 1);
        });

        it('returns answer for question with answer with two options.strictFilters applied', async function () {
            const qna = new CustomQuestionAnswering(endpoint);
            const context = new TestContext({ text: 'what happens when you hug a procupine?' });
            const strictFilters = [
                {
                    name: 'animal',
                    value: 'procupine',
                },
                {
                    name: 'animal2',
                    value: 'tiger',
                },
            ];
            const options = {
                strictFilters: strictFilters,
            };
            const results = await qna.getAnswers(context, options);
            assert.strictEqual(results.length, 1);
        });

        it('returns answer without any options specified', async function () {
            const qna = new CustomQuestionAnswering(endpoint);
            const context = new TestContext({ text: 'where are the unicorns?' });

            const results = await qna.getAnswers(context);

            assert.strictEqual(results.length, 1);
        });

        it('returns answer with metadata', async function () {
            const qna = new CustomQuestionAnswering(endpoint);
            const context = new TestContext({ text: 'where are the unicorns?' });

            const results = await qna.getAnswers(context);

            assert.strictEqual(results.length, 1);
            assert.strictEqual(results[0].metadata.length, 1);
            assert.strictEqual(results[0].metadata[0].name, 'title');
            assert.strictEqual(results[0].metadata[0].value, 'mythical unicorns');
        });

        it('returns answer and active learning flag', async function () {
            const qna = new CustomQuestionAnswering(endpoint);
            const context = new TestContext({ text: 'where are the unicorns?' });

            const results = await qna.getAnswersRaw(context);

            assert.strictEqual(results.answers.length, 1);
            assert.strictEqual(results.activeLearningEnabled, true);
        });

        it('sorts the answers in the qna results from highest to lowest score', async function () {
            const qna = new CustomQuestionAnswering(endpoint);
            const context = new TestContext({ text: "what's your favorite animal?", from: { id: 'user' } });
            const options = { top: 5 };

            const results = await qna.getAnswers(context, options);
            const sorted = results.slice().sort((a, b) => b.score - a.score);

            assert.deepStrictEqual(results, sorted);
        });

        it('returns answer with prompts', async function () {
            const qna = new CustomQuestionAnswering(endpoint);
            const context = new TestContext({ text: 'how do I clean the stove?' });
            const options = { top: 2 };

            const results = await qna.getAnswers(context, options);

            assert.strictEqual(results.length, 1);
            assert(results[0].context.prompts.length);
        });

        it('returns answer with high score provided context', async function () {
            const qna = new CustomQuestionAnswering(endpoint);
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
            const qna = new CustomQuestionAnswering(endpoint);
            const context = new TestContext({ text: 'where can I buy?' });
            const options = { top: 2, qnaId: 55 };

            const results = await qna.getAnswers(context, options);

            assert.strictEqual(results.length, 1);
            assert.strictEqual(results[0].score, 1);
        });

        it('returns answer with low score not provided context', async function () {
            const qna = new CustomQuestionAnswering(endpoint);
            const context = new TestContext({ text: 'where can I buy?' });
            const options = { top: 2, context: null };

            const results = await qna.getAnswers(context, options);

            assert.strictEqual(results.length, 2);
            assert(results[0].score < 1);
        });

        it('calls qnamaker with rankerType questionOnly', async function () {
            const qna = new CustomQuestionAnswering(endpoint);
            const context = new TestContext({ text: 'Will QuestionOnly ranker type return an answer?' });
            const options = { top: 1, context: null, rankerType: 'QuestionOnly' };

            const results = await qna.getAnswers(context, options);

            assert.strictEqual(results.length, 1);
        });

        it('returns answer with timeout option specified', async function () {
            const options = { timeout: 500000 };
            const qna = new CustomQuestionAnswering(endpoint, options);
            const context = new TestContext({ text: 'where are the unicorns?' });

            const results = await qna.getAnswers(context, options);

            sinon.assert.match(qna._options, sinon.match(options));
            assert.strictEqual(results.length, 1);
        });

        it('returns answer from service', async function () {
            const qna = new CustomQuestionAnswering(endpoint);
            const context = new TestContext({ text: 'You cannot find answer to this question.' });

            const results = await qna.getAnswers(context);

            assert.strictEqual(results.length, 1);
            assert.strictEqual(results[0].answer, 'No good match found in KB.');
        });

        it('returns 0 answers for an empty utterance', async function () {
            const qna = new CustomQuestionAnswering(endpoint, { top: 1 });
            const context = new TestContext({ text: '' });

            await assert.rejects(qna.getAnswers(context), {
                name: 'RangeError',
                message: 'Question cannot be null or empty text',
            });
        });

        it('returns 0 answers for an undefined utterance', async function () {
            const qna = new CustomQuestionAnswering(endpoint, { top: 1 });
            const context = new TestContext({ text: undefined });
            await assert.rejects(qna.getAnswers(context), {
                name: 'RangeError',
                message: 'Question cannot be null or empty text',
            });
        });

        it('returns 0 answers for questions without an answer', async function () {
            const qna = new CustomQuestionAnswering(endpoint, { top: 1 });
            const context = new TestContext({ text: 'foo' });
            const results = await qna.getAnswers(context);

            assert.deepStrictEqual(results, []);
        });

        it('returns answer if includeUnstructuredSources is true', async function () {
            const qna = new CustomQuestionAnswering(endpoint, { includeUnstructuredSources: true, top: 1 });
            const context = new TestContext({ text: 'What happens if I include unstructured sources?' });
            const results = await qna.getAnswers(context);

            assert.strictEqual(results.length, 1);
            assert.strictEqual(results[0].answer, 'It checks for the answer in unstructured sources as well.');
        });

        it('throws TypeError if options.scoreThreshold is not a number in service call', async function () {
            const context = new TestContext({ text: "what's the number for 911?" });
            const qna = new CustomQuestionAnswering(context);
            const options = { scoreThreshold: 'I should be a number' };

            await assert.rejects(qna.getAnswers(context, options), {
                name: 'TypeError',
                message: `"${options.scoreThreshold}" is an invalid scoreThreshold. QnAMakerOptions.scoreThreshold must have a value between 0 and 1.`,
            });
        });

        it('filters low score variation', async function () {
            const qna = new CustomQuestionAnswering(endpoint, { top: 5 });
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

            const qna = new CustomQuestionAnswering(endpoint, { top: 1 }, telemetryClient, true);
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
                            articleFound: 'true',
                            knowledgeBaseId,
                            matchedQuestion: '[]',
                            question: 'where are the unicorns?',
                            questionId: '-1',
                            username: sinon.match.string,
                        }),
                    })
                )
                .once();

            const qna = new CustomQuestionAnswering(endpoint, { top: 1 }, telemetryClient, true);
            const context = new TestContext({ text: 'where are the unicorns?', from: { name: 'testname' } });

            const results = await qna.getAnswers(context);

            sandbox.verify();
            assert(qna.logPersonalInformation);
            assert.strictEqual(results.length, 1);
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

            const qna = new CustomQuestionAnswering(endpoint, { top: 1 }, telemetryClient, false);
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

            const qna = new CustomQuestionAnswering(endpoint, { top: 1 }, telemetryClient, true);
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
            const qna = new CustomQuestionAnswering(endpoint);

            await assert.rejects(qna.getAnswers(undefined), {
                name: 'TypeError',
                message: 'QnAMaker.getAnswers() requires a TurnContext.',
            });
        });
    });

    describe('trainAPI', function () {
        it('calls train async function', async function () {
            const fileName = 'calls_train_async_function.json';
            const filePath = `${__dirname}/TestData/LanguageService/`;
            const trainApi = `/language/query-knowledgebases/projects/${endpoint.knowledgeBaseId}/feedback?api-version=2021-10-01`;
            nock(endpoint.host).post(trainApi).replyWithFile(200, `${filePath}${fileName}`);
            const options = { qnaServiceType: ServiceType.language };
            const qna = new CustomQuestionAnswering(endpoint, options);

            await qna.callTrain({
                feedbackRecords: [
                    {
                        userId: 'test',
                        userQuestion: 'How are you?',
                        qnaId: '1',
                    },
                    {
                        userId: 'test',
                        userQuestion: 'Whats up?',
                        qnaId: '2',
                    },
                ],
            });
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
        const trainApi = `/language/query-knowledgebases/projects/${endpoint.knowledgeBaseId}/feedback?api-version=2021-10-01`;
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
                    records: { feedbackRecords },
                });

                const httpUtils = new HttpRequestUtils();

                await assert.rejects(httpUtils.executeHttpRequest(`${endpoint.host}${trainApi}`, payload, endpoint));
            });
        });

        describe('callTrain', function () {
            it('sends correct payload body to Train API', async function () {
                nock(endpoint.host).post(trainApi).reply(204);
                const options = { qnaServiceType: ServiceType.language };
                const qna = new CustomQuestionAnswering(endpoint, options);
                await qna.callTrain(feedbackRecords);
            });
        });
    });
    describe('QnAMakerDialog', function () {
        it('Construct QnAMakerDialog constructor with new LanguageService parameters', async function () {
            const strictFilters = [
                {
                    name: 'Name1',
                    value: 'Value1',
                },
                {
                    name: 'Name2',
                    value: 'Value2',
                },
            ];
            const qnaDialog = new QnAMakerDialog(knowledgeBaseId, endpointKey, hostname);
            qnaDialog.strictFilters = strictFilters;
            qnaDialog.qnaServiceType = ServiceType.language;
            qnaDialog.strictFiltersJoinOperator = JoinOperator.AND;
            qnaDialog.enablePreciseAnswer = true;
            qnaDialog.displayPreciseAnswerOnly = true;

            const fixedClient = await qnaDialog.getQnAMakerClient({ state: {} });
            assert.strictEqual(fixedClient.endpoint.knowledgeBaseId, knowledgeBaseId);
            assert.strictEqual(fixedClient.endpoint.endpointKey, endpointKey);
            assert.strictEqual(fixedClient.endpoint.host, hostname);
            assert.strictEqual(fixedClient.endpoint.qnaServiceType, ServiceType.language);
            assert.strictEqual(fixedClient._options.strictFilters, strictFilters);
            assert.strictEqual(fixedClient._options.enablePreciseAnswer, true);
            assert.strictEqual(fixedClient._options.rankerType, RankerTypes.default);
        });
    });
});

class OverrideTwoEventsWithOverrideLogger extends CustomQuestionAnswering {
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
