const { ok, strictEqual } = require('assert');
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
    GuidEntityRecognizer,
    HashtagEntityRecognizer,
    IpEntityRecognizer,
    MentionEntityRecognizer,
    NumberEntityRecognizer,
    OrdinalEntityRecognizer,
    PercentageEntityRecognizer,
    PhoneNumberEntityRecognizer,
    RecognizerSet,
    TemperatureEntityRecognizer,
    UrlEntityRecognizer,
    RegexEntityRecognizer,
    ChannelMentionEntityRecognizer,
    EntityRecognizer,
} = require('botbuilder-dialogs-adaptive');
const { getLogPersonalInformation, spyOnTelemetryClientTrackEvent } = require('./recognizerTelemetryUtils');

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

describe('EntityRecognizer Recognizer Tests', () => {
    const recognizers = new RecognizerSet().configure({
        recognizers: [
            new AgeEntityRecognizer(),
            new ChannelMentionEntityRecognizer(),
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
            }),
        ],
    });

    it('test age', async function () {
        const dc = getDialogContext('testAge', 'This is a test of one, 2, three years old');
        const results = await recognizers.recognize(dc, dc.context.activity);

        strictEqual(Object.keys(results.intents).length, 1);
        strictEqual(Object.keys(results.intents)[0], 'None');
        assert(results.entities.age);
        assert(results.entities.number);
        assert(results.entities['$instance'].age);
        assert(results.entities['$instance'].number);
    });

    it('test confirmation', async function () {
        const dc = getDialogContext('testConfirmation', 'yes, please');
        const results = await recognizers.recognize(dc, dc.context.activity);

        strictEqual(Object.keys(results.intents).length, 1);
        strictEqual(Object.keys(results.intents)[0], 'None');
        assert(results.entities.boolean);
        strictEqual(results.entities.boolean[0], 'yes');
        assert(results.entities['$instance'].boolean);
    });

    it('test currency', async function () {
        const dc = getDialogContext('testCurrency', 'I would pay four dollars for that.');
        const results = await recognizers.recognize(dc, dc.context.activity);

        strictEqual(Object.keys(results.intents).length, 1);
        strictEqual(Object.keys(results.intents)[0], 'None');
        assert(results.entities.currency);
        strictEqual(results.entities.currency[0], 'four dollars');
        assert(results.entities['$instance'].currency);
    });

    it('test datetime', async function () {
        const dc = getDialogContext('testDatetime', 'Next thursday at 4pm.');
        const results = await recognizers.recognize(dc, dc.context.activity);

        strictEqual(Object.keys(results.intents).length, 1);
        strictEqual(Object.keys(results.intents)[0], 'None');
        assert(results.entities['datetimeV2.datetime']);
        // missing ordinal entity
        // assert(results.entities.ordinal);
        assert(results.entities.dimension);
        strictEqual(results.entities.boolean, undefined);
    });

    it('test dimension', async function () {
        const dc = getDialogContext('testDimension', "I think he 's 5 foot ten");
        const results = await recognizers.recognize(dc, dc.context.activity);

        strictEqual(Object.keys(results.intents).length, 1);
        strictEqual(Object.keys(results.intents)[0], 'None');
        assert(results.entities.number);
        assert(results.entities.dimension);
        strictEqual(results.entities.boolean, undefined);
    });

    it('test email', async function () {
        const dc = getDialogContext('testEmail', 'my email address is foo@att.uk.co');
        const results = await recognizers.recognize(dc, dc.context.activity);

        strictEqual(Object.keys(results.intents).length, 1);
        strictEqual(Object.keys(results.intents)[0], 'None');
        assert(results.entities.email);
        strictEqual(results.entities.boolean, undefined);
    });

    it('test guid', async function () {
        const dc = getDialogContext('testGuid', 'my account number is 00000000-0000-0000-0000-000000000000...');
        const results = await recognizers.recognize(dc, dc.context.activity);
        strictEqual(Object.keys(results.intents).length, 1);
        strictEqual(Object.keys(results.intents)[0], 'None');
        assert(results.entities.guid);
        strictEqual(results.entities.boolean, undefined);
    });

    it('test hashtag', async function () {
        const dc = getDialogContext('testHashtag', "I'm so cool #cool #groovy...");
        const results = await recognizers.recognize(dc, dc.context.activity);

        strictEqual(Object.keys(results.intents).length, 1);
        strictEqual(Object.keys(results.intents)[0], 'None');
        assert(results.entities.hashtag);
        strictEqual(results.entities.boolean, undefined);
    });

    it('test ip', async function () {
        const dc = getDialogContext('testIp', 'My address is 1.2.3.4.');
        const results = await recognizers.recognize(dc, dc.context.activity);

        strictEqual(Object.keys(results.intents).length, 1);
        strictEqual(Object.keys(results.intents)[0], 'None');
        assert(results.entities.ip);
        assert(results.entities.number);
        strictEqual(results.entities.boolean, undefined);
    });

    it('test mention', async function () {
        const dc = getDialogContext('testMention', "Tell @joesmith I'm coming...");
        const results = await recognizers.recognize(dc, dc.context.activity);

        strictEqual(Object.keys(results.intents).length, 1);
        strictEqual(Object.keys(results.intents)[0], 'None');
        assert(results.entities.mention);
        strictEqual(results.entities.mention[0], '@joesmith');
        strictEqual(results.entities['$instance'].mention[0].text, '@joesmith');
        const startIndex = results.entities['$instance'].mention[0].startIndex;
        const endIndex = results.entities['$instance'].mention[0].endIndex;
        strictEqual(dc.context.activity.text.substr(startIndex, endIndex - startIndex), '@joesmith');
        strictEqual(results.entities.boolean, undefined);
    });

    it('test channel mention entity recognizer', async function () {
        const dc = getDialogContext('testChannelMention', 'joelee bobsm...');
        dc.context.activity.entities = [
            {
                type: 'mention',
                mentioned: {
                    id: '15',
                    name: 'Joe Lee',
                },
                text: 'joelee',
            },
            {
                type: 'mention',
                mentioned: {
                    id: '30',
                    name: 'Bob Smithson',
                },
                text: 'bobsm',
            },
        ];
        const results = await recognizers.recognize(dc, dc.context.activity);
        strictEqual(Object.keys(results.intents).length, 1);
        strictEqual(Object.keys(results.intents)[0], 'None');

        const entities = results.entities;
        const instanceData = entities['$instance'];

        // resolution[0]
        assert(entities.channelMention);
        strictEqual(entities.channelMention[0].id, '15');
        strictEqual(entities.channelMention[0].name, 'Joe Lee');

        // instanceData[0]
        strictEqual(instanceData.channelMention[0].text, 'joelee');
        let startIndex = instanceData.channelMention[0].startIndex;
        let endIndex = instanceData.channelMention[0].endIndex;
        strictEqual(dc.context.activity.text.substr(startIndex, endIndex - startIndex), 'joelee');

        // resolution[1]
        strictEqual(entities.channelMention[1].id, '30');
        strictEqual(entities.channelMention[1].name, 'Bob Smithson');

        // instanceData[1]
        strictEqual(instanceData.channelMention[1].text, 'bobsm');
        startIndex = instanceData.channelMention[1].startIndex;
        endIndex = instanceData.channelMention[1].endIndex;
        strictEqual(dc.context.activity.text.substr(startIndex, endIndex - startIndex), 'bobsm');
    });

    it('test number', async function () {
        const dc = getDialogContext('testNumber', 'This is a test of one, 2, three');
        const results = await recognizers.recognize(dc, dc.context.activity);

        strictEqual(Object.keys(results.intents).length, 1);
        strictEqual(Object.keys(results.intents)[0], 'None');
        assert(results.entities.number);
        strictEqual(results.entities.boolean, undefined);
    });

    it('test ordinal', async function () {
        const dc = getDialogContext('testOrdinal', 'First, second or third');
        const results = await recognizers.recognize(dc, dc.context.activity);

        strictEqual(Object.keys(results.intents).length, 1);
        strictEqual(Object.keys(results.intents)[0], 'None');
        assert(results.entities.ordinal);
        strictEqual(results.entities.boolean, undefined);
    });

    it('test percentage', async function () {
        const dc = getDialogContext('testPercentage', 'The population hit 33.3%');
        const results = await recognizers.recognize(dc, dc.context.activity);

        strictEqual(Object.keys(results.intents).length, 1);
        strictEqual(Object.keys(results.intents)[0], 'None');
        assert(results.entities.percentage);
        strictEqual(results.entities.boolean, undefined);
    });

    it('test phonenumber', async function () {
        const dc = getDialogContext('testPhonenumber', 'Call 425-882-8080');
        const results = await recognizers.recognize(dc, dc.context.activity);

        strictEqual(Object.keys(results.intents).length, 1);
        strictEqual(Object.keys(results.intents)[0], 'None');
        assert(results.entities.phonenumber);
        strictEqual(results.entities.boolean, undefined);
    });

    it('test temperature', async function () {
        const dc = getDialogContext('testTemperature', 'set the oven to 350 degrees');
        const results = await recognizers.recognize(dc, dc.context.activity);

        strictEqual(Object.keys(results.intents).length, 1);
        strictEqual(Object.keys(results.intents)[0], 'None');
        assert(results.entities.temperature);
        strictEqual(results.entities.boolean, undefined);
    });

    it('test url', async function () {
        const dc = getDialogContext('testUrl', 'go to http://about.me for more info');
        const results = await recognizers.recognize(dc, dc.context.activity);

        strictEqual(Object.keys(results.intents).length, 1);
        strictEqual(Object.keys(results.intents)[0], 'None');
        assert(results.entities.url);
        strictEqual(results.entities.boolean, undefined);
    });

    it('test regex', async function () {
        const dc = getDialogContext('testRegex', 'I would like a red or Blue cat');
        const results = await recognizers.recognize(dc, dc.context.activity);

        strictEqual(Object.keys(results.intents).length, 1);
        strictEqual(Object.keys(results.intents)[0], 'None');
        assert(results.entities.color);
        strictEqual(results.entities.boolean, undefined);
        strictEqual(results.entities.color.length, 2);
        strictEqual(results.entities.color[0], 'red');
        strictEqual(results.entities.color[1], 'Blue');
    });

    describe('Telemetry', () => {
        it('ChannelMentionEntityRecognizer does not log telemetry by default', async () => {
            const recognizer = new ChannelMentionEntityRecognizer();
            const spy = spyOnTelemetryClientTrackEvent(recognizer);
            const dialogContext = getDialogContext('ChannelMentionEntityRecognizer - no telemetry', 'gobble gobble');
            const logPii = getLogPersonalInformation(recognizer, dialogContext);

            const result = await recognizer.recognize(dialogContext, dialogContext.context.activity);

            strictEqual(spy.callCount, 0);
            ok(!logPii);
            ok(result);
            strictEqual(Object.entries(result.intents).length, 0);
            strictEqual(Object.entries(result.entities).length, 0);
        });

        it('EntityRecognizer does not log telemetry by default', async () => {
            const recognizer = new EntityRecognizer();
            const spy = spyOnTelemetryClientTrackEvent(recognizer);
            const dialogContext = getDialogContext('EntityRecognizer - no telemetry', 'gobble gobble');
            const logPii = getLogPersonalInformation(recognizer, dialogContext);

            const result = await recognizer.recognize(dialogContext, dialogContext.context.activity);

            strictEqual(spy.callCount, 0);
            ok(!logPii);
            ok(result);
            strictEqual(Object.entries(result.intents).length, 0);
            strictEqual(Object.entries(result.entities).length, 0);
        });
    });
});
