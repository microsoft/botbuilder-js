const assert = require('assert');
const { TestAdapter, TurnContext } = require('botbuilder-core');
const { DialogContext, DialogSet } = require('botbuilder-dialogs');
const nock = require('nock');
const { QnAMakerRecognizer } = require('../');

const hostname = 'https://dummy-hostname.azurewebsites.net';
const knowledgeBaseId = 'dummy-id';
const endpointKey = 'dummy-key';
const testDataFolder = `${ __dirname }/qna/`;

const user = {
    id: process.env['USER_ID'] || 'UK8CH2281:TKGSUQHQE'
};

const bot = {
    id: process.env['BOT_ID'] || 'BKGSYSTFG:TKGSUQHQE'
};

const createMessageActivity = (text) => {
    return {
        type: 'message',
        text: text,
        recipient: user,
        from: bot,
        locale: 'en-us'
    };
};

const validateAnswers = (result) => {
    assert.notEqual(result.answers, undefined, 'there should be answers');
    assert.equal(Object.entries(result.entities.answer).length, 1, 'if there is a match there should only be 1 top answer');
};

describe('QnAMakerRecognizer', function() {
    const recognizer = new QnAMakerRecognizer(hostname, knowledgeBaseId, endpointKey);

    it('No text no answer', async function() {
        const activity = createMessageActivity();
        const dc = new DialogContext(new DialogSet(), new TurnContext(new TestAdapter(), activity), {});
        const result = await recognizer.recognize(dc, activity);
        assert.equal(result.entities.answer, undefined);
        assert.equal(result.answers, undefined);
        assert.equal(result.intents.QnAMatch, undefined);
        assert.notEqual(result.intents.None, undefined);
    });

    it('No Answer', async function() {
        nock(hostname).post(/knowledgebases/).replyWithFile(200, testDataFolder + 'QnaMaker_ReturnsNoAnswer.json');
        const activity = createMessageActivity('test');
        const dc = new DialogContext(new DialogSet(), new TurnContext(new TestAdapter(), activity), {});
        const result = await recognizer.recognize(dc, activity);
        assert.equal(result.entities.answer, undefined);
        assert.equal(result.answers, undefined);
        assert.equal(result.intents.QnAMatch, undefined);
        assert.notEqual(result.intents.None, undefined);
    });

    it('Return Answers', async function() {
        nock(hostname).post(/knowledgebases/).replyWithFile(200, testDataFolder + 'QnaMaker_ReturnsAnswer.json');
        const activity = createMessageActivity('test');
        const dc = new DialogContext(new DialogSet(), new TurnContext(new TestAdapter(), activity), {});
        const result = await recognizer.recognize(dc, activity);
        validateAnswers(result);
        assert.equal(result.intents.None, undefined);
        assert.notEqual(result.intents.QnAMatch, undefined);
    });

    it('Top N Answers', async function() {
        nock(hostname).post(/knowledgebases/).replyWithFile(200, testDataFolder + 'QnaMaker_TopNAnswer.json');
        const activity = createMessageActivity('test');
        const dc = new DialogContext(new DialogSet(), new TurnContext(new TestAdapter(), activity), {});
        const result = await recognizer.recognize(dc, activity);
        validateAnswers(result);
        assert.equal(result.intents.None, undefined);
        assert.notEqual(result.intents.QnAMatch, undefined);
    });

    it('Return Answers with Intents', async function() {
        nock(hostname).post(/knowledgebases/).replyWithFile(200, testDataFolder + 'QnaMaker_ReturnsAnswerWithIntent.json');
        const activity = createMessageActivity('test');
        const dc = new DialogContext(new DialogSet(), new TurnContext(new TestAdapter(), activity), {});
        const result = await recognizer.recognize(dc, activity);
        validateAnswers(result);
        assert.equal(result.intents.None, undefined);
        assert.notEqual(result.intents.DeferToRecognizer_xxx, undefined);
    });
});
