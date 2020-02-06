/* eslint-disable @typescript-eslint/no-var-requires */
const assert = require('assert');
const { TestAdapter, TurnContext } = require('botbuilder-core');
const { DialogContext, DialogSet } = require('botbuilder-dialogs');
const { RegexRecognizer, IntentPattern, EntityRecognizerSet, RegexEntityRecognizer } = require('../');

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
        new RegexEntityRecognizer('color', '(red|green|blue|purple|orange|violet|white|black)'),
        new RegexEntityRecognizer('backgroundColor', '(back|background) {color}'),
        new RegexEntityRecognizer('foregroundColor', '(foreground|front) {color}')
    );

    it('dialog context', async function() {
        let dc = createContext('intent a1 b2');
        let result = await recognizer.recognize(dc);
        validateCodeIntent(result);

        dc = createContext('I would like color red and orange');
        result = await recognizer.recognize(dc);
        validateColorIntent(result);
    });

    it('custom activity', async function() {
        const dc = createContext('');
        const activity = createMessageActivity('intent a1 b2');
        let result = await recognizer.recognize(dc, activity);
        validateCodeIntent(result);

        activity.text = 'I would like color red and orange';
        result = await recognizer.recognize(dc, activity);
        validateColorIntent(result);
    });

    it('text and locale', async function() {
        const dc = createContext('');
        let result = await recognizer.recognize(dc, 'intent a1 b2', 'en-us');
        validateCodeIntent(result);

        result = await recognizer.recognize(dc, 'I would like color red and orange');
        validateColorIntent(result);
    });
});
