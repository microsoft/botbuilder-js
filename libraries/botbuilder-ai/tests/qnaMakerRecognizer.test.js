const { notStrictEqual, ok, strictEqual } = require('assert');
const { TestAdapter, TurnContext } = require('botbuilder-core');
const { DialogContext, DialogSet } = require('botbuilder-dialogs');
const nock = require('nock');
const { QnAMakerRecognizer } = require('../');
const {
    getLogPersonalInformation,
    spyOnTelemetryClientTrackEvent,
    qnaIntentText,
    validateTelemetry,
} = require('./recognizerTelemetryUtils');

const hostname = 'https://dummy-hostname.azurewebsites.net';
const knowledgeBaseId = 'dummy-id';
const endpointKey = 'dummy-key';
const testDataFolder = `${__dirname}/qna/`;

const user = {
    id: process.env['USER_ID'] || 'UK8CH2281:TKGSUQHQE',
};

const bot = {
    id: process.env['BOT_ID'] || 'BKGSYSTFG:TKGSUQHQE',
};

const createMessageActivity = (text) => {
    return {
        type: 'message',
        text: text,
        recipient: user,
        from: bot,
        locale: 'en-us',
    };
};

const createContext = (activity) => {
    return new DialogContext(new DialogSet(), new TurnContext(new TestAdapter(), activity), {});
};

const validateAnswers = (result) => {
    notStrictEqual(result.answers, undefined, 'there should be answers');
    strictEqual(
        Object.entries(result.entities.answer).length,
        1,
        'if there is a match there should only be 1 top answer'
    );
    strictEqual(result.entities.$instance.answer[0].startIndex, 0);
    ok(result.entities.$instance.answer[0].endIndex);
};

describe('QnAMakerRecognizer', function () {
    const recognizer = new QnAMakerRecognizer(hostname, knowledgeBaseId, endpointKey);

    it('No text no answer', async function () {
        const activity = createMessageActivity();
        const dc = createContext(activity);
        const result = await recognizer.recognize(dc, activity);
        strictEqual(result.entities.answer, undefined);
        strictEqual(result.answers, undefined);
        strictEqual(result.intents.QnAMatch, undefined);
        notStrictEqual(result.intents.None, undefined);
    });

    it('No Answer', async function () {
        nock(hostname)
            .post(/knowledgebases/)
            .replyWithFile(200, testDataFolder + 'QnaMaker_ReturnsNoAnswer.json');
        const activity = createMessageActivity(qnaIntentText);
        const dc = createContext(activity);
        const result = await recognizer.recognize(dc, activity);
        strictEqual(result.entities.answer, undefined);
        strictEqual(result.answers, undefined);
        strictEqual(result.intents.QnAMatch, undefined);
        notStrictEqual(result.intents.None, undefined);
    });

    it('Return Answers', async function () {
        nock(hostname)
            .post(/knowledgebases/)
            .replyWithFile(200, testDataFolder + 'QnaMaker_ReturnsAnswer.json');
        const activity = createMessageActivity(qnaIntentText);
        const dc = createContext(activity);
        const result = await recognizer.recognize(dc, activity);
        validateAnswers(result);
        strictEqual(result.intents.None, undefined);
        notStrictEqual(result.intents.QnAMatch, undefined);
    });

    it('Top N Answers', async function () {
        nock(hostname)
            .post(/knowledgebases/)
            .replyWithFile(200, testDataFolder + 'QnaMaker_TopNAnswer.json');
        const activity = createMessageActivity(qnaIntentText);
        const dc = createContext(activity);
        const result = await recognizer.recognize(dc, activity);
        validateAnswers(result);
        strictEqual(result.intents.None, undefined);
        notStrictEqual(result.intents.QnAMatch, undefined);
    });

    it('Return Answers with Intents', async function () {
        nock(hostname)
            .post(/knowledgebases/)
            .replyWithFile(200, testDataFolder + 'QnaMaker_ReturnsAnswerWithIntent.json');
        const activity = createMessageActivity(qnaIntentText);
        const dc = createContext(activity);
        const result = await recognizer.recognize(dc, activity);
        validateAnswers(result);
        strictEqual(result.intents.None, undefined);
        notStrictEqual(result.intents.DeferToRecognizer_xxx, undefined);
    });

    describe('Telemetry', function () {
        let spy;

        beforeEach(function () {
            spy = spyOnTelemetryClientTrackEvent(recognizer);

            nock.disableNetConnect();
            nock(hostname)
                .post(/knowledgebases/)
                .replyWithFile(200, testDataFolder + 'QnaMaker_ReturnsAnswer.json');
        });

        afterEach(function () {
            spy.restore();

            nock.cleanAll();
            nock.enableNetConnect();
        });

        it('logs PII when logPersonalInformation is true', async function () {
            const activity = createMessageActivity(qnaIntentText);
            const dialogContext = createContext(activity);
            recognizer.logPersonalInformation = true;

            const result = await recognizer.recognize(dialogContext, activity);

            validateAnswers(result);
            strictEqual(result.intents.None, undefined);
            notStrictEqual(result.intents.QnAMatch, undefined);
            // callCount is 2, because trackEvent gets called:
            // - once for QnAMessage event from within QnAMaker class
            // - once for QnAMakerRecognizerResult event from within QnAMakerRecognizer
            validateTelemetry({ recognizer, dialogContext, spy, activity, result, callCount: 2 });
        });

        it('does not log PII when logPersonalInformation is false', async function () {
            const activity = createMessageActivity(qnaIntentText);
            const dialogContext = createContext(activity);
            recognizer.logPersonalInformation = false;

            const result = await recognizer.recognize(dialogContext, activity);

            validateAnswers(result);
            strictEqual(result.intents.None, undefined);
            notStrictEqual(result.intents.QnAMatch, undefined);
            // callCount is 2, because trackEvent gets called:
            // - once for QnAMessage event from within QnAMaker class
            // - once for QnAMakerRecognizerResult event from within QnAMakerRecognizer
            validateTelemetry({ recognizer, dialogContext, spy, activity, result, callCount: 2 });
        });

        it('should refrain from logging PII by default', async function () {
            const recognizerWithDefaultLogPii = new QnAMakerRecognizer(hostname, knowledgeBaseId, endpointKey);
            const trackEventSpy = spyOnTelemetryClientTrackEvent(recognizerWithDefaultLogPii);
            const activity = createMessageActivity(qnaIntentText);
            const dialogContext = createContext(activity);

            const result = await recognizerWithDefaultLogPii.recognize(dialogContext, activity);

            validateAnswers(result);
            strictEqual(result.intents.None, undefined);
            notStrictEqual(result.intents.QnAMatch, undefined);
            ok(!getLogPersonalInformation(recognizerWithDefaultLogPii, dialogContext));
            // callCount is 2, because trackEvent gets called:
            // - once for QnAMessage event from within QnAMaker class
            // - once for QnAMakerRecognizerResult event from within QnAMakerRecognizer
            validateTelemetry({
                recognizer: recognizerWithDefaultLogPii,
                dialogContext,
                spy: trackEventSpy,
                activity,
                result,
                callCount: 2,
            });
        });
    });
});
