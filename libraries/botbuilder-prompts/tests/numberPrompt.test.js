const assert = require('assert');
const { TurnContext, TestAdapter } = require('botbuilder');
const { createNumberPrompt } = require('../lib');

class TestContext extends TurnContext {
    constructor(request) {
        super(new TestAdapter(), request);
        this.sent = undefined;
        this.onSendActivities((context, activities, next) => {
            this.sent = activities;
        });
    }
}

describe('NumberPrompt', function() {
    this.timeout(5000);

    it('should create prompt.', function (done) {
        const prompt = createNumberPrompt();
        assert(prompt, `Prompt not created.`);
        assert(prompt.prompt, `Prompt.prompt() not found.`);
        assert(prompt.recognize, `Prompt.recognize() not found.`);
        done();
    });

    it('should send prompt().', function (done) {
        const context = new TestContext({ text: 'test', type: 'message' });
        const prompt = createNumberPrompt();
        prompt.prompt(context, `test prompt`).then(() => {
            assert(Array.isArray(context.sent) && context.sent.length > 0, `prompt not sent.`);
            assert(context.sent[0].text === 'test prompt', `invalid prompt sent.`);
            done();
        });
    });

    it('should recognize() a number.', function (done) {
        const context = new TestContext({ text: `123.7`, type: 'message' });
        const prompt = createNumberPrompt();
        prompt.recognize(context).then((value) => {
            assert(typeof value === 'number', `reply not recognized.`);
            assert(value === 123.7, `invalid value.`);
            done();
        });
    });

    it('should recognize() a number expressed using words.', function (done) {
        const context = new TestContext({ text: `I'd like two hundred please`, type: 'message' });
        const prompt = createNumberPrompt();
        prompt.recognize(context).then((value) => {
            assert(typeof value === 'number', `reply not recognized.`);
            assert(value === 200, `invalid value.`);
            done();
        });
    });

    it('should NOT recognize() other text.', function (done) {
        const context = new TestContext({ text: `what was that?`, type: 'message' });
        const prompt = createNumberPrompt();
        prompt.recognize(context).then((value) => {
            assert(value === undefined, `invalid value.`);
            done();
        });
    });
    
    it('should call custom validator.', function (done) {
        let called = false;
        const context = new TestContext({ text: `I'd like two hundred please`, type: 'message' });
        const prompt = createNumberPrompt((context, value) => {
            assert(typeof value === 'number', `reply not recognized.`);
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
        const prompt = createNumberPrompt((context, value) => {
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
});
