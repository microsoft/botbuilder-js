/* eslint-disable @typescript-eslint/no-var-requires */
const assert = require('assert');
const { Recognizer } = require('botbuilder-dialogs');
const {
    RegexRecognizer,
    IntentPattern,
    EntityRecognizerSet,
    RegexEntityRecognizer,
    AgeEntityRecognizer,
    ConfirmationEntityRecognizer,
    CurrencyEntityRecognizer,
    DateTimeEntityRecognizer,
    DimensionEntityRecognizer,
    EmailEntityRecognizer,
    GuidEntityRecognizer,
    HashtagEntityRecognizer,
    IpEntityRecognizer,
    MentionEntityRecognizer,
    NumberEntityRecognizer,
    OrdinalEntityRecognizer,
    PercentageEntityRecognizer,
    PhoneNumberEntityRecognizer,
    TemperatureEntityRecognizer,
    UrlEntityRecognizer,
} = require('../');
const {
    colorIntentText,
    codeIntentText,
    recognizeIntentAndValidateTelemetry,
    recognizeIntentAndValidateTelemetry_withCustomActivity,
    spyOnTelemetryClientTrackEvent,
} = require('./recognizerTelemetryUtils');
const { createContext, createMessageActivity } = require('./activityUtils');
const { validateCodeIntent, validateColorIntent } = require('./intentValidations');
const { Culture } = require('@microsoft/recognizers-text-suite');

describe('RegexRecognizer Tests', () => {
    const recognizer = new RegexRecognizer().configure({
        intents: [
            new IntentPattern('codeIntent', '(?<code>[a-z][0-9])'),
            new IntentPattern('colorIntent', '(color|colour)'),
        ],
        entities: new EntityRecognizerSet(
            new AgeEntityRecognizer(),
            new ConfirmationEntityRecognizer(),
            new CurrencyEntityRecognizer(),
            new DateTimeEntityRecognizer(),
            new DimensionEntityRecognizer(),
            new EmailEntityRecognizer(),
            new GuidEntityRecognizer(),
            new HashtagEntityRecognizer(),
            new IpEntityRecognizer(),
            new MentionEntityRecognizer(),
            new NumberEntityRecognizer(),
            new OrdinalEntityRecognizer(),
            new PercentageEntityRecognizer(),
            new PhoneNumberEntityRecognizer(),
            new TemperatureEntityRecognizer(),
            new UrlEntityRecognizer(),
            new RegexEntityRecognizer('color', '(red|green|blue|purple|orange|violet|white|black)'),
            new RegexEntityRecognizer('backgroundColor', '(back|background) {color}'),
            new RegexEntityRecognizer('foregroundColor', '(foreground|front) {color}')
        ),
    });

    const recognizerResultSample = {
        text: 'textValue',
        alteredText: 'alteredTextValue',
        intents: {
            intent1: { score: 0.03 },
            intent2: { score: 0.95 },
            intent3: { score: 0.02 },
        },
        entities: {
            name: ['value1', 'value2', 'value3'],
            $instance: {
                name: [{ startIndex: 15 }],
            },
        },
        additionalProperties: 'additionalPropertiesValue',
    };

    it('recognize regex pattern with dialog context', async function () {
        const dc = createContext(codeIntentText);
        const activity = dc.context.activity;
        let result = await recognizer.recognize(dc, activity);
        validateCodeIntent(result);

        // verify seed text is not exposed
        const entities = result.entities;
        assert.strictEqual(entities.text, undefined);
        assert(entities.code);

        activity.text = colorIntentText;
        result = await recognizer.recognize(dc, activity);
        validateColorIntent(result);
    });

    it('recognize regex pattern with custom activity', async function () {
        const dc = createContext('');
        const activity = createMessageActivity(codeIntentText);
        let result = await recognizer.recognize(dc, activity);
        validateCodeIntent(result);

        activity.text = 'I would like color red and orange';
        result = await recognizer.recognize(dc, activity);
        validateColorIntent(result);
    });

    describe('telemetry', () => {
        let spy;

        beforeEach(() => {
            spy = spyOnTelemetryClientTrackEvent(recognizer);
        });

        afterEach(() => {
            spy.restore();
        });

        it('logs PII when logPersonalInformation is true', async function () {
            recognizer.logPersonalInformation = true;

            await recognizeIntentAndValidateTelemetry({
                text: codeIntentText,
                callCount: 1,
                recognizer,
                spy,
            });
            await recognizeIntentAndValidateTelemetry({
                text: colorIntentText,
                callCount: 2,
                recognizer,
                spy,
            });

            await recognizeIntentAndValidateTelemetry_withCustomActivity({
                text: codeIntentText,
                callCount: 3,
                recognizer,
                spy,
            });
        });

        it('does not log PII when logPersonalInformation is false', async function () {
            recognizer.logPersonalInformation = false;

            await recognizeIntentAndValidateTelemetry({
                text: codeIntentText,
                callCount: 1,
                recognizer,
                spy,
            });
            await recognizeIntentAndValidateTelemetry({
                text: colorIntentText,
                callCount: 2,
                recognizer,
                spy,
            });

            await recognizeIntentAndValidateTelemetry_withCustomActivity({
                text: codeIntentText,
                callCount: 3,
                recognizer,
                spy,
            });
        });

        it('should refrain from logging PII by default', async function () {
            const recognizerWithDefaultLogPii = new RegexRecognizer().configure({
                intents: [
                    new IntentPattern('codeIntent', '(?<code>[a-z][0-9])'),
                    new IntentPattern('colorIntent', '(color|colour)'),
                ],
                entities: new EntityRecognizerSet(
                    new NumberEntityRecognizer(),
                    new OrdinalEntityRecognizer(),
                    new RegexEntityRecognizer('color', '(red|green|blue|purple|orange|violet|white|black)'),
                    new RegexEntityRecognizer('backgroundColor', '(back|background) {color}'),
                    new RegexEntityRecognizer('foregroundColor', '(foreground|front) {color}')
                ),
            });
            const trackEventSpy = spyOnTelemetryClientTrackEvent(recognizerWithDefaultLogPii);
            await recognizeIntentAndValidateTelemetry({
                text: codeIntentText,
                callCount: 1,
                recognizer: recognizerWithDefaultLogPii,
                spy: trackEventSpy,
            });

            await recognizeIntentAndValidateTelemetry_withCustomActivity({
                text: codeIntentText,
                callCount: 2,
                recognizer: recognizerWithDefaultLogPii,
                spy: trackEventSpy,
            });
        });
    });

    it('recognize regex pattern with text and locale', async function () {
        const dc = createContext('');
        const activity = createMessageActivity(codeIntentText);
        activity.locale = Culture.English;
        let result = await recognizer.recognize(dc, activity);
        validateCodeIntent(result);

        activity.text = 'I would like color red and orange';
        result = await recognizer.recognize(dc, activity);
        validateColorIntent(result);
    });

    it('recognize age', async function () {
        const dc = createContext('');
        const activity = createMessageActivity('I am 12 years old');
        const result = await recognizer.recognize(dc, activity);
        const entities = result.entities;
        assert.strictEqual(entities.age[0], '12 years old', 'should recognize age text');
        const entity = entities['$instance'].age[0].resolution;
        assert.strictEqual(entity.unit, 'Year', 'should recognize age unit');
        assert.strictEqual(entity.value, '12', 'should recognize age value');
    });

    it('recognize confirmation', async function () {
        const dc = createContext('');
        const activity = createMessageActivity("It's OK");
        let result = await recognizer.recognize(dc, activity);
        let entities = result.entities;
        assert.strictEqual(entities.boolean[0], 'OK', 'should recognize positive confirmation text');
        let entity = entities['$instance'].boolean[0].resolution;
        assert.strictEqual(entity.value, true, 'should recognize positive confirmation');

        activity.text = "It's not OK";
        result = await recognizer.recognize(dc, activity);
        entities = result.entities;
        assert.strictEqual(entities.boolean[0], 'not OK', 'should recognize negative confirmation text');
        entity = entities['$instance'].boolean[0].resolution;
        assert.strictEqual(entity.value, false, 'should recognize negative confirmation');
    });

    it('recognize currency', async function () {
        const dc = createContext('');
        const activity = createMessageActivity('Interest expense in the 1988 third quarter was $75.3 million');
        const result = await recognizer.recognize(dc, activity);
        const entities = result.entities;
        assert.strictEqual(entities.currency[0], '$75.3 million', 'should recognize currency text');
        const entity = entities['$instance'].currency[0].resolution;
        assert.strictEqual(entity.value, '75300000', 'should recognize currency value');
        assert.strictEqual(entity.unit, 'Dollar', 'should recognize currency unit');
    });

    it('recognize datetime', async function () {
        const dc = createContext('');
        const activity = createMessageActivity('I will go back at 8pm today');
        const result = await recognizer.recognize(dc, activity);
        const entities = result.entities;
        assert.strictEqual(entities['datetimeV2.datetime'][0], '8pm today', 'should recognize datetime text');
        const entity = entities['$instance']['datetimeV2.datetime'][0].resolution;
        const recognizedTime = new Date(entity.values[0].value).getTime();
        const targetTime = new Date().setHours(20, 0, 0, 0);
        assert.strictEqual(recognizedTime, targetTime, 'should recognize correct datetime');
    });

    it('recognize dimension', async function () {
        const dc = createContext('');
        const activity = createMessageActivity(
            'The six-mile trip to my airport hotel that had taken 20 minutes earlier in the day took more than three hours.'
        );
        const result = await recognizer.recognize(dc, activity);
        const entities = result.entities;
        assert.strictEqual(entities.dimension[0], 'six-mile', 'should recognize dimension text');
        const entity = entities['$instance'].dimension[0].resolution;
        assert.strictEqual(entity.value, '6', 'should recognize dimension value');
        assert.strictEqual(entity.unit, 'Mile', 'should recognize dimension unit');
    });

    it('recognize email address', async function () {
        const dc = createContext('');
        const activity = createMessageActivity('contact service@contoso.com');
        const result = await recognizer.recognize(dc, activity);
        const entities = result.entities;
        assert.strictEqual(entities.email[0], 'service@contoso.com', 'should recognize email address');
    });

    it('recognize guid', async function () {
        const dc = createContext('');
        const activity = createMessageActivity('the token is 21EC2020-3AEA-1069-A2DD-08002B30309D');
        const result = await recognizer.recognize(dc, activity);
        const entities = result.entities;
        assert.strictEqual(entities.guid[0], '21EC2020-3AEA-1069-A2DD-08002B30309D', 'should recognize guid');
    });

    it('recognize hashtag', async function () {
        const dc = createContext('');
        const activity = createMessageActivity('make #America great again #Trump');
        const result = await recognizer.recognize(dc, activity);
        const entities = result.entities;
        assert.strictEqual(entities.hashtag.length, 2, 'should recognize 2 hashtags');
        assert.strictEqual(entities.hashtag[0], '#America', 'should recognize first hashtag');
        assert.strictEqual(entities.hashtag[1], '#Trump', 'should recognize second hashtag');
    });

    it('recognize IP address', async function () {
        const dc = createContext('');
        const activity = createMessageActivity('gateway: 192.168.1.1');
        let result = await recognizer.recognize(dc, activity);
        let entities = result.entities;
        assert.strictEqual(entities.ip[0], '192.168.1.1', 'should recognize IPv4 address');

        activity.text = 'gateway: [2001:1d5f::1]';
        result = await recognizer.recognize(dc, activity);
        entities = result.entities;
        assert.strictEqual(entities.ip[0], '2001:1d5f::1', 'should recognize IPv6 address');

        activity.text = 'v4: 192.168.1.1 v6: 2001:1d5f::1';
        result = await recognizer.recognize(dc, activity);
        entities = result.entities;
        assert.strictEqual(entities.ip.length, 2, 'should recognize hybrid IP addresses');
    });

    it('recognize mention', async function () {
        const dc = createContext('');
        const activity = createMessageActivity('make #America great again @realDonaldTrump');
        const result = await recognizer.recognize(dc, activity);
        const entities = result.entities;
        assert.strictEqual(entities.mention[0], '@realDonaldTrump', 'should recognize mention');
    });

    it('recognize number', async function () {
        const dc = createContext('');
        const activity = createMessageActivity('I have two apples');
        const result = await recognizer.recognize(dc, activity);
        const entities = result.entities;
        assert.strictEqual(entities.number[0], 'two', 'should recognize number text');
        const entity = entities['$instance'].number[0].resolution;
        assert.strictEqual(entity.value, '2', 'should recognize number value');
    });

    it('recognize ordinal number', async function () {
        const dc = createContext('');
        const activity = createMessageActivity('the 237th line');
        const result = await recognizer.recognize(dc, activity);
        const entities = result.entities;
        assert.strictEqual(entities.ordinal[0], '237th', 'should recognize ordinal number text');
        const entity = entities['$instance'].ordinal[0].resolution;
        assert.strictEqual(entity.value, '237', 'should recognize ordinal number value');
    });

    it('recognize percentage', async function () {
        const dc = createContext('');
        const activity = createMessageActivity('one hundred percents');
        const result = await recognizer.recognize(dc, activity);
        const entities = result.entities;
        assert.strictEqual(entities.percentage[0], 'one hundred percents', 'should recognize percentage text');
        const entity = entities['$instance'].percentage[0].resolution;
        assert.strictEqual(entity.value, '100%', 'should recognize percentage value');
    });

    it('recognize temperature', async function () {
        const dc = createContext('');
        const activity = createMessageActivity('the temperature is 21 °C');
        let result = await recognizer.recognize(dc, activity);
        let entities = result.entities;
        assert.strictEqual(entities.temperature[0], '21 °C', 'should recognize celsius temperature text');
        let entity = entities['$instance'].temperature[0].resolution;
        assert.strictEqual(entity.value, '21', 'should recognize celsius temperature value');
        assert.strictEqual(entity.unit, 'C', 'should recognize celsius temperature unit');

        activity.text = 'the temperature is 70 °F';
        result = await recognizer.recognize(dc, activity);
        entities = result.entities;
        assert.strictEqual(entities.temperature[0], '70 °F', 'should recognize fahrenheit temperature text');
        entity = entities['$instance'].temperature[0].resolution;
        assert.strictEqual(entity.value, '70', 'should recognize fahrenheit temperature value');
        assert.strictEqual(entity.unit, 'F', 'should recognize fahrenheit temperature unit');
    });

    it('recognize url', async function () {
        const dc = createContext('');
        const activity = createMessageActivity('check out https://www.microsoft.com');
        const result = await recognizer.recognize(dc, activity);
        const entities = result.entities;
        assert.strictEqual(entities.url[0], 'https://www.microsoft.com', 'should recognize url');
    });

    it('optional match groups', async function () {
        const recognizer = new RegexRecognizer().configure({
            intents: [
                new IntentPattern('AddIntent', '(?:add|create) .*(?:to-do|todo|task)(?: )?(?:named (?<title>.*))?'),
            ],
        });
        const dc = createContext('');
        let activity = createMessageActivity('add a todo named first');
        let result = await recognizer.recognize(dc, activity);
        assert.strictEqual(result.entities.title[0], 'first');
        activity = createMessageActivity('add a todo');
        result = await recognizer.recognize(dc, activity);
        assert.strictEqual(result.entities.title, undefined);
    });

    it('basic telemetry test', () => {
        let properties = {};
        properties['test'] = 'testvalue';
        properties['foo'] = 'foovalue';
        const metrics = {};
        const context = {};
        const activity = {};

        let callCount = 0;
        let telemetryClient = {
            trackEvent: (telemetry) => {
                assert(telemetry, 'telemetry is null');
                switch (++callCount) {
                    case 1:
                        assert.strictEqual(telemetry.name, 'TestResult');
                        assert(telemetry.properties);
                        assert('test' in telemetry.properties);
                        assert.strictEqual(telemetry.properties['test'], properties['test']);
                        assert('foo' in telemetry.properties);
                        assert.strictEqual(telemetry.properties['foo'], properties['foo']);
                        assert('MyImportantProperty' in telemetry.properties);
                        assert.strictEqual(telemetry.properties['MyImportantProperty'], 'myImportantValue');
                        break;

                    case 2:
                        assert.strictEqual(telemetry.name, 'MySecondEvent');
                        assert(telemetry.properties);
                        assert('MyImportantProperty2' in telemetry.properties);
                        assert.strictEqual(telemetry.properties['MyImportantProperty2'], 'myImportantValue2');
                        break;

                    default:
                        console.log('Call number:' + callCount);
                        console.log(telemetry);
                        assert(false);
                        break;
                }
            },
        };

        let recognizer = new MockTelemetryInRecognizer();
        recognizer.telemetryClient = telemetryClient;
        recognizer.recognize(context, activity, properties, metrics);
    });

    it('check fillRecognizerResultTelemetryProperties', () => {
        let recognizer = new Recognizer();
        const telemetryProperties = {
            TelemetryPropertiesKey1: 'TelemetryPropertiesValue1',
            TelemetryPropertiesKey2: 'TelemetryPropertiesValue2',
        };
        const properties = recognizer.fillRecognizerResultTelemetryProperties(
            recognizerResultSample,
            telemetryProperties
        );
        assert('Text' in properties);
        assert.strictEqual(properties['Text'], recognizerResultSample['text']);
        assert('AlteredText' in properties);
        assert.strictEqual(properties['AlteredText'], recognizerResultSample['alteredText']);
        assert('TopIntent' in properties);
        assert.strictEqual(properties['TopIntent'], 'intent2');
        assert('TopIntentScore' in properties);
        assert.strictEqual(properties['TopIntentScore'], '0.95');
        assert('Intents' in properties);
        assert.strictEqual(properties['Intents'], JSON.stringify(recognizerResultSample['intents']));
        assert('Entities' in properties);
        assert.strictEqual(properties['Entities'], JSON.stringify(recognizerResultSample['entities']));
        assert('AdditionalProperties' in properties);
        assert.strictEqual(properties['AdditionalProperties'], '{"additionalProperties":"additionalPropertiesValue"}');
        assert('TelemetryPropertiesKey1' in properties);
        assert.strictEqual(properties['TelemetryPropertiesKey1'], telemetryProperties['TelemetryPropertiesKey1']);
        assert('TelemetryPropertiesKey2' in properties);
        assert.strictEqual(properties['TelemetryPropertiesKey2'], telemetryProperties['TelemetryPropertiesKey2']);
    });
});

class MockTelemetryInRecognizer extends Recognizer {
    recognize(dialogContext, activity, properties, metrics) {
        if (!('MyImportantProperty' in properties)) {
            properties['MyImportantProperty'] = 'myImportantValue';
        }
        this.telemetryClient.trackEvent({
            name: 'TestResult',
            properties: properties,
            metrics: metrics,
        });

        // Create second event
        const secondProperties = {};
        secondProperties['MyImportantProperty2'] = 'myImportantValue2';

        this.telemetryClient.trackEvent({
            name: 'MySecondEvent',
            properties: secondProperties,
        });
    }
}
