const { strictEqual } = require('assert');
const assert = require('assert');
const { CrossTrainedRecognizerSet, RegexRecognizer, IntentPattern } = require('botbuilder-dialogs-adaptive');
const { TestUtils } = require('../lib');
const { ActivityTypes, TestAdapter, TurnContext } = require('botbuilder');
const { DialogContext, DialogSet } = require('botbuilder-dialogs');
const {
    crossTrainText,
    xIntentText,
    recognizeIntentAndValidateTelemetry,
    spyOnTelemetryClientTrackEvent,
} = require('./recognizerTelemetryUtils');

const { makeResourceExplorer } = require('./utils');

const createRecognizer = () =>
    new CrossTrainedRecognizerSet().configure({
        recognizers: [
            new RegexRecognizer().configure({
                id: 'x',
                intents: [new IntentPattern('DeferToRecognizer_y', crossTrainText), new IntentPattern('x', 'x')],
            }),
            new RegexRecognizer().configure({
                id: 'y',
                intents: [new IntentPattern('y', crossTrainText), new IntentPattern('y', 'y')],
            }),
            new RegexRecognizer().configure({
                id: 'z',
                intents: [new IntentPattern('z', crossTrainText), new IntentPattern('z', 'z')],
            }),
        ],
    });

const user = {
    id: process.env['USER_ID'] || 'UK8CH2281:TKGSUQHQE',
};

const bot = {
    id: process.env['BOT_ID'] || 'BKGSYSTFG:TKGSUQHQE',
};

const getDialogContext = (testName, text, locale = 'en-us') => {
    return new DialogContext(
        new DialogSet(),
        new TurnContext(new TestAdapter(TestAdapter.createConversation(testName)), {
            type: ActivityTypes.Message,
            text: text,
            recipient: user,
            from: bot,
            locale,
        }),
        {}
    );
};

describe('CrossTrainedRecognizerSetTests', function () {
    let resourceExplorer;
    before(function () {
        resourceExplorer = makeResourceExplorer('CrossTrainedRecognizerSetTests');
    });

    it('AllNone', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'CrossTrainedRecognizerSetTests_AllNone');
    });

    it('CircleDefer', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'CrossTrainedRecognizerSetTests_CircleDefer');
    });

    it('DoubleDefer', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'CrossTrainedRecognizerSetTests_DoubleDefer');
    });

    it('DoubleIntent', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'CrossTrainedRecognizerSetTests_DoubleIntent');
    });

    it('Empty', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'CrossTrainedRecognizerSetTests_Empty');
    });

    it('NoneWithIntent', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'CrossTrainedRecognizerSetTests_NoneWithIntent');
    });

    it('EntitiesWithNoneIntent', async function () {
        await TestUtils.runTestScript(resourceExplorer, 'CrossTrainedRecognizerSetTests_NoneIntentWithEntities');
    });

    it('NoneIntent', async function () {
        const recognizer = new CrossTrainedRecognizerSet().configure({
            recognizers: [
                new RegexRecognizer().configure({
                    id: 'duck',
                    intents: [new IntentPattern('None', 'duck')],
                }),
            ],
        });
        const dc = getDialogContext('noneIntent', 'duck');
        const results = await recognizer.recognize(dc, dc.context.activity);

        strictEqual(Object.keys(results.intents).length, 1);
        strictEqual(Object.keys(results.intents)[0], 'None');
        assert(Object.keys(results.sentiment));
    });

    it('NoneIntentDeferToRecognizer', async function () {
        const recognizer = new CrossTrainedRecognizerSet().configure({
            recognizers: [
                new RegexRecognizer().configure({
                    id: 'duck',
                    intents: [new IntentPattern('DeferToRecognizer_x', 'duck')],
                }),
            ],
        });
        const dc = getDialogContext('DeferToRecognizer', 'duck');
        const results = await recognizer.recognize(dc, dc.context.activity);

        strictEqual(Object.keys(results.intents).length, 1);
        strictEqual(Object.keys(results.intents)[0], 'None');
        assert(Object.keys(results.sentiment));
    });

    it('ChooseIntentAmbiguous', async function () {
        const recognizer = new CrossTrainedRecognizerSet().configure({
            recognizers: [
                new RegexRecognizer().configure({
                    id: 'duck',
                    intents: [new IntentPattern('x', 'duck'), new IntentPattern('x', 'x')],
                }),
                new RegexRecognizer().configure({
                    id: 'y',
                    intents: [new IntentPattern('y', 'duck')],
                }),
            ],
        });
        const dc = getDialogContext('ChooseIntentAmbiguous', 'duck');
        const results = await recognizer.recognize(dc, dc.context.activity);

        strictEqual(Object.keys(results.intents).length, 1);
        strictEqual(Object.keys(results.intents)[0], 'ChooseIntent');
        strictEqual(results.candidates[1].id, 'y');
    });

    describe('Telemetry', function () {
        const recognizer = createRecognizer();
        let spy;

        beforeEach(function () {
            spy = spyOnTelemetryClientTrackEvent(recognizer);
        });

        afterEach(function () {
            spy.restore();
        });

        it('should log PII when logPersonalInformation is true', async function () {
            recognizer.logPersonalInformation = true;

            await recognizeIntentAndValidateTelemetry({
                text: crossTrainText,
                callCount: 1,
                recognizer,
                spy,
            });

            await recognizeIntentAndValidateTelemetry({
                text: xIntentText,
                callCount: 2,
                recognizer,
                spy,
            });
        });

        it('should not log PII when logPersonalInformation is false', async function () {
            recognizer.logPersonalInformation = false;

            await recognizeIntentAndValidateTelemetry({
                text: crossTrainText,
                callCount: 1,
                recognizer,
                spy,
            });

            await recognizeIntentAndValidateTelemetry({
                text: xIntentText,
                callCount: 2,
                recognizer,
                spy,
            });
        });

        it('should refrain from logging PII by default', async function () {
            const recognizerWithDefaultLogPii = createRecognizer();
            const trackEventSpy = spyOnTelemetryClientTrackEvent(recognizerWithDefaultLogPii);

            await recognizeIntentAndValidateTelemetry({
                text: crossTrainText,
                callCount: 1,
                recognizer: recognizerWithDefaultLogPii,
                spy: trackEventSpy,
            });
        });
    });
});
