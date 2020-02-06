/* eslint-disable @typescript-eslint/no-var-requires */
const assert = require('assert');
const { TestAdapter, TurnContext } = require('botbuilder-core');
const { DialogContext, DialogSet } = require('botbuilder-dialogs');
const { RegexRecognizer, IntentPattern, EntityRecognizerSet, RegexEntityRecognizer,
    AgeEntityRecognizer, ConfirmationEntityRecognizer, CurrencyEntityRecognizer,
    DateTimeEntityRecognizer, DimensionEntityRecognizer, EmailEntityRecognizer,
    GuidEntityRecognizer, HashtagEntityRecognizer, IpEntityRecognizer,
    MentionEntityRecognizer, NumberEntityRecognizer, OrdinalEntityRecognizer,
    PercentageEntityRecognizer, PhoneNumberEntityRecognizer, TemperatureEntityRecognizer,
    UrlEntityRecognizer
} = require('../');

const user = {
    id: process.env['USER_ID'] || 'UK8CH2281:TKGSUQHQE'
};

const bot = {
    id: process.env['BOT_ID'] || 'BKGSYSTFG:TKGSUQHQE'
};

const validateColorIntent = (result) => {
    // intent assertions
    const intents = result.intents;
    assert.equal(Object.entries(intents).length, 1, 'should recognize one intent');
    assert.equal(Object.keys(intents)[0], 'colorIntent', 'should recognize colorIntent');

    // entity assertions from captured group
    const entities = result.entities;
    assert.notEqual(entities.color , undefined, 'should find color');
    assert.equal(entities.code, undefined, 'should not find code');
    assert.equal(Object.entries(entities.color).length, 2, 'should find 2 colors');
    assert.equal(entities.color[0], 'red', 'should find red');
    assert.equal(entities.color[1], 'orange', 'should find orange');
};

const validateCodeIntent = (result) => {
    // intent assertions
    const intents = result.intents;
    assert.equal(Object.entries(intents).length, 1, 'should recognize one intent');
    assert.equal(Object.keys(intents)[0], 'codeIntent', 'should recognize codeIntent');

    // entity assertions from captured group
    const entities = result.entities;
    assert.notEqual(entities.code, undefined, 'should find code');
    assert.equal(entities.color, undefined, 'should not find color');
    assert.equal(Object.entries(entities.code).length, 2, 'should find 2 codes');
    assert.equal(entities.code[0], 'a1', 'should find a1');
    assert.equal(entities.code[1], 'b2', 'should find b2');
};

const createMessageActivity = (text) => {
    return {
        type: 'message',
        text: text || 'test activity',
        recipient: user,
        from: bot,
        locale: 'en-us'
    };
};

const createContext = (text) => {
    const activity = createMessageActivity(text);
    return new DialogContext(new DialogSet(), new TurnContext(new TestAdapter(), activity), {});
};

describe('recognizer tests', function() {
    const recognizer = new RegexRecognizer();
    recognizer.intents = [
        new IntentPattern('codeIntent', '(?<code>[a-z][0-9])'),
        new IntentPattern('colorIntent', '(color|colour)')
    ];
    recognizer.entities = new EntityRecognizerSet(
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
    );

    it('recognize regex pattern with dialog context', async function() {
        let dc = createContext('intent a1 b2');
        let result = await recognizer.recognize(dc);
        validateCodeIntent(result);

        dc = createContext('I would like color red and orange');
        result = await recognizer.recognize(dc);
        validateColorIntent(result);
    });

    it('recognize regex pattern with custom activity', async function() {
        const dc = createContext('');
        const activity = createMessageActivity('intent a1 b2');
        let result = await recognizer.recognize(dc, activity);
        validateCodeIntent(result);

        activity.text = 'I would like color red and orange';
        result = await recognizer.recognize(dc, activity);
        validateColorIntent(result);
    });

    it('recognize regex pattern with text and locale', async function() {
        const dc = createContext('');
        let result = await recognizer.recognize(dc, 'intent a1 b2', 'en-us');
        validateCodeIntent(result);

        result = await recognizer.recognize(dc, 'I would like color red and orange');
        validateColorIntent(result);
    });

    it('recognize age', async function() {
        const dc = createContext('');
        const result = await recognizer.recognize(dc, 'I am 12 years old', 'en-us');
        const entities = result.entities;
        assert.equal(entities.age[0], '12 years old', 'should recognize age text');
        const entity = entities['$instance'].age[0].resolution;
        assert.equal(entity.unit, 'Year', 'should recognize age unit');
        assert.equal(entity.value, '12', 'should recognize age value');
    });

    it('recognize confirmation', async function() {
        const dc = createContext('');
        let result = await recognizer.recognize(dc, 'It\' OK', 'en-us');
        let entities = result.entities;
        assert.equal(entities.boolean[0], 'OK', 'should recognize positive confirmation text');
        let entity = entities['$instance'].boolean[0].resolution;
        assert.equal(entity.value, true, 'should recognize positive confirmation');

        result = await recognizer.recognize(dc, 'It\' not OK', 'en-us');
        entities = result.entities;
        assert.equal(entities.boolean[0], 'not OK', 'should recognize negative confirmation text');
        entity = entities['$instance'].boolean[0].resolution;
        assert.equal(entity.value, false, 'should recognize negative confirmation');
    });

    it('recognize currency', async function() {
        const dc = createContext('');
        const result = await recognizer.recognize(dc, 'Interest expense in the 1988 third quarter was $75.3 million', 'en-us');
        const entities = result.entities;
        assert.equal(entities.currency[0], '$75.3 million', 'should recognize currency text');
        const entity = entities['$instance'].currency[0].resolution;
        assert.equal(entity.value, '75300000', 'should recognize currency value');
        assert.equal(entity.unit, 'Dollar', 'should recognize currency unit');
    });

    it('recognize datetime', async function() {
        const dc = createContext('');
        const result = await recognizer.recognize(dc, 'I will go back at 8pm today', 'en-us');
        const entities = result.entities;
        assert.equal(entities['datetimeV2.datetime'][0], '8pm today', 'should recognize datetime text');
        const entity = entities['$instance']['datetimeV2.datetime'][0].resolution;
        const recognizedTime = new Date(entity.values[0].value).getTime();
        const targetTime = new Date().setHours(20, 0, 0, 0);
        assert.equal(recognizedTime, targetTime, 'should recognize correct datetime');
    });

    it('recognize dimension', async function() {
        const dc = createContext('');
        const result = await recognizer.recognize(dc, 'The six-mile trip to my airport hotel that had taken 20 minutes earlier in the day took more than three hours.', 'en-us');
        const entities = result.entities;
        assert.equal(entities.dimension[0], 'six-mile', 'should recognize dimension text');
        const entity = entities['$instance'].dimension[0].resolution;
        assert.equal(entity.value, '6', 'should recognize dimension value');
        assert.equal(entity.unit, 'Mile', 'should recognize dimension unit');
    });

    it('recognize email address', async function() {
        const dc = createContext('');
        const result = await recognizer.recognize(dc, 'contact service@contoso.com', 'en-us');
        const entities = result.entities;
        assert.equal(entities.email[0], 'service@contoso.com', 'should recognize email address');
    });

    it('recognize guid', async function() {
        const dc = createContext('');
        const result = await recognizer.recognize(dc, 'the token is 21EC2020-3AEA-1069-A2DD-08002B30309D', 'en-us');
        const entities = result.entities;
        assert.equal(entities.guid[0], '21EC2020-3AEA-1069-A2DD-08002B30309D', 'should recognize guid');
    });

    it('recognize hashtag', async function() {
        const dc = createContext('');
        const result = await recognizer.recognize(dc, 'make #America great again #Trump', 'en-us');
        const entities = result.entities;
        assert.equal(entities.hashtag.length, 2, 'should recognize 2 hashtags');
        assert.equal(entities.hashtag[0], '#America', 'should recognize first hashtag');
        assert.equal(entities.hashtag[1], '#Trump', 'should recognize second hashtag');
    });

    it('recognize IP address', async function() {
        const dc = createContext('');
        let result = await recognizer.recognize(dc, 'gateway: 192.168.1.1', 'en-us');
        let entities = result.entities;
        assert.equal(entities.ip[0], '192.168.1.1', 'should recognize IPv4 address');

        result = await recognizer.recognize(dc, 'gateway: [2001:1d5f::1]', 'en-us');
        entities = result.entities;
        assert.equal(entities.ip[0], '2001:1d5f::1', 'should recognize IPv6 address');

        result = await recognizer.recognize(dc, 'v4: 192.168.1.1 v6: 2001:1d5f::1', 'en-us');
        entities = result.entities;
        assert.equal(entities.ip.length, 2, 'should recognize hybrid IP addresses');
    });

    it('recognize mention', async function() {
        const dc = createContext('');
        const result = await recognizer.recognize(dc, 'make #America great again @realDonaldTrump', 'en-us');
        const entities = result.entities;
        assert.equal(entities.mention[0], '@realDonaldTrump', 'should recognize mention');
    });

    it('recognize number', async function() {
        const dc = createContext('');
        const result = await recognizer.recognize(dc, 'I have two apples', 'en-us');
        const entities = result.entities;
        assert.equal(entities.number[0], 'two', 'should recognize number text');
        const entity = entities['$instance'].number[0].resolution;
        assert.equal(entity.value, '2', 'should recognize number value');
    });

    it('recognize ordinal number', async function() {
        const dc = createContext('');
        const result = await recognizer.recognize(dc, 'the 237th line', 'en-us');
        const entities = result.entities;
        assert.equal(entities.ordinal[0], '237th', 'should recognize ordinal number text');
        const entity = entities['$instance'].ordinal[0].resolution;
        assert.equal(entity.value, '237', 'should recognize ordinal number value');
    });

    it('recognize percentage', async function() {
        const dc = createContext('');
        const result = await recognizer.recognize(dc, 'one hundred percents', 'en-us');
        const entities = result.entities;
        assert.equal(entities.percentage[0], 'one hundred percents', 'should recognize percentage text');
        const entity = entities['$instance'].percentage[0].resolution;
        assert.equal(entity.value, '100%', 'should recognize percentage value');
    });

    it('recognize temperature', async function() {
        const dc = createContext('');
        let result = await recognizer.recognize(dc, 'the temperature is 21 °C', 'en-us');
        let entities = result.entities;
        assert.equal(entities.temperature[0], '21 °C', 'should recognize celsius temperature text');
        let entity = entities['$instance'].temperature[0].resolution;
        assert.equal(entity.value, '21', 'should recognize celsius temperature value');
        assert.equal(entity.unit, 'C', 'should recognize celsius temperature unit');

        result = await recognizer.recognize(dc, 'the temperature is 70 °F', 'en-us');
        entities = result.entities;
        assert.equal(entities.temperature[0], '70 °F', 'should recognize fahrenheit temperature text');
        entity = entities['$instance'].temperature[0].resolution;
        assert.equal(entity.value, '70', 'should recognize fahrenheit temperature value');
        assert.equal(entity.unit, 'F', 'should recognize fahrenheit temperature unit');
    });

    it('recognize url', async function() {
        const dc = createContext('');
        const result = await recognizer.recognize(dc, 'check out https://www.microsoft.com', 'en-us');
        const entities = result.entities;
        assert.equal(entities.url[0], 'https://www.microsoft.com', 'should recognize url');
    });
});
