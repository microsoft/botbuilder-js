const assert = require('assert');
const { TurnContext, TestAdapter } = require('botbuilder');
const { createConfirmPrompt, ListStyle } = require('../lib');

class TestContext extends TurnContext {
    constructor(request) {
        super(new TestAdapter(), request);
        this.sent = undefined;
        this.onSendActivities((context, activities, next) => {
            this.sent = activities;
        });
    }
}

describe('ConfirmPrompt', function() {
    this.timeout(5000);

    it('should create prompt.', function (done) {
        const prompt = createConfirmPrompt();
        assert(prompt, `Prompt not created.`);
        assert(prompt.prompt, `Prompt.prompt() not value.`);
        assert(prompt.recognize, `Prompt.recognize() not value.`);
        done();
    });

    it('should send prompt().', function (done) {
        const context = new TestContext({ text: 'test', type: 'message' });
        const prompt = createConfirmPrompt();
        prompt.prompt(context, `yes or no?`).then(() => {
            assert(Array.isArray(context.sent) && context.sent.length > 0, `prompt not sent.`);
            assert(context.sent[0].text.startsWith(`yes or no?`), `invalid prompt sent.`);
            done();
        });
    });

    it('should send prompt() as an inline list.', function (done) {
        const context = new TestContext({ text: 'test', type: 'message' });
        const prompt = createConfirmPrompt();
        prompt.style = ListStyle.inline;
        prompt.prompt(context, `yes or no?`).then(() => {
            assert(Array.isArray(context.sent) && context.sent.length > 0, `prompt not sent.`);
            assert(context.sent[0].text.startsWith(`yes or no?`), `invalid prompt sent.`);
            done();
        });
    });

    it('should send prompt() as a numbered list.', function (done) {
        const context = new TestContext({ text: 'test', type: 'message' });
        const prompt = createConfirmPrompt();
        prompt.style = ListStyle.list;
        prompt.prompt(context, `yes or no?`).then(() => {
            assert(Array.isArray(context.sent) && context.sent.length > 0, `prompt not sent.`);
            assert(context.sent[0].text.startsWith(`yes or no?`), `invalid prompt sent.`);
            done();
        });
    });

    it('should send prompt() using suggested actions.', function (done) {
        const context = new TestContext({ text: 'test', type: 'message' });
        const prompt = createConfirmPrompt();
        prompt.style = ListStyle.suggestedAction;
        prompt.prompt(context, `yes or no?`).then(() => {
            assert(Array.isArray(context.sent) && context.sent.length > 0, `prompt not sent.`);
            assert(context.sent[0].text.startsWith(`yes or no?`), `invalid prompt sent.`);
            assert(context.sent[0].suggestedActions, `missing suggested actions.`);
            done();
        });
    });

    it('should send prompt() without adding a list.', function (done) {
        const context = new TestContext({ text: 'test', type: 'message' });
        const prompt = createConfirmPrompt();
        prompt.style = ListStyle.none;
        prompt.prompt(context, `yes or no?`).then(() => {
            assert(Array.isArray(context.sent) && context.sent.length > 0, `prompt not sent.`);
            assert(context.sent[0].text === `yes or no?`, `invalid prompt sent.`);
            done();
        });
    });

    it('should send prompt() without adding a list but adding ssml.', function (done) {
        const context = new TestContext({ text: 'test', type: 'message' });
        const prompt = createConfirmPrompt();
        prompt.style = ListStyle.none;
        prompt.prompt(context, `yes or no?`, `spoken prompt`).then(() => {
            assert(Array.isArray(context.sent) && context.sent.length > 0, `prompt not sent.`);
            assert(context.sent[0].text === `yes or no?`, `invalid prompt text sent.`);
            assert(context.sent[0].speak === `spoken prompt`, `invalid prompt speak sent.`);
            done();
        });
    });
    
    it('should send activity based prompt().', function (done) {
        const context = new TestContext({ text: 'test', type: 'message' });
        const prompt = createConfirmPrompt();
        prompt.prompt(context, { text: 'foo', type: 'message' }).then(() => {
            assert(Array.isArray(context.sent) && context.sent.length > 0, `prompt not sent.`);
            assert(context.sent[0].text === 'foo', `invalid prompt text sent.`);
            done();
        });
    });
    
    it('should send activity based prompt() with ssml.', function (done) {
        const context = new TestContext({ text: 'test', type: 'message' });
        const prompt = createConfirmPrompt();
        prompt.prompt(context, { text: 'foo', type: 'message' }, 'spoken foo').then(() => {
            assert(Array.isArray(context.sent) && context.sent.length > 0, `prompt not sent.`);
            assert(context.sent[0].text === 'foo', `invalid prompt text sent.`);
            assert(context.sent[0].speak === 'spoken foo', `invalid prompt text sent.`);
            done();
        });
    });
    
    it('should recognize() a true choice.', function (done) {
        const context = new TestContext({ text: `Why yes I can do that.`, type: 'message' });
        const prompt = createConfirmPrompt();
        prompt.recognize(context).then((value) => {
            assert(typeof value === 'boolean', `reply not recognized.`);
            assert(value, `invalid value.`);
            done();
        });
    });

    it('should recognize() a false choice.', function (done) {
        const context = new TestContext({ text: `No I can not.`, type: 'message' });
        const prompt = createConfirmPrompt();
        prompt.recognize(context).then((value) => {
            assert(typeof value === 'boolean', `reply not recognized.`);
            assert(!value, `invalid value.`);
            done();
        });
    });
    
    it('should NOT recognize() other text.', function (done) {
        const context = new TestContext({ text: `what was that?`, type: 'message' });
        const prompt = createConfirmPrompt();
        prompt.recognize(context).then((value) => {
            assert(value === undefined, `invalid value.`);
            done();
        });
    });
    
    it('should call custom validator.', function (done) {
        let called = false;
        const context = new TestContext({ text: `yes.`, type: 'message' });
        const prompt = createConfirmPrompt((context, value) => {
            assert(typeof value === 'boolean', `reply not recognized.`);
            called = true;
            return undefined;
        });
        prompt.recognize(context).then((value) => {
            assert(called, `custom validator not called.`);
            assert(value === undefined, `invalid value returned.`);
            done();
        });
    });

    it('should handle an undefined request.', function (done) {
        let called = false;
        const context = new TestContext(undefined);
        const prompt = createConfirmPrompt((context, value) => {
            assert(value === undefined, `value shouldn't have been recognized.`);
            called = true;
            return undefined;
        });
        prompt.recognize(context).then((value) => {
            assert(called, `custom validator not called.`);
            assert(value === undefined, `invalid value returned.`);
            done();
        });
    });

    it('should send prompt() with suggested actions for a specific locale.', function (done) {
        const context = new TestContext({ locale: 'es', text: 'test', type: 'message' });
        const prompt = createConfirmPrompt();
        prompt.style = ListStyle.suggestedAction;
        prompt.choices['es'] = ['sí', 'no'];
        prompt.prompt(context, `please confirm:`).then(() => {
            assert(Array.isArray(context.sent) && context.sent.length > 0, `prompt not sent.`);
            assert(context.sent[0].text.startsWith(`please confirm:`), `invalid prompt sent.`);
            assert(context.sent[0].suggestedActions, `missing suggested actions.`);
            assert(context.sent[0].suggestedActions.actions[0].title === 'sí', `invalid suggested actions.`);
            done();
        });
    });

    it('should send prompt() with defailt suggested actions if locale not supported.', function (done) {
        const context = new TestContext({ locale: 'fr', text: 'test', type: 'message' });
        const prompt = createConfirmPrompt();
        prompt.style = ListStyle.suggestedAction;
        prompt.choices['es'] = ['sí', 'no'];
        prompt.prompt(context, `please confirm:`).then(() => {
            assert(Array.isArray(context.sent) && context.sent.length > 0, `prompt not sent.`);
            assert(context.sent[0].text.startsWith(`please confirm:`), `invalid prompt sent.`);
            assert(context.sent[0].suggestedActions, `missing suggested actions.`);
            assert(context.sent[0].suggestedActions.actions[0].title === 'yes', `invalid suggested actions.`);
            done();
        });
    });
});
