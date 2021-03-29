const { MultiLanguageRecognizer, RegexRecognizer, IntentPattern } = require('botbuilder-dialogs-adaptive');
const { TestUtils } = require('../lib');
const { makeResourceExplorer } = require('./utils');

const {
    greetingIntentTextEnUs,
    recognizeIntentAndValidateTelemetry,
    spyOnTelemetryClientTrackEvent,
} = require('./recognizerTelemetryUtils');

const createRecognizer = () =>
    new MultiLanguageRecognizer().configure({
        recognizers: {
            'en-us': new RegexRecognizer().configure({
                intents: [new IntentPattern('greeting', '(?i)howdy'), new IntentPattern('goodbye', '(?i)bye')],
            }),
            'en-gb': new RegexRecognizer().configure({
                intents: [new IntentPattern('greeting', '(?i)hiya'), new IntentPattern('goodbye', '(?i)cheerio')],
            }),
            en: new RegexRecognizer().configure({
                intents: [new IntentPattern('greeting', '(?i)hello'), new IntentPattern('goodbye', '(?i)goodbye')],
            }),
        },
    });

describe('MultiLanguageRecognizerTests', function () {
    let resourceExplorer;
    before(function () {
        resourceExplorer = makeResourceExplorer('MultiLanguageRecognizerTests');
    });

    it('DefaultFallback', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'MultiLanguageRecognizerTest_DefaultFallback');
    });

    it('EnFallback', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'MultiLanguageRecognizerTest_EnFallback');
    });

    it('EnGbFallback', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'MultiLanguageRecognizerTest_EnGbFallback');
    });

    it('EnUsFallback', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'MultiLanguageRecognizerTest_EnUsFallback');
    });

    it('EnUsFallback_AcitivtyLocaleCasing', async () => {
        await TestUtils.runTestScript(
            resourceExplorer,
            'MultiLanguageRecognizerTest_EnUsFallback_ActivityLocaleCasing'
        );
    });

    it('LanguagePolicy', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'MultiLanguageRecognizerTest_LanguagePolicy');
    });

    it('Locale case insensitivity', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'MultiLanguageRecognizerTest_LocaleCaseInsensitivity');
    });

    describe('Telemetry', () => {
        const recognizer = createRecognizer();
        let spy;

        beforeEach(() => {
            spy = spyOnTelemetryClientTrackEvent(recognizer);
        });

        afterEach(() => {
            spy.restore();
        });

        it('Merge - should log PII when logPersonalInformation is true', async () => {
            recognizer.logPersonalInformation = true;

            await recognizeIntentAndValidateTelemetry({
                text: greetingIntentTextEnUs,
                callCount: 1,
                recognizer,
                spy,
            });
        });

        it('Merge - should not log PII when logPersonalInformation is false', async () => {
            recognizer.logPersonalInformation = false;

            await recognizeIntentAndValidateTelemetry({
                text: greetingIntentTextEnUs,
                callCount: 1,
                recognizer,
                spy,
            });
        });

        it('should refrain from logging PII by default', async () => {
            const recognizerWithDefaultLogPii = createRecognizer();
            const trackEventSpy = spyOnTelemetryClientTrackEvent(recognizerWithDefaultLogPii);

            await recognizeIntentAndValidateTelemetry({
                text: greetingIntentTextEnUs,
                callCount: 1,
                recognizer: recognizerWithDefaultLogPii,
                spy: trackEventSpy,
            });
        });
    });
});
