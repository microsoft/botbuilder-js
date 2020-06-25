const QnATelemetryConstants = require('../lib/qnaTelemetryConstants');
const assert = require('assert');
const { TestAdapter, TurnContext, NullTelemetryClient } = require('botbuilder-core');
const { QnAMaker } = require('../');
const nock = require('nock');
const fs = require('fs');
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
        nock.cleanAll();
        if (mockQnA) {
            var fileName = replaceCharacters(this.currentTest.title);
            var filePath = `${ __dirname }/TestData/${ this.test.parent.title }/`;
            var arr = testFiles.filter(function(file) { return file.startsWith(fileName + '.')} );

            arr.forEach(file => {
                nock(`https://${ hostname }.azurewebsites.net`)
                    .matchHeader('User-Agent', /botbuilder-ai\/4.*/)
                    .post(/qnamaker/)
                    .replyWithFile(200, filePath + file);
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

    describe('Instantiation', function() {
        it('should instantiate a QnAMaker class successfully with QnAMakerEndpoint, but without options specified', function() {
            new QnAMaker(endpoint);
        });

        it('should instantiate a QnAMaker class successfully with both QnAMakerEndpoint and QnAMakerOptions args', function() {
            const options = { top: 7, timeout: 333333 };
            const qnaWithOptions = new QnAMaker(endpoint, options);

            assert.strictEqual(qnaWithOptions._options.top, options.top);
            assert.strictEqual(qnaWithOptions._options.timeout, options.timeout);
        });

        it('should throw an error instantiating without QnAMakerEndpoint', function() {
            assert.throws(() => new QnAMaker(), new TypeError('QnAMaker requires valid QnAMakerEndpoint.'));
        });

        it('should throw TypeError if QnAMakerOptions.scoreThreshold is not a number during QnAMaker instantiation', function() {
            const context = new TestContext({ text: 'what happens when you hug a porcupine?' });
            const stringScoreThreshold_options = { scoreThreshold: "I should be a number, but I'm not." };
            const nonNumberError = new TypeError(`"${stringScoreThreshold_options.scoreThreshold}" is an invalid scoreThreshold. QnAMakerOptions.scoreThreshold must have a value between 0 and 1.`)
            
            function createQnAWithInvalidThreshold() {
                new QnAMaker(context, stringScoreThreshold_options);
            }

            assert.throws(() => createQnAWithInvalidThreshold(), nonNumberError);
        });

        it('should throw error if QnAMakerOptions.scoreThreshold is not a number between 0 and 1 during QnAMaker instantiation.', function () {
            const context = new TestContext({ text: 'do woodpeckers get concussions?' });
            const outOfRangeScoreThreshold_options = { scoreThreshold: 9000 };
            const error = new TypeError(`"${outOfRangeScoreThreshold_options.scoreThreshold}" is an invalid scoreThreshold. QnAMakerOptions.scoreThreshold must have a value between 0 and 1.`)

            function createQnaWithOutOfRangeThreshold() {
                new QnAMaker(context, outOfRangeScoreThreshold_options);
            }

            assert.throws(() => createQnaWithOutOfRangeThreshold(), error);
        });

        it('should not throw error if QnAMakerOptions.scoreThreshold is 1.', function () {
            const context = new TestContext({ text: 'do woodpeckers get concussions?' });
            const options = { scoreThreshold: 1 };

            function createQnAWithScoreThresholdOf1() {
                new QnAMaker(context, options);
            }

            assert.doesNotThrow(() => createQnAWithScoreThresholdOf1());
        });

        it('should throw RangeError if QnAMakerOptions.top is not an integer during instantiation', function() {
            const context = new TestContext({ text: 'what if ostriches could fly?' });
            const decimalNumberTopOptions = { top: 2.5 };
            const notAnIntegerError = new RangeError(`"${decimalNumberTopOptions.top}" is an invalid top value. QnAMakerOptions.top must be an integer greater than 0.`);

            function createQnaWithDecimalTopOption() {
                new QnAMaker(context, decimalNumberTopOptions);
            }

            assert.throws(() => createQnaWithDecimalTopOption(), notAnIntegerError);
        });

        it('should throw error if QnAMaker.top is not a number during instantiation', function() {
            const context = new TestContext({ text: 'why were there sloths at the post office?' });
            const objectTopOptions = { top: { 'key': 'value' } };
            const nonNumberError = new RangeError(`"${objectTopOptions.top}" is an invalid top value. QnAMakerOptions.top must be an integer greater than 0.`);

            function createQnaWithObjectTopOption() {
                new QnAMaker(context, objectTopOptions);
            }

            assert.throws(() => createQnaWithObjectTopOption(), nonNumberError);
        });

        it('should throw RangeError if QnAMaker.top is not an integer greater than 1', function() {
           const context = new TestContext({ text: 'why did my son think the wasabi was guacamole?' });
           const smallerThanOneTopOptions = { top: -1 };
           const notGreaterThanOneError = new RangeError(`"${smallerThanOneTopOptions.top}" is an invalid top value. QnAMakerOptions.top must be an integer greater than 0.`);

            function createQnaWithNegativeTopOption() {
                new QnAMaker(context, smallerThanOneTopOptions);
            }

            assert.throws(() => createQnaWithNegativeTopOption(), notGreaterThanOneError);
        });

        it('null telemetry should work', function() {
            const options = { top: 7 };
            const qnaWithNullTelemetry = new QnAMaker(endpoint, options, null);

            assert(qnaWithNullTelemetry.telemetryClient instanceof NullTelemetryClient);
            assert(qnaWithNullTelemetry.logPersonalInformation === false);
         });

         it('null telemetry logPersonalInformation should work', function() {
            const options = { top: 7 };
            const qnaWithNullTelemetry = new QnAMaker(endpoint, options, null, null);

            assert(qnaWithNullTelemetry.telemetryClient instanceof NullTelemetryClient);
            assert(qnaWithNullTelemetry.logPersonalInformation === false);
         });
 
 
    });

    describe('getAnswers()', function() {

        it('should return answer without any options specified', async function() {
            const noOptionsQnA = new QnAMaker(endpoint);
            const noOptionsContext = new TestContext({ text: 'where are the unicorns?' })
            const defaultNumberOfAnswers = 1;

            const resultsWithoutOptions = await noOptionsQnA.getAnswers(noOptionsContext);
            const numberOfResults = resultsWithoutOptions.length;

            assert.strictEqual(numberOfResults, defaultNumberOfAnswers, 'Should return only 1 answer with default settings (i.e. no options specified) for question with answer.');

        });

        it('should return answer and active learning flag', async function() {
            const noOptionsQnA = new QnAMaker(endpoint);
            const noOptionsContext = new TestContext({ text: 'where are the unicorns?' })
            const defaultNumberOfAnswers = 1;

            const results = await noOptionsQnA.getAnswersRaw(noOptionsContext);
            const numberOfResults = results.answers.length;

            assert.strictEqual(numberOfResults, defaultNumberOfAnswers, 'Should return only 1 answer with default settings (i.e. no options specified) for question with answer.');
            assert.strictEqual(results.activeLearningEnabled, false, 'Should return false for active learning flag.');
        });

        it('should sort the answers in the qna results from highest to lowest score', async function() {
            const qna = new QnAMaker(endpoint);
            const context = new TestContext({ text: "what's your favorite animal?" });
            const numberOfAnswersToReturn = { top: 5 };
            
            const qnaResults = await qna.getAnswers(context, numberOfAnswersToReturn);
            const descendingQnaResults = qnaResults.sort((a, b) => b.score - a.score);
            
            assert.strictEqual(qnaResults, descendingQnaResults, 'answers should be sorted from greatest to least score');
        });

        it('should return answer with prompts', async function() {
            const qna = new QnAMaker(endpoint);
            const context = new TestContext({ text: "how do I clean the stove?" });
            const options = { top: 2 };
            
            const qnaResults = await qna.getAnswers(context, options);

            assert.strictEqual(qnaResults.length, 1, 'one answer should be returned');
            assert.strictEqual(qnaResults[0].context.prompts.length > 0, true, 'One or more prompts should be present');
        });

        it('should return answer with answerspan text', async function () {
            const qna = new QnAMaker(endpoint);
            const context = new TestContext({ text: "how do I clean the stove?" });
            const options = { top: 2 };

            const qnaResults = await qna.getAnswers(context, options);
            
            assert.strictEqual(qnaResults[0].answerspan.text, 'some precise text', 'One or more prompts should be present');
        });

        it('should return answer with high score provided context', async function() {
            const qna = new QnAMaker(endpoint);
            const turnContext = new TestContext({ text: "where can I buy?" });
            
            const context = { previousQnAId: 5, previousUserQuery: "how do I clean the stove?"};
            const options = { top: 2, context: context };
            
            const qnaResults = await qna.getAnswers(turnContext, options);

            assert.strictEqual(qnaResults.length, 1, 'one answer should be returned');
            assert.strictEqual(qnaResults[0].score, 1, 'score should be high');
        });

        it('should return answer with high score provided id', async function() {
            const qna = new QnAMaker(endpoint);
            const turnContext = new TestContext({ text: "where can I buy?" });
            
            const options = { top: 2, qnaId: 55 };
            
            const qnaResults = await qna.getAnswers(turnContext, options);

            assert.strictEqual(qnaResults.length, 1, 'one answer should be returned');
            assert.strictEqual(qnaResults[0].score, 1, 'score should be high');
        });

        it('should return answer with low score not provided context', async function() {
            const qna = new QnAMaker(endpoint);
            const turnContext = new TestContext({ text: "where can I buy?" });
            
            const options = { top: 2, context: null };
            
            const qnaResults = await qna.getAnswers(turnContext, options);

            assert.strictEqual(qnaResults.length, 2, 'one answer should be returned');
            assert.strictEqual(qnaResults[0].score < 1, true, 'score should be low');
        });

        it('should call qnamaker with isTest true', async function() {
            const qna = new QnAMaker(endpoint);
            const turnContext = new TestContext({ text: "Q11" });
            const options = { top: 1, context: null, isTest: true };
            
            const qnaResults = await qna.getAnswers(turnContext, options);

            assert.strictEqual(qnaResults.length, 0, 'no answers should be returned');
        });

        it('should call qnamaker with rankerType questionOnly', async function() {
            const qna = new QnAMaker(endpoint);
            const turnContext = new TestContext({ text: "Q11" });
            const options = { top: 1, context: null, rankerType: "QuestionOnly" };
            
            const qnaResults = await qna.getAnswers(turnContext, options);

            assert.strictEqual(qnaResults.length, 0, 'no answers should be returned');
        });

        it('should return answer with timeout option specified', async function() {
            const timeoutOption = { timeout: 500000 };
            const qna = new QnAMaker(endpoint, timeoutOption);
            const context = new TestContext({ text: "where are the unicorns?" });
            const expectedNumOfAns = 1;

            const qnaResults = await qna.getAnswers(context, timeoutOption);

            assert.strictEqual(qna._options.timeout, timeoutOption.timeout);
            assert.strictEqual(qnaResults.length, expectedNumOfAns);
        });
        
        it('should convert legacy response property "qnaId" to "id"', async function() {
            const legacyEndpoint = {
                knowledgeBaseId: 'testKbId',
                endpointKey: 'testEndpointKey',
                host: 'https://westus.api.cognitive.microsoft.com/qnamaker/v3.0'
            };
            const qna = new QnAMaker(legacyEndpoint);

            const context = new TestContext({ text: 'How do I be the best?'});
            
            const legacyQnaResponse = {
                "answers": [
                    {
                        "score": 30.500827898,
                        "qnaId": 18,
                        "answer": "To be the very best, you gotta catch 'em all",
                        "source": "Custom Editorial",
                        "questions": [
                            "How do I be the best?"
                        ]
                    }
                ]
            }

            nock('https://westus.api.cognitive.microsoft.com')
                .post('/qnamaker/v3.0/knowledgebases/testKbId/generateanswer')
                .reply(200, legacyQnaResponse);

            const expectedQnaResultFormat = [{
                "answer": "To be the very best, you gotta catch 'em all",
                "id": 18,
                "metadata": [],
                "questions": ["How do I be the best?"],
                "score": .30500827898,
                "source": "Editorial"
            }];

            const formattedQnaResult = await qna.getAnswers(context);
            const hasIdInResponse = (response) => response["id"] && !response["qnaId"] ? true : false;

            assert.strictEqual(hasIdInResponse(formattedQnaResult), hasIdInResponse(expectedQnaResultFormat), 'Legacy QnA responses should have property "qnaId" converted to "id".');
        });

        it('should return 0 answers for an empty or undefined utterance', async function () {
            const qna = new QnAMaker(endpoint, { top: 1 });
            const emptyUtteranceContext = new TestContext({ text: '' });
            const undefinedUtteranceContext = new TestContext({ text: undefined });

            const emptyQuestionResults = await qna.getAnswers(emptyUtteranceContext);
            assert.notStrictEqual(emptyQuestionResults, true, 'Empty utterance should return an empty array, short circuiting call to QnA service.');
            assert.strictEqual(emptyQuestionResults.length, 0, 'Should have not received answers for an empty utterance.');
            
            const undefinedQuestionResults = await qna.getAnswers(undefinedUtteranceContext);
            assert.strictEqual(undefinedQuestionResults.length, 0, 'Should have not received answers for an undefined utterance.');
        });

        it('should return 0 answers for questions without an answer.', async function () {
            const qna = new QnAMaker(endpoint, { top: 1 });
            const questionWithoutAns_Context = new TestContext({ text: 'foo' });
    
            const resultsWithoutAns = await qna.getAnswers(questionWithoutAns_Context);
            assert.notStrictEqual(resultsWithoutAns, true, 'Result without an answer should return an empty array.');
            assert.strictEqual(resultsWithoutAns.length, 0, `Should have not received answers for a question with no answer, it returned ${JSON.stringify(resultsWithoutAns)}.`);
        });

        it('should throw TypeError if QnAMakerOptions.scoreThreshold is not a number in service call', function() {
            const context = new TestContext({ text: "what's the number for 911?" });
            const qna = new QnAMaker(context);
            const stringScoreThreshold_options = { scoreThreshold: 'I should be a number' };
            const nonNumberError = new TypeError(`"${stringScoreThreshold_options.scoreThreshold}" is an invalid scoreThreshold. QnAMakerOptions.scoreThreshold must have a value between 0 and 1.`);

            assert.rejects(async () => await qna.getAnswers(context, stringScoreThreshold_options), nonNumberError );
        });

        it('should filter low score variation', async function() {
            const qna = new QnAMaker(endpoint, { top: 5});
            const context = new TestContext({ text: "Q11" });
            const results = await qna.getAnswers(context);
            assert.strictEqual(results.length, 4, `Should have recieved 4 answers.`);
            
            // Apply low score variation
            const filteredResult = await qna.getLowScoreVariation(results);
            assert.strictEqual(filteredResult.length, 3, `Should have 3 filtered answer after low score variation.`);
        });

        it('should log telemetry', async function() {
            // Arrange
            var callCount = 0;
            var telemetryClient = {
                trackEvent: (telemetry) => {
                    assert(telemetry, 'telemetry is null');
                    switch(++callCount) {
                        case 1:
                            // console.warn('Call number:' + callCount);
                            // console.warn(telemetry);
                            assert(telemetry.name === "QnaMessage");
                            assert(telemetry.properties);
                            assert('knowledgeBaseId' in telemetry.properties);
                            assert('question' in telemetry.properties);
                            assert('questionId' in telemetry.properties);
                            assert('username' in telemetry.properties);
                            assert('answer' in telemetry.properties);
                            assert('articleFound' in telemetry.properties);
                            assert(telemetry.properties.articleFound === 'true');
                            assert('score' in telemetry.metrics);
                            break;

                        default:
                            console.warn('Call number:' + callCount);
                            console.warn(telemetry);
                            assert(false);
                            break;
                    }
                }
            }
    
            const noOptionsQnA = new QnAMaker(endpoint, { top: 1 }, telemetryClient=telemetryClient, logPersonalInformation=true);
            const noOptionsContext = new TestContext({ text: 'where are the unicorns?', from: { name: "testname"}  })
            const defaultNumberOfAnswers = 1;

            // Act
            const resultsWithoutOptions = await noOptionsQnA.getAnswers(noOptionsContext);
            const numberOfResults = resultsWithoutOptions.length;
            // Assert
            assert.strictEqual(noOptionsQnA.logPersonalInformation, true);
            assert.strictEqual(numberOfResults, defaultNumberOfAnswers, 'Should return only 1 answer with default settings (i.e. no options specified) for question with answer.');

        });

        it('should log telemetry when no answer found in kb', async function() {
            // Arrange
            var callCount = 0;
            var telemetryClient = {
                trackEvent: (telemetry) => {
                    assert(telemetry, 'telemetry is null');
                    switch(++callCount) {
                        case 1:
                            assert(telemetry.name === "QnaMessage");
                            assert(telemetry.properties);
                            assert('knowledgeBaseId' in telemetry.properties);
                            assert('question' in telemetry.properties);
                            assert(telemetry.properties.question === 'where are the unicorns?');
                            assert('questionId' in telemetry.properties);
                            assert(telemetry.properties.questionId === 'No Qna Question Id matched');
                            assert('matchedQuestion' in telemetry.properties);
                            assert(telemetry.properties.matchedQuestion === 'No Qna Question matched')
                            assert('username' in telemetry.properties);
                            assert('answer' in telemetry.properties);
                            assert('articleFound' in telemetry.properties);
                            assert(telemetry.properties.articleFound === 'false');
                            break;

                        default:
                            assert(false);
                            break;
                    }
                }
            }
    
            const noOptionsQnA = new QnAMaker(endpoint, { top: 1 }, telemetryClient=telemetryClient, logPersonalInformation=true);
            const noOptionsContext = new TestContext({ text: 'where are the unicorns?', from: { name: "testname"}  })
            const defaultNumberOfAnswers = 0;

            // Act
            const resultsWithoutOptions = await noOptionsQnA.getAnswers(noOptionsContext);
            const numberOfResults = resultsWithoutOptions.length;
            // Assert
            assert.strictEqual(noOptionsQnA.logPersonalInformation, true);
            assert.strictEqual(numberOfResults, defaultNumberOfAnswers, 'Results should have 0 answers if no match found in KB');

        });

        it('should not log telemetry pii', async function() {
            // Arrange
            var callCount = 0;
            var telemetryClient = {
                trackEvent: (telemetry) => {
                    assert(telemetry, 'telemetry is null');
                    switch(++callCount) {
                        case 1:
                            // console.warn('Call number:' + callCount);
                            // console.warn(telemetry);
                            assert(telemetry.name === "QnaMessage");
                            assert(telemetry.properties);
                            assert('knowledgeBaseId' in telemetry.properties);
                            assert(!('question' in telemetry.properties));
                            assert(!('username' in telemetry.properties));
                            assert('questionId' in telemetry.properties);
                            assert('answer' in telemetry.properties);
                            assert('articleFound' in telemetry.properties);
                            assert(telemetry.properties.articleFound === 'true');
                            assert('score' in telemetry.metrics);
                            break;

                        default:
                            console.warn('Call number:' + callCount);
                            console.warn(telemetry);
                            assert(false);
                            break;
                    }
                }
            }
    
            const noOptionsQnA = new QnAMaker(endpoint, { top: 1 }, telemetryClient=telemetryClient, logPersonalInformation=false);
            const noOptionsContext = new TestContext({ text: 'where are the unicorns?', from: { name: "testname"} })
            const defaultNumberOfAnswers = 1;

            // Act
            const resultsWithoutOptions = await noOptionsQnA.getAnswers(noOptionsContext);
            const numberOfResults = resultsWithoutOptions.length;
            // Assert
            assert(noOptionsQnA.logPersonalInformation == false);
            assert.strictEqual(numberOfResults, defaultNumberOfAnswers, 'Should return only 1 answer with default settings (i.e. no options specified) for question with answer.');

        });

        it('should log telemetry using derived qna', async function() {
            // Arrange
            var callCount = 0;
            var telemetryClient = {
                trackEvent: (telemetry) => {
                    assert(telemetry, 'telemetry is null');
                    switch(++callCount) {
                        case 1:
                            // console.warn('Call number:' + callCount);
                            // console.warn(telemetry);
                            assert('foo' in telemetry.properties);
                            assert(telemetry.properties['foo'] == 'bar');
                            assert('ImportantProperty' in telemetry.properties);
                            assert(telemetry.properties['ImportantProperty'] == 'ImportantValue');
                            break;

                        case 2:
                            // console.warn('Call number:' + callCount);
                            // console.warn(telemetry);
                            assert(telemetry.name === "MyQnA");
                            assert(telemetry.properties);
                            assert('knowledgeBaseId' in telemetry.properties);
                            assert('question' in telemetry.properties);
                            assert('questionId' in telemetry.properties);
                            // Validate you can override "default" properties
                            assert(telemetry.properties.questionId == "OVERRIDE");
                            assert('username' in telemetry.properties);
                            assert('answer' in telemetry.properties);
                            assert('articleFound' in telemetry.properties);
                            assert(telemetry.properties.articleFound === 'true');
                            assert('score' in telemetry.metrics);
                            break;

                        default:
                            console.warn('Call number:' + callCount);
                            console.warn(telemetry);
                            assert(false);
                            break;
                    }
                }
            }
    
            const noOptionsQnA = new overrideTwoEventsWithOverrideLogger(endpoint, { top: 1 }, telemetryClient=telemetryClient, logPersonalInformation=true);
            const noOptionsContext = new TestContext({ text: 'where are the unicorns?', from: { name: "testname"}  })
            const defaultNumberOfAnswers = 1;

            // Act
            const resultsWithoutOptions = await noOptionsQnA.getAnswers(noOptionsContext);
            const numberOfResults = resultsWithoutOptions.length;
            // Assert
            assert.strictEqual(noOptionsQnA.logPersonalInformation, true);
            assert.strictEqual(numberOfResults, defaultNumberOfAnswers, 'Should return only 1 answer with default settings (i.e. no options specified) for question with answer.');

        });

        it('should log telemetry additionalprops', async function() {
            // Arrange
            var callCount = 0;
            var telemetryClient = {
                trackEvent: (telemetry) => {
                    assert(telemetry, 'telemetry is null');
                    switch(++callCount) {
                        case 1:
                            // console.warn('Call number:' + callCount);
                            // console.warn(telemetry);
                            assert(telemetry.name === "QnaMessage");
                            assert(telemetry.properties);
                            assert('knowledgeBaseId' in telemetry.properties);
                            assert('question' in telemetry.properties);
                            assert(telemetry.properties['question'] == "OVERRIDE");
                            assert('MyImportantProperty' in telemetry.properties);
                            assert(telemetry.properties['MyImportantProperty'] == "MyImportantValue");
                            assert('questionId' in telemetry.properties);
                            assert('username' in telemetry.properties);
                            assert('answer' in telemetry.properties);
                            assert('articleFound' in telemetry.properties);
                            assert(telemetry.properties.articleFound === 'true');
                            assert('score' in telemetry.metrics);
                            assert(telemetry.metrics['score'] == 3.14159);
                            break;

                        default:
                            console.warn('Call number:' + callCount);
                            console.warn(telemetry);
                            assert(false);
                            break;
                    }
                }
            }
    
            const noOptionsQnA = new QnAMaker(endpoint, { top: 1 }, telemetryClient=telemetryClient, logPersonalInformation=true);
            const noOptionsContext = new TestContext({ text: 'where are the unicorns?', from: { name: "testname"}  })
            const defaultNumberOfAnswers = 1;

            // Act
            const resultsWithoutOptions = await noOptionsQnA.getAnswers(noOptionsContext, null, 
                { "question": "OVERRIDE", "MyImportantProperty":"MyImportantValue" },
                { "score":3.14159 }
                );
            const numberOfResults = resultsWithoutOptions.length;
            // Assert
            assert.strictEqual(noOptionsQnA.logPersonalInformation, true);
            assert.strictEqual(numberOfResults, defaultNumberOfAnswers, 'Should return only 1 answer with default settings (i.e. no options specified) for question with answer.');

        });



    });

    
    describe('emitTraceInfo()', function() {
        it('method should throw error if context is undefined', async function() {
            const qna = new QnAMaker(endpoint);

            assert.rejects(async () => await qna.getAnswers(undefined), new TypeError('QnAMaker.getAnswers() requires a TurnContext.'));
        });
    });

    describe('trainAPI()', async function() {
        it('should call train async function', async function() {
            const qna = new QnAMaker(endpoint);
            
            var feedbackRecords = {
                feedbackRecords:[
                    {
                        userId: "test",
                        userQuestion: "How are you?",
                        qnaId: 1
                    },
                    {
                        userId: "test",
                        userQuestion: "Whats up?",
                        qnaId: 2
                    }
                ]
            }

            // Provide feedback
            await qna.callTrainAsync(feedbackRecords);
        });
    });

    describe('Deprecated QnA Methods', function() {
        it('should work free standing', async function () {
            const qna = new QnAMaker(endpoint, { top: 1 });
            const answer = 'BaseCamp: You can use a damp rag to clean around the Power Pack';
    
            const firstCallQnaResults = await qna.generateAnswer(`how do I clean the stove?`);
            assert.notStrictEqual(firstCallQnaResults, true, `The response was returned as 'undefined'.`);
            assert.strictEqual(firstCallQnaResults.length, 1, 'Should have received just one answer on the first call.');
            assert.strictEqual(firstCallQnaResults[0].answer.startsWith(answer), true, `The answer should have started with '${answer}' for the first call.`);
    
            const secondCallQnaResults = await qna.generateAnswer("is the stove hard to clean?");
            assert.notStrictEqual(secondCallQnaResults, true, `The response was returned as 'undefined'.`);
            assert.strictEqual(secondCallQnaResults.length, 1, 'Should have received just one answer on the second call.');
            assert.strictEqual(secondCallQnaResults[0].answer.startsWith(answer), true, `The answer should have started with '${answer}' for the second call.`);
        });

        it('should return 0 answers for a question with no answer after a succesful call', async function () {
            const qna = new QnAMaker(endpoint, { top: 1 });
            let answer = 'BaseCamp: You can use a damp rag to clean around the Power Pack';
    
            const resultsWithAns = await qna.generateAnswer(`how do I clean the stove?`);
            assert.notStrictEqual(resultsWithAns, true, `The response was returned as 'undefined'.`);
            assert.strictEqual(resultsWithAns.length, 1, 'Should have received just one answer on the first call.');
            assert.strictEqual(resultsWithAns[0].answer.startsWith(answer), true, `The answer should have started with '${answer}' for the first call.`);
    
            const resultsWithoutAns = await qna.generateAnswer('how is the weather?');
            assert.notStrictEqual(resultsWithoutAns, true, `The response was returned as 'undefined'.`);
            assert.strictEqual(resultsWithoutAns.length, 0, 'Should have not received answers for a question with no answers.');
        });

        it('should return 0 answers for an empty or undefined utterance', async function () {
            const qna = new QnAMaker(endpoint, { top: 1 });
            
            const emptyQuestionResults = await qna.generateAnswer(``);
            assert.notStrictEqual(emptyQuestionResults, true, `The response was returned as 'undefined'.`);
            assert.strictEqual(emptyQuestionResults.length, 0, 'Should have not received answers for an empty utterance.');
    
            const undefinedQuestionResults = await qna.generateAnswer(undefined);
            assert.strictEqual(undefinedQuestionResults.length, 0, 'Should have not received answers for an undefined utterance.');
        });

        it('should return 0 answers for questions without an answer.', async function () {
            const qna = new QnAMaker(endpoint, { top: 1 });
    
            const resultsWithoutAns = await qna.generateAnswer(`foo`);
            assert.notStrictEqual(resultsWithoutAns, true, `The response was returned as 'undefined'.`);
            assert.strictEqual(resultsWithoutAns.length, 0, `Should have not received answers for a question with no answer, it returned ${JSON.stringify(resultsWithoutAns)}.`);
    
            const undefinedQuestionResults = await qna.generateAnswer(undefined);
            assert.strictEqual(undefinedQuestionResults.length, 0, 'Should have not received answers for an undefined question.');
        });

        it('should emit trace info once per call to Answer', function (done) {
            const context = new TestContext({ text: `how do I clean the stove?`, type: 'message'});
            const qna = new QnAMaker(endpoint, { top: 1 });
    
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

        it('should return "false" from answer() if no good answers found', function (done) {
            const context = new TestContext({ text: `foo`, type: 'message' });
            const qna = new QnAMaker(endpoint, { top: 1 });
    
            qna.answer(context).then((found) => {
                assert.strictEqual(found, false, `Should have returned 'false' for questions with no good answers`);
                done();
            });
        });

        it('should throw TypeError from answer() if no context', function(){
            const qna = new QnAMaker(endpoint);
            const context = undefined;
            const contextMissingError = new TypeError('QnAMaker.answer() requires a TurnContext.');
            
            assert.rejects(async () => await qna.answer(context), contextMissingError);
        });

        it('should sort results from generateAnswers in descending order', async function() {
            const qna = new QnAMaker(endpoint);
            const question = "what's your favorite animal?";
            const numberOfAnswersToReturn = 5;

            const qnaResults = await qna.generateAnswer(question, numberOfAnswersToReturn);
            const descendingQnaResults = qnaResults.sort((a, b) => b.score - a.score);

            assert.strictEqual(qnaResults, descendingQnaResults, 'answers should be sorted from greatest to least score');
        });
    });

    describe('getFetch()', function(){    

        it('Should return fetch instance from global', function(){            
            global.fetch = function() { return 'global fetch fake'; };

            const fetch = getFetch();
            assert.strictEqual('global fetch fake', fetch());   
        });

        it('Should set fetch API if it does not exist', function(){
            if (global.fetch) {
                delete global['fetch'];
            }

            const fetch = getFetch();
            assert(typeof fetch === 'function');
        });
    });
});

class overrideTwoEventsWithOverrideLogger extends QnAMaker
{
    async onQnaResults(qnaResults, turnContext, telemetryProperties, telmetryMetrics) {
        // Track regular property
        this.telemetryClient.trackEvent({
                    name: QnATelemetryConstants.qnaMessageEvent,
                    properties: {"foo":"bar",
                                "ImportantProperty": "ImportantValue"  } });

        this.fillQnAEvent(qnaResults, turnContext, {"questionId": "OVERRIDE"})
            .then(data => {
                // Add additional event
                this.telemetryClient.trackEvent({
                    name: "MyQnA",
                    properties: data[0],
                    metrics: data[1]
                });
            });
    }
}
