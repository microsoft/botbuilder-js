const assert = require('assert');
const { TurnContext, TestAdapter } = require('botbuilder');
const { createChoicePrompt, ListStyle } = require('../lib');

class TestContext extends TurnContext {
    constructor(request) {
        super(new TestAdapter(), request);
        this.sent = undefined;
        this.onSendActivities((context, activities, next) => {
            this.sent = activities;
        });
    }
}

const colorChoices = ['red', 'green', 'blue'];

describe('ChoicePrompt', function() {
    this.timeout(5000);

    it('should create prompt.', function (done) {
        const prompt = createChoicePrompt();
        assert(prompt, `Prompt not created.`);
        assert(prompt.prompt, `Prompt.prompt() not found.`);
        assert(prompt.recognize, `Prompt.recognize() not found.`);
        done();
    });

    it('should send prompt().', function (done) {
        const context = new TestContext({ text: 'test', type: 'message' });
        const prompt = createChoicePrompt();
        prompt.prompt(context, colorChoices, `favorite color?`).then(() => {
            assert(Array.isArray(context.sent) && context.sent.length > 0, `prompt not sent.`);
            assert(context.sent[0].text.startsWith(`favorite color?`), `invalid prompt sent.`);
            done();
        });
    });

    it('should send prompt() as an inline list.', function (done) {
        const context = new TestContext({ text: 'test', type: 'message' });
        const prompt = createChoicePrompt();
        prompt.style = ListStyle.inline;
        prompt.prompt(context, colorChoices, `favorite color?`).then(() => {
            assert(Array.isArray(context.sent) && context.sent.length > 0, `prompt not sent.`);
            assert(context.sent[0].text.startsWith(`favorite color?`), `invalid prompt sent.`);
            done();
        });
    });

    it('should send prompt() as a numbered list.', function (done) {
        const context = new TestContext({ text: 'test', type: 'message' });
        const prompt = createChoicePrompt();
        prompt.style = ListStyle.list;
        prompt.prompt(context, colorChoices, `favorite color?`).then(() => {
            assert(Array.isArray(context.sent) && context.sent.length > 0, `prompt not sent.`);
            assert(context.sent[0].text.startsWith(`favorite color?`), `invalid prompt sent.`);
            done();
        });
    });

    it('should send prompt() using suggested actions.', function (done) {
        const context = new TestContext({ text: 'test', type: 'message' });
        const prompt = createChoicePrompt();
        prompt.style = ListStyle.suggestedAction;
        prompt.prompt(context, colorChoices, `favorite color?`).then(() => {
            assert(Array.isArray(context.sent) && context.sent.length > 0, `prompt not sent.`);
            assert(context.sent[0].text.startsWith(`favorite color?`), `invalid prompt sent.`);
            assert(context.sent[0].suggestedActions, `missing suggested actions.`);
            done();
        });
    });

    it('should send prompt() without adding a list.', function (done) {
        const context = new TestContext({ text: 'test', type: 'message' });
        const prompt = createChoicePrompt();
        prompt.style = ListStyle.none;
        prompt.prompt(context, colorChoices, `favorite color?`).then(() => {
            assert(Array.isArray(context.sent) && context.sent.length > 0, `prompt not sent.`);
            assert(context.sent[0].text === `favorite color?`, `invalid prompt sent.`);
            done();
        });
    });

    it('should send prompt() without adding a list but adding ssml.', function (done) {
        const context = new TestContext({ text: 'test', type: 'message' });
        const prompt = createChoicePrompt();
        prompt.style = ListStyle.none;
        prompt.prompt(context, colorChoices, `favorite color?`, `spoken prompt`).then(() => {
            assert(Array.isArray(context.sent) && context.sent.length > 0, `prompt not sent.`);
            assert(context.sent[0].text === `favorite color?`, `invalid prompt text sent.`);
            assert(context.sent[0].speak === `spoken prompt`, `invalid prompt speak sent.`);
            done();
        });
    });
    
    it('should send activity based prompt().', function (done) {
        const context = new TestContext({ text: 'test', type: 'message' });
        const prompt = createChoicePrompt();
        prompt.prompt(context, colorChoices, { text: 'foo', type: 'message' }).then(() => {
            assert(Array.isArray(context.sent) && context.sent.length > 0, `prompt not sent.`);
            assert(context.sent[0].text === 'foo', `invalid prompt text sent.`);
            done();
        });
    });
    
    it('should send activity based prompt() with ssml.', function (done) {
        const context = new TestContext({ text: 'test', type: 'message' });
        const prompt = createChoicePrompt();
        prompt.prompt(context, colorChoices, { text: 'foo', type: 'message' }, 'spoken foo').then(() => {
            assert(Array.isArray(context.sent) && context.sent.length > 0, `prompt not sent.`);
            assert(context.sent[0].text === 'foo', `invalid prompt text sent.`);
            assert(context.sent[0].speak === 'spoken foo', `invalid prompt text sent.`);
            done();
        });
    });
    
    it('should recognize() a choice.', function (done) {
        const context = new TestContext({ text: `I'll take red please.`, type: 'message' });
        const prompt = createChoicePrompt();
        prompt.recognize(context, colorChoices).then((found) => {
            assert(typeof found === 'object', `reply not recognized.`);
            assert(found.value === 'red', `invalid value.`);
            done();
        });
    });

    it('should NOT recognize() other text.', function (done) {
        const context = new TestContext({ text: `what was that?`, type: 'message' });
        const prompt = createChoicePrompt();
        prompt.recognize(context, colorChoices).then((found) => {
            assert(found === undefined, `invalid value.`);
            done();
        });
    });
    
    it('should call custom validator.', function (done) {
        let called = false;
        const context = new TestContext({ text: `I'll take red please.`, type: 'message' });
        const prompt = createChoicePrompt((context, found) => {
            assert(typeof found === 'object', `reply not recognized.`);
            called = true;
            return undefined;
        });
        prompt.recognize(context, colorChoices).then((found) => {
            assert(called, `custom validator not called.`);
            assert(found === undefined, `invalid value returned.`);
            done();
        });
    });

    it('should handle an undefined request.', function (done) {
        let called = false;
        const context = new TestContext(undefined);
        const prompt = createChoicePrompt((context, found) => {
            assert(found === undefined, `value shouldn't have been recognized.`);
            called = true;
            return undefined;
        });
        prompt.recognize(context).then((found) => {
            assert(called, `custom validator not called.`);
            assert(found === undefined, `invalid value returned.`);
            done();
        });
    });
});
