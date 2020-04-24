import { Templates } from 'botbuilder-lg';
import { ActivityFactory } from 'botbuilder-core';

let data = {
    type: 'imBack',
    title: 'taptitle',
    value: 'tapvalue'
};

const filePath =  `${ __dirname }/../tests/lg/NormalStructuredLG.lg`;
const templates = Templates.parseFile(filePath);

const lgResult = templates.evaluate('externalHeroCardActivity', data);
const result = ActivityFactory.fromObject(lgResult);
console.log(JSON.stringify(result));


/*

assert.strictEqual(activity.attachments.length, 1);
assert.strictEqual(activity.attachments[0].contentType, 'application/vnd.microsoft.card.hero');
const card = activity.attachments[0].content;

const tap = card.tap;
assert.strictEqual(tap.title, 'taptitle');
assert.strictEqual(tap.value, 'tapvalue');
assert.strictEqual(tap.type, 'imBack');

assert.strictEqual(card.title, 'titleContent');
assert.strictEqual(card.text, 'textContent');
assert.strictEqual(card.buttons.length, 1, 'should have one button');
const button = card.buttons[0];
assert.strictEqual(button.type, 'imBack');
assert.strictEqual(button.title, 'titleContent');
assert.strictEqual(button.value, 'textContent');

*/