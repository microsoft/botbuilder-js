const assert = require('assert');
const { BotContext, TestAdapter } = require('botbuilder');
const { createTextPrompt } = require('../lib');

class TestContext extends BotContext {
    constructor(request) {
        super(new TestAdapter(), request || { text: 'test', type: 'message' });
        this.sent = undefined;
        this.onSendActivity((context, activities, next) => {
            this.sent = activities;
        });
    }
}

describe('TextPrompt', function() {
    this.timeout(5000);

    it('should create prompt.', function (done) {
        const prompt = createTextPrompt();
        assert(prompt, `Prompt not created.`);
        assert(prompt.prompt, `Prompt.prompt() not found.`);
        assert(prompt.recognize, `Prompt.recognize() not found.`);
        done();
    });

    it('should send prompt().', function (done) {
        const context = new TestContext();
        const prompt = createTextPrompt();
        prompt.prompt(context, `test prompt`).then(() => {
            assert(Array.isArray(context.sent) && context.sent.length > 0, `prompt not sent.`);
            assert(context.sent[0].text === 'test prompt', `invalid prompt sent.`);
            done();
        });
    });

    it('should recognize() any text.', function (done) {
        const context = new TestContext();
        const prompt = createTextPrompt();
        prompt.recognize(context).then((value) => {
            assert(typeof value === 'string', `prompt not recognized.`);
            assert(value === 'test', `invalid value.`);
            done();
        });
    });

    it('should call custom validator.', function (done) {
        let called = false;
        const context = new TestContext();
        const prompt = createTextPrompt((context, value) => {
            assert(typeof value === 'string', `prompt not recognized.`);
            called = true;
            return undefined;
        });
        prompt.recognize(context).then((value) => {
            assert(called, `custom validator not called.`);
            assert(value === undefined, `invalid value returned.`);
            done();
        });
    });

    it('should default request.text to an empty string.', function (done) {
        let called = false;
        const context = new TestContext({ text: undefined });
        const prompt = createTextPrompt((context, value) => {
            assert(typeof value === 'string', `prompt not recognized.`);
            called = true;
            return undefined;
        });
        prompt.recognize(context).then((value) => {
            assert(called, `custom validator not called.`);
            assert(value === undefined, `invalid value returned.`);
            done();
        });
    });
});
