const path = require('path');
const { ComponentRegistration } = require('botbuilder-core');
const { AdaptiveComponentRegistration, EntityRecognizerSet, RecognizerSet, RegexRecognizer, IntentPattern } = require('botbuilder-dialogs-adaptive');
const { ResourceExplorer } = require('botbuilder-dialogs-declarative');
const { AdaptiveTestComponentRegistration, TestUtils } = require('../lib');
const {
    AgeEntityRecognizer,
    NumberEntityRecognizer,
    PercentageEntityRecognizer,
    PhoneNumberEntityRecognizer,
    RegexEntityRecognizer,
    TemperatureEntityRecognizer,
    UrlEntityRecognizer
} = require('botbuilder-dialogs-adaptive');

const {
    colorIntentText,
    codeIntentText,
    recognizeIntentAndValidateTelemetry,
    recognizeIntentAndValidateTelemetry_withCustomActivity,
    spyOnTelemetryClientTrackEvent
} = require('./recognizerTelemetryUtils');

const createRecognizer = () => {
    return new RecognizerSet().configure({
        recognizers: [
            new RegexRecognizer().configure({
                id: 'codeRecognizer',
                intents: [new IntentPattern('codeIntent', '(?<code>[a-z][0-9])')],
                entities: new EntityRecognizerSet(
                    new AgeEntityRecognizer(),
                    new NumberEntityRecognizer(),
                    new PercentageEntityRecognizer(),
                    new PhoneNumberEntityRecognizer(),
                    new TemperatureEntityRecognizer()
                )
            }),
            new RegexRecognizer().configure({
                id: 'colorRecognizer',
                intents: [new IntentPattern('colorIntent', '(?i)(color|colour)')],
                entities: new EntityRecognizerSet(
                    new UrlEntityRecognizer(),
                    new RegexEntityRecognizer('color', '(?i)(red|green|blue|purple|orange|violet|white|black)'),
                    new RegexEntityRecognizer('backgroundColor', '(?i)(back|background)'),
                    new RegexEntityRecognizer('foregroundColor', '(?i)(foreground|front) {color}'),
                )
            })
        ]
    });
};

describe('RecognizerSetTests', function () {
    this.timeout(5000);

    ComponentRegistration.add(new AdaptiveComponentRegistration());
    ComponentRegistration.add(new AdaptiveTestComponentRegistration());

    const resourceExplorer = new ResourceExplorer().addFolder(
        path.join(__dirname, 'resources/RecognizerSetTests'),
        true,
        false
    );

    it('Merge', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'RecognizerSetTests_Merge');
    });

    it('None', async () => {
        await TestUtils.runTestScript(resourceExplorer, 'RecognizerSetTests_None');
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
                text: codeIntentText, callCount: 1, recognizer, spy
            });
            await recognizeIntentAndValidateTelemetry({
                text: colorIntentText, callCount: 2, recognizer, spy
            });

            await recognizeIntentAndValidateTelemetry_withCustomActivity({
                text: codeIntentText, callCount: 3, recognizer, spy
            });
        });

        it('Merge - should not log PII when logPersonalInformation is false', async () => {
            recognizer.logPersonalInformation = false;

            await recognizeIntentAndValidateTelemetry({
                text: codeIntentText, callCount: 1, recognizer, spy
            });
            await recognizeIntentAndValidateTelemetry({
                text: colorIntentText, callCount: 2, recognizer, spy
            });

            await recognizeIntentAndValidateTelemetry_withCustomActivity({
                text: codeIntentText, callCount: 3, recognizer, spy
            });
        });

        it('should refrain from logging PII by default', async () => {
            const recognizerWithDefaultLogPii = createRecognizer();
            const trackEventSpy = spyOnTelemetryClientTrackEvent(recognizerWithDefaultLogPii);

            await recognizeIntentAndValidateTelemetry({
                text: codeIntentText,
                callCount: 1,
                recognizer: recognizerWithDefaultLogPii,
                spy: trackEventSpy
            });

            await recognizeIntentAndValidateTelemetry_withCustomActivity({
                text: codeIntentText,
                callCount: 2,
                recognizer: recognizerWithDefaultLogPii,
                spy: trackEventSpy
            });
        });
    });
});

