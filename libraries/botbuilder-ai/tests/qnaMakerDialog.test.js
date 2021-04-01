const fs = require('fs');
const nock = require('nock');
const sinon = require('sinon');
const { ok, rejects, strictEqual, throws } = require('assert');
const { join } = require('path');
const { BoolExpression } = require('adaptive-expressions');
const {
    ActionTypes,
    ActivityTypes,
    CardFactory,
    ConversationState,
    MemoryStorage,
    MessageFactory,
    TestAdapter,
} = require('botbuilder-core');
const { Dialog, DialogSet, DialogTurnStatus, DialogManager, ScopePath } = require('botbuilder-dialogs');
const { QnAMakerDialog, QnAMaker, QnACardBuilder } = require('../lib');

const KB_ID = process.env.QNAKNOWLEDGEBASEID;
const ENDPOINT_KEY = process.env.QNAENDPOINTKEY;
const HOSTNAME = process.env.QNAHOSTNAME || 'test-qna-app';
const isMockQna = false || !(KB_ID && ENDPOINT_KEY);

const beginMessage = { text: `begin`, type: 'message' };

describe('QnAMakerDialog', function () {
    this.timeout(3000);
    const testFiles = fs.readdirSync(`${__dirname}/TestData/${this.title}/`);

    beforeEach(function () {
        nock.cleanAll();
        if (isMockQna) {
            const fileName = replaceCharacters(this.currentTest.title);
            const filePath = `${__dirname}/TestData/${this.test.parent.title}/`;
            testFiles
                .filter((file) => file.startsWith(fileName + '.'))
                .forEach((file) => {
                    nock(`https://${HOSTNAME}.azurewebsites.net`)
                        .matchHeader('User-Agent', /botbuilder-ai\/4.*/)
                        .post(/qnamaker/)
                        .replyWithFile(200, filePath + file)
                        .persist();
                });
        }
    });

    afterEach(function () {
        nock.cleanAll();
    });

    function replaceCharacters(testName) {
        return testName.replace(/"/g, '').replace(/ /g, '_');
    }

    it('should successfully construct', function () {
        new QnAMakerDialog('kbId', 'endpointKey', 'https://myqnainstance.azurewebsites.net/qnamaker');
    });

    it('should add instance to a dialog set', function () {
        const dialogs = new DialogSet();
        const qna = new QnAMakerDialog('kbId', 'endpointKey', 'https://myqnainstance.azurewebsites.net/qnamaker');

        dialogs.add(qna);
    });

    describe('getQnAClient()', function () {
        const kbId = 'dummyKbId';
        const endpointKey = 'dummyEndpointKey';

        it('should return unmodified v5 hostName value', async function () {
            const V5_HOSTNAME = 'https://qnamaker-acom.azure.com/qnamaker/v5.0';

            // Create QnAMakerDialog
            const qna = new QnAMakerDialog(kbId, endpointKey, V5_HOSTNAME);
            const client = await qna.getQnAMakerClient({ state: {} });

            ok(client instanceof QnAMaker);
            strictEqual(client.endpoint.knowledgeBaseId, kbId);
            strictEqual(client.endpoint.endpointKey, endpointKey);
            strictEqual(client.endpoint.host, V5_HOSTNAME);
        });

        it('should construct v4 API endpoint', async function () {
            const INCOMPLETE_HOSTNAME = 'myqnainstance';
            const HOSTNAME = 'https://myqnainstance.azurewebsites.net/qnamaker';

            // Create QnAMakerDialog with incomplete hostname
            const qnaDialog = new QnAMakerDialog(kbId, endpointKey, INCOMPLETE_HOSTNAME);
            const fixedClient = await qnaDialog.getQnAMakerClient({ state: {} });

            ok(fixedClient instanceof QnAMaker);
            strictEqual(fixedClient.endpoint.knowledgeBaseId, kbId);
            strictEqual(fixedClient.endpoint.endpointKey, endpointKey);
            strictEqual(fixedClient.endpoint.host, HOSTNAME);
        });

        it('should construct BAD v4 hostnames', async function () {
            const createHostName = (hostName) => `https://${hostName}.azurewebsites.net/qnamaker`;
            const NOT_V5_HOSTNAME = 'myqnainstance.net/qnamaker';

            // Missing authority
            const noAuthority = new QnAMakerDialog(kbId, endpointKey, NOT_V5_HOSTNAME);
            const noAuthorityClient = await noAuthority.getQnAMakerClient({ state: {} });

            ok(noAuthorityClient instanceof QnAMaker);
            strictEqual(noAuthorityClient.endpoint.knowledgeBaseId, kbId);
            strictEqual(noAuthorityClient.endpoint.endpointKey, endpointKey);
            strictEqual(noAuthorityClient.endpoint.host, createHostName(NOT_V5_HOSTNAME));
        });

        it('should log telemetry that includes question and username if logPersonalInformation is true', async function () {
            const convoState = new ConversationState(new MemoryStorage());
            const dm = new DialogManager();
            dm.initialTurnState.set(ScopePath.settings, { telemetry: { logPersonalInformation: true } });
            dm.conversationState = convoState;

            const qnaDialog = new QnAMakerDialog(kbId, endpointKey, HOSTNAME);
            qnaDialog.steps.unshift(async (step) => {
                ok(step);
                const qnaClient = await qnaDialog.getQnAMakerClient(step);

                ok(qnaClient instanceof QnAMaker);
                ok(qnaClient.telemetryClient);
                strictEqual(qnaClient.telemetryClient.isCustomTelemtryClient, true);

                // Note: not using strictEqual for logPii, due to adaptive-expression bug,
                // where BoolExpression resolve to string 'true' instead of boolean.
                ok(qnaClient.logPersonalInformation);
                strictEqual(qnaClient.endpoint.knowledgeBaseId, kbId);
                strictEqual(qnaClient.endpoint.endpointKey, endpointKey);
                strictEqual(qnaClient.endpoint.host, `https://${HOSTNAME}.azurewebsites.net/qnamaker`);

                return Dialog.EndOfTurn;
            });

            let qnaMessageCount = 0;
            qnaDialog.telemetryClient = {
                isCustomTelemtryClient: true,
                trackEvent: (telemetry) => {
                    const telemetryProperties = telemetry.properties;
                    // First QnaMessage event has QnA service's response
                    // to user's first message to QnAMakerDialog
                    if (telemetry.name === 'QnaMessage' && qnaMessageCount === 0) {
                        ok(telemetryProperties);
                        ok('question' in telemetryProperties);
                        strictEqual(telemetryProperties.question, 'hi');
                        ok('username' in telemetryProperties);
                        strictEqual(telemetryProperties.username, 'User1');
                        ok('answer' in telemetryProperties);
                        ok('articleFound' in telemetryProperties);
                        strictEqual(telemetryProperties.articleFound, 'true');
                        ok('knowledgeBaseId' in telemetryProperties);
                        ok('questionId' in telemetryProperties);
                        ok('score' in telemetry.metrics);

                        qnaMessageCount++;
                    }
                },
                trackPageView: () => {
                    // noop
                },
                trackTrace: () => {
                    // noop
                },
            };
            dm.rootDialog = qnaDialog;

            const adapter = new TestAdapter(async (turnContext) => {
                const { turnResult } = await dm.onTurn(turnContext);

                if (turnResult.status === DialogTurnStatus.complete) {
                    strictEqual(turnResult.result[0].answer, 'Welcome to the **Smart lightbulb** bot.');
                }
            });

            await adapter
                .send(beginMessage)
                .send('hi')
                .assertReply('Welcome to the **Smart lightbulb** bot.')
                .startTest();
            strictEqual(qnaMessageCount, 1);
        });

        it('should log telemetry that excludes question and username if logPersonalInformation is false', async function () {
            const convoState = new ConversationState(new MemoryStorage());
            const dm = new DialogManager();
            dm.initialTurnState.set(ScopePath.settings, { telemetry: { logPersonalInformation: true } });
            dm.conversationState = convoState;

            const qnaDialog = new QnAMakerDialog(kbId, endpointKey, HOSTNAME);
            qnaDialog.logPersonalInformation = new BoolExpression(false);

            qnaDialog.steps.unshift(async (step) => {
                ok(step);
                const qnaClient = await qnaDialog.getQnAMakerClient(step);

                ok(qnaClient instanceof QnAMaker);
                ok(qnaClient.telemetryClient);
                strictEqual(qnaClient.telemetryClient.isCustomTelemtryClient, true);

                strictEqual(qnaClient.logPersonalInformation, false);
                strictEqual(qnaClient.endpoint.knowledgeBaseId, kbId);
                strictEqual(qnaClient.endpoint.endpointKey, endpointKey);
                strictEqual(qnaClient.endpoint.host, `https://${HOSTNAME}.azurewebsites.net/qnamaker`);

                return Dialog.EndOfTurn;
            });

            let qnaMessageCount = 0;
            qnaDialog.telemetryClient = {
                isCustomTelemtryClient: true,
                trackEvent: (telemetry) => {
                    const telemetryProperties = telemetry.properties;
                    // First QnaMessage event has QnA service's response
                    // to user's first message to QnAMakerDialog
                    if (telemetry.name === 'QnaMessage' && qnaMessageCount === 0) {
                        ok(telemetryProperties);
                        strictEqual('question' in telemetryProperties, false);
                        strictEqual('username' in telemetryProperties, false);
                        ok('answer' in telemetryProperties);
                        ok('articleFound' in telemetryProperties);
                        strictEqual(telemetryProperties.articleFound, 'true');
                        ok('knowledgeBaseId' in telemetryProperties);
                        ok('questionId' in telemetryProperties);
                        ok('score' in telemetry.metrics);

                        qnaMessageCount++;
                    }
                },
                trackPageView: () => {
                    // noop
                },
                trackTrace: () => {
                    // noop
                },
            };
            dm.rootDialog = qnaDialog;

            const adapter = new TestAdapter(async (turnContext) => {
                const { turnResult } = await dm.onTurn(turnContext);

                if (turnResult.status === DialogTurnStatus.complete) {
                    strictEqual(turnResult.result[0].answer, 'Welcome to the **Smart lightbulb** bot.');
                }
            });

            await adapter
                .send(beginMessage)
                .send('hi')
                .assertReply('Welcome to the **Smart lightbulb** bot.')
                .startTest();
            strictEqual(qnaMessageCount, 1);
        });
    });

    describe('Active Learning', function () {
        let sandbox;
        const testFilesPath = `${__dirname}/TestData/QnAMakerDialog/`;
        beforeEach(function () {
            nock.cleanAll();
            nock(`https://${HOSTNAME}.azurewebsites.net`)
                .matchHeader('User-Agent', /botbuilder-ai\/4.*/)
                .post(/qnamaker/)
                .replyWithFile(200, join(testFilesPath, 'QnaMaker_TopNAnswer.json'))
                .persist();
            sandbox = sinon.createSandbox();
        });

        const TopNAnswersData = JSON.parse(fs.readFileSync(join(testFilesPath, 'QnaMaker_TopNAnswer.json')));

        afterEach(function () {
            nock.cleanAll();
            sandbox.restore();
        });

        it('should send heroCard with suggestions', async function () {
            const kbId = 'dummyKbId';
            const endpointKey = 'dummyEndpointKey';
            const convoState = new ConversationState(new MemoryStorage());
            const dm = new DialogManager();
            dm.conversationState = convoState;
            const activeLearningCardTitle = 'Suggested questions';
            const cardNoMatchText = 'Not helpful.';
            const qnaDialog = new QnAMakerDialog(
                kbId,
                endpointKey,
                HOSTNAME,
                undefined,
                undefined,
                activeLearningCardTitle,
                cardNoMatchText
            );

            dm.rootDialog = qnaDialog;
            const adapter = new TestAdapter((turnContext) => {
                return dm.onTurn(turnContext);
            });

            await adapter
                .send('QnaMaker_TopNAnswer.json')
                .assertReply((reply) => {
                    strictEqual(reply.type, ActivityTypes.Message);
                    strictEqual(reply.attachments && reply.attachments.length, 1);
                    strictEqual(reply.attachments[0].contentType, CardFactory.contentTypes.heroCard);

                    const heroCard = reply.attachments[0].content;
                    strictEqual(heroCard.title, activeLearningCardTitle);
                    // Verify the suggestions match the values received from QnA Maker.
                    strictEqual(heroCard.buttons.length, 4);

                    for (let idx = 0; idx < heroCard.buttons.length; idx++) {
                        const { title, type, value } = heroCard.buttons[idx];

                        // With TopNAnswer's data, the last suggestion's low score of 50
                        // means it is not included in suggestions passed to the QnACardBuilder.
                        // The builder adds the cardNoMatchText button at the end.
                        if (idx < heroCard.buttons.length - 1) {
                            const suggestion = TopNAnswersData.answers[idx].questions[0];
                            strictEqual(title, suggestion);
                            strictEqual(type, ActionTypes.ImBack);
                            strictEqual(value, suggestion);
                        } else {
                            // Assert cardNoMatchText param passed into constructor was used.
                            strictEqual(title, cardNoMatchText);
                            strictEqual(type, ActionTypes.ImBack);
                            strictEqual(value, cardNoMatchText);
                        }
                    }
                })
                .startTest();
        });

        it('should use suggestionsActivityFactory', async function () {
            const kbId = 'dummyKbId';
            const endpointKey = 'dummyEndpointKey';
            const convoState = new ConversationState(new MemoryStorage());
            const dm = new DialogManager();
            dm.conversationState = convoState;
            const cardNoMatchText = 'Not helpful.';
            const qnaDialog = new QnAMakerDialog(
                kbId,
                endpointKey,
                HOSTNAME,
                undefined,
                undefined,
                (suggestionsList, noMatchingQuestionsText) => {
                    ok(suggestionsList);
                    strictEqual(suggestionsList.length, 3);
                    strictEqual(noMatchingQuestionsText, cardNoMatchText);
                    return MessageFactory.suggestedActions(suggestionsList, noMatchingQuestionsText);
                },
                cardNoMatchText
            );

            dm.rootDialog = qnaDialog;
            const adapter = new TestAdapter((turnContext) => {
                return dm.onTurn(turnContext);
            });

            await adapter
                .send('QnaMaker_TopNAnswer.json')
                .assertReply((reply) => {
                    strictEqual(reply.type, ActivityTypes.Message);
                    strictEqual(reply.suggestedActions.actions.length, 3);
                    strictEqual(reply.text, cardNoMatchText);
                })
                .startTest();
        });

        it('should error if suggestionsActivityFactory is passed in with falsy cardNoMatchText', function () {
            const kbId = 'dummyKbId';
            const endpointKey = 'dummyEndpointKey';
            throws(
                () => new QnAMakerDialog(kbId, endpointKey, HOSTNAME, undefined, undefined, (_) => {}, undefined),
                new Error('cardNoMatchText is required when using the suggestionsActivityFactory.')
            );
        });

        it('should error if suggestionsActivityFactory returns a number', async function () {
            const kbId = 'dummyKbId';
            const endpointKey = 'dummyEndpointKey';
            const convoState = new ConversationState(new MemoryStorage());
            const dm = new DialogManager();
            dm.conversationState = convoState;
            const cardNoMatchText = 'Not helpful.';
            const qnaDialog = new QnAMakerDialog(
                kbId,
                endpointKey,
                HOSTNAME,
                undefined,
                undefined,
                (suggestionsList, noMatchingQuestionsText) => {
                    ok(suggestionsList);
                    strictEqual(suggestionsList.length, 3);
                    strictEqual(noMatchingQuestionsText, cardNoMatchText);
                    return 1;
                },
                cardNoMatchText
            );

            dm.rootDialog = qnaDialog;
            const adapter = new TestAdapter((turnContext) => {
                return dm.onTurn(turnContext);
            });

            await rejects(
                adapter.send('QnaMaker_TopNAnswer.json').startTest(),
                (thrown) => thrown.message === '`suggestionsActivity` must be of type "object"'
            );
        });

        it('should error if QnACardBuilder.getSuggestionsCard returns void', async function () {
            const kbId = 'dummyKbId';
            const endpointKey = 'dummyEndpointKey';
            const convoState = new ConversationState(new MemoryStorage());
            const dm = new DialogManager();
            dm.conversationState = convoState;
            const suggestionsCardTitle = 'Card Title';
            const cardNoMatchText = 'Not helpful.';
            const suggestionsList = TopNAnswersData.answers.reduce((list, ans) => list.concat(ans.questions), []);
            // Remove low scoring answer from QnA Maker result. Low scoring answers are filtered out by ActiveLearningUtils.
            suggestionsList.pop();
            sandbox
                .mock(QnACardBuilder)
                .expects('getSuggestionsCard')
                .withExactArgs(suggestionsList, suggestionsCardTitle, cardNoMatchText)
                .returns(undefined);

            const qnaDialog = new QnAMakerDialog(
                kbId,
                endpointKey,
                HOSTNAME,
                undefined,
                undefined,
                suggestionsCardTitle,
                cardNoMatchText
            );

            dm.rootDialog = qnaDialog;
            const adapter = new TestAdapter((turnContext) => {
                return dm.onTurn(turnContext);
            });

            await rejects(
                adapter.send('QnaMaker_TopNAnswer.json').startTest(),
                (thrown) => thrown.message === '`suggestionsActivity` must be defined'
            );

            sandbox.verify();
        });
    });
});
