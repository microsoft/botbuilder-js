const assert = require('assert');
const { TurnContext, TestAdapter } = require('botbuilder');
const { createTextPrompt } = require('../lib');

class TestContext extends TurnContext {
    constructor(request) {
        super(new TestAdapter(), request);
        this.sent = undefined;
        this.onSendActivities((context, activities, next) => {
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

    it('should send text prompt().', function (done) {
        const context = new TestContext({ text: 'test', type: 'message' });
        const prompt = createTextPrompt();
        prompt.prompt(context, `test text`, `test ssml`).then(() => {
            assert(Array.isArray(context.sent) && context.sent.length > 0, `prompt not sent.`);
            assert(context.sent[0].text === 'test text', `invalid prompt text sent.`);
            assert(context.sent[0].speak === 'test ssml', `invalid prompt speak sent.`);
            done();
        });
    });

    it('should send activity based prompt().', function (done) {
        const context = new TestContext({ text: 'test', type: 'message' });
        const prompt = createTextPrompt();
        prompt.prompt(context, { text: 'foo', type: 'message' }).then(() => {
            assert(Array.isArray(context.sent) && context.sent.length > 0, `prompt not sent.`);
            assert(context.sent[0].text === 'foo', `invalid prompt text sent.`);
            done();
        });
    });
    
    it('should recognize() any text.', function (done) {
        const context = new TestContext({ text: 'test', type: 'message' });
        const prompt = createTextPrompt();
        prompt.recognize(context).then((value) => {
            assert(typeof value === 'string', `prompt not recognized.`);
            assert(value === 'test', `invalid value.`);
            done();
        });
    });

    it('should call custom validator.', function (done) {
        let called = false;
        const context = new TestContext({ text: 'test', type: 'message' });
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

    it('should handle an undefined request.', function (done) {
        let called = false;
        const context = new TestContext(undefined);
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
