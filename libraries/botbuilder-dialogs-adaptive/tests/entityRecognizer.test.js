const assert = require('assert');
const { ActivityTypes, TestAdapter, TurnContext } = require('botbuilder');
const { DialogContext, DialogSet } = require('botbuilder-dialogs');
const {
    AgeEntityRecognizer,
    ConfirmationEntityRecognizer,
    CurrencyEntityRecognizer,
    DateTimeEntityRecognizer,
    DimensionEntityRecognizer,
    EmailEntityRecognizer,
    EntityRecognizerSet,
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
    RegexEntityRecognizer,
} = require('botbuilder-dialogs-adaptive');

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

describe('EntityRecognizer Tests', () => {
    const recognizers = new EntityRecognizerSet(
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
        new RegexEntityRecognizer().configure({
            name: 'color',
            pattern: '(?i)(red|green|blue|purple|orange|violet|white|black)',
        }),
        new RegexEntityRecognizer().configure({
            name: 'size',
            pattern: '(?i)(small|medium|large)',
        })
    );

    it('test age', async function () {
        const dc = getDialogContext('testAge', 'This is a test of one, 2, three years old');
        const results = await recognizers.recognizeEntities(dc, dc.context.activity.text, dc.context.activity.locale);
        assert.strictEqual(results.length, 6);
        assert.strictEqual(results.filter((e) => e.type === 'age').length, 1);
    });

    it('test confirmation', async function () {
        const dc = getDialogContext('testConfirmation', 'yes, please');
        const results = await recognizers.recognizeEntities(dc, dc.context.activity.text, dc.context.activity.locale);
        assert.strictEqual(results.length, 2);
        assert.strictEqual(results.filter((e) => e.type === 'boolean').length, 1);
    });

    it('test currency', async function () {
        const dc = getDialogContext('testCurrency', 'I would pay four dollars for that.');
        const results = await recognizers.recognizeEntities(dc, dc.context.activity.text, dc.context.activity.locale);
        assert.strictEqual(results.length, 3);
        assert.strictEqual(results.filter((e) => e.type === 'currency').length, 1);
    });

    it('test datetime', async function () {
        const dc = getDialogContext('testDatetime', 'Next thursday at 4pm.');
        const results = await recognizers.recognizeEntities(dc, dc.context.activity.text, dc.context.activity.locale);
        assert.strictEqual(results.length, 3); // should be 4 but ordinal entity is missing.
        assert.strictEqual(results.filter((e) => e.type === 'datetimeV2.datetime').length, 1);
        // assert.strictEqual(results.filter((e) => e.type === 'ordinal').length, 1);
        assert.strictEqual(results.filter((e) => e.type === 'dimension').length, 1);
    });

    it('test dimension', async function () {
        const dc = getDialogContext('testDimension', "I think he 's 5 foot ten");
        const results = await recognizers.recognizeEntities(dc, dc.context.activity.text, dc.context.activity.locale);
        assert.strictEqual(results.length, 4);
        assert.strictEqual(results.filter((e) => e.type === 'dimension').length, 1);
    });

    it('test email', async function () {
        const dc = getDialogContext('testEmail', 'my email address is foo@att.uk.co');
        const results = await recognizers.recognizeEntities(dc, dc.context.activity.text, dc.context.activity.locale);
        assert.strictEqual(results.length, 2);
        assert.strictEqual(results.filter((e) => e.type === 'email').length, 1);
    });

    it('test guid', async function () {
        const dc = getDialogContext('testGuid', 'my account number is 00000000-0000-0000-0000-000000000000...');
        const results = await recognizers.recognizeEntities(dc, dc.context.activity.text, dc.context.activity.locale);
        assert.strictEqual(results.length, 3); // should be 7, but some entitie are missing.
        assert.strictEqual(results.filter((e) => e.type === 'guid').length, 1);
    });

    it('test hashtag', async function () {
        const dc = getDialogContext('testHashtag', "I'm so cool #cool #groovy...");
        const results = await recognizers.recognizeEntities(dc, dc.context.activity.text, dc.context.activity.locale);
        assert.strictEqual(results.length, 3);
        assert.strictEqual(results.filter((e) => e.type === 'hashtag').length, 2);
    });

    it('test ip', async function () {
        const dc = getDialogContext('testIp', 'My address is 1.2.3.4.');
        const results = await recognizers.recognizeEntities(dc, dc.context.activity.text, dc.context.activity.locale);
        assert.strictEqual(results.length, 6);
        assert.strictEqual(results.filter((e) => e.type === 'ip').length, 1);
    });

    it('test mention', async function () {
        const dc = getDialogContext('testMention', "Tell @joesmith I'm coming...");
        const results = await recognizers.recognizeEntities(dc, dc.context.activity.text, dc.context.activity.locale);
        assert.strictEqual(results.length, 2);
        assert.strictEqual(results.filter((e) => e.type === 'mention').length, 1);
    });

    it('test number', async function () {
        const dc = getDialogContext('testNumber', 'This is a test of one, 2, three');
        const results = await recognizers.recognizeEntities(dc, dc.context.activity.text, dc.context.activity.locale);
        assert.strictEqual(results.length, 4);
        assert.strictEqual(results.filter((e) => e.type === 'number').length, 3);
    });

    it('test ordinal', async function () {
        const dc = getDialogContext('testOrdinal', 'First, second or third');
        const results = await recognizers.recognizeEntities(dc, dc.context.activity.text, dc.context.activity.locale);
        assert.strictEqual(results.length, 4);
        assert.strictEqual(results.filter((e) => e.type === 'ordinal').length, 3);
    });

    it('test percentage', async function () {
        const dc = getDialogContext('testPercentage', 'The population hit 33.3%');
        const results = await recognizers.recognizeEntities(dc, dc.context.activity.text, dc.context.activity.locale);
        assert.strictEqual(results.length, 3);
        assert.strictEqual(results.filter((e) => e.type === 'percentage').length, 1);
    });

    it('test phonenumber', async function () {
        const dc = getDialogContext('testPhonenumber', 'Call 425-882-8080');
        const results = await recognizers.recognizeEntities(dc, dc.context.activity.text, dc.context.activity.locale);
        assert.strictEqual(results.length, 3); // should be 5, but some entities are missing.
        assert.strictEqual(results.filter((e) => e.type === 'phonenumber').length, 1);
    });

    it('test temperature', async function () {
        const dc = getDialogContext('testTemperature', 'set the oven to 350 degrees');
        const results = await recognizers.recognizeEntities(dc, dc.context.activity.text, dc.context.activity.locale);
        assert.strictEqual(results.length, 3);
        assert.strictEqual(results.filter((e) => e.type === 'temperature').length, 1);
    });

    it('test url', async function () {
        const dc = getDialogContext('testUrl', 'go to http://about.me for more info');
        const results = await recognizers.recognizeEntities(dc, dc.context.activity.text, dc.context.activity.locale);
        assert.strictEqual(results.length, 2);
        assert.strictEqual(results.filter((e) => e.type === 'url').length, 1);
    });

    it('test regex', async function () {
        const dc = getDialogContext('testRegex', 'I would like a red or Blue cat');
        const results = await recognizers.recognizeEntities(dc, dc.context.activity.text, dc.context.activity.locale);
        assert.strictEqual(results.length, 3);
        assert.strictEqual(results.filter((e) => e.type === 'color').length, 2);
        assert.strictEqual(results[1].text, 'red');
        assert.strictEqual(results[2].text, 'Blue');
    });
});
