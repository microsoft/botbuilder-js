const assert = require('assert');
const { TurnContext, TestAdapter } = require('botbuilder');
const { createDatetimePrompt } = require('../lib');

class TestContext extends TurnContext {
    constructor(request) {
        super(new TestAdapter(), request);
        this.sent = undefined;
        this.onSendActivities((context, activities, next) => {
            this.sent = activities;
        });
    }
}

describe('DatetimePrompt', function() {
    this.timeout(5000);

    it('should create prompt.', function (done) {
        const prompt = createDatetimePrompt();
        assert(prompt, `Prompt not created.`);
        assert(prompt.prompt, `Prompt.prompt() not found.`);
        assert(prompt.recognize, `Prompt.recognize() not found.`);
        done();
    });

    it('should send prompt().', function (done) {
        const context = new TestContext({ text: 'test', type: 'message' });
        const prompt = createDatetimePrompt();
        prompt.prompt(context, `test prompt`).then(() => {
            assert(Array.isArray(context.sent) && context.sent.length > 0, `prompt not sent.`);
            assert(context.sent[0].text === 'test prompt', `invalid prompt sent.`);
            done();
        });
    });

    it('should recognize() a datetime.', function (done) {
        const context = new TestContext({ text: `tomorrow at 9am`, type: 'message' });
        const prompt = createDatetimePrompt();
        prompt.recognize(context).then((values) => {
            assert(Array.isArray(values), `values not an array.`);
            assert(values.length === 1, `reply not recognized.`);
            done();
        });
    });

    it('should NOT recognize() other text.', function (done) {
        const context = new TestContext({ text: `what was that?`, type: 'message' });
        const prompt = createDatetimePrompt();
        prompt.recognize(context).then((values) => {
            assert(values === undefined, `shouldn't have recognized.`);
            done();
        });
    });
    
    it('should call custom validator.', function (done) {
        let called = false;
        const context = new TestContext({ text: `how about tomorrow at 9am?`, type: 'message' });
        const prompt = createDatetimePrompt((context, values) => {
            assert(Array.isArray(values), `values not an array.`);
            assert(values.length === 1, `reply not recognized.`);
            called = true;
            return undefined;
        });
        prompt.recognize(context).then((values) => {
            assert(called, `custom validator not called.`);
            assert(values === undefined, `invalid values returned.`);
            done();
        });
    });

    it('should handle an undefined request.', function (done) {
        let called = false;
        const context = new TestContext(undefined);
        const prompt = createDatetimePrompt((context, values) => {
            assert(values === undefined, `value shouldn't have been recognized.`);
            called = true;
            return undefined;
        });
        prompt.recognize(context).then((values) => {
            assert(called, `custom validator not called.`);
            assert(values === undefined, `invalid values returned.`);
            done();
        });
    });
});
