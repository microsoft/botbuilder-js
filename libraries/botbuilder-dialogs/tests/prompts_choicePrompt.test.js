const { TestAdapter, TurnContext } = require('botbuilder');
const { DialogSet, ChoicePrompt, ListStyle } =  require('../');
const assert = require('assert');

const beginMessage = { text: `begin`, type: 'message' };
const answerMessage = { text: `red`, type: 'message' };
const invalidMessage = { text: `purple`, type: 'message' };

class TestContext extends TurnContext {
    constructor(request) {
        super(new TestAdapter(), request);
        this.sent = undefined;
        this.onSendActivities((context, activities, next) => {
            this.sent = activities;
            context.responded = true;
        });
    }
}

const choices = ['red', 'green', 'blue'];

describe('prompts/ChoicePrompt', function() {
    this.timeout(5000);

    it('should call ChoicePrompt using dc.prompt().', function (done) {
        const dialogs = new DialogSet();
        dialogs.add('prompt', new ChoicePrompt().choiceOptions({}).recognizerOptions({}).style(ListStyle.none));
        dialogs.add('a', [
            function (dc) {
                return dc.prompt('prompt', 'foo', choices);
            },
            function (dc, result) {
                assert(result && result.value === 'red');
                done();
            }
        ]);

        const state = {};
        const context = new TestContext(beginMessage);
        const dc = dialogs.createContext(context, state);
        dc.begin('a').then(() => {
            const dc2 = dialogs.createContext(new TestContext(answerMessage), state);
            return dc2.continue();
        });
    });
    
    it('should call ChoicePrompt with custom validator.', function (done) {
        const dialogs = new DialogSet();
        dialogs.add('prompt', new ChoicePrompt((context, value) => {
            assert(context);
            return value;
        }).style(ListStyle.none));
        dialogs.add('a', [
            function (dc) {
                return dc.prompt('prompt', 'foo', choices);
            },
            function (dc, result) {
                assert(result && result.value === 'red');
                done();
            }
        ]);

        const state = {};
        const context = new TestContext(beginMessage);
        const dc = dialogs.createContext(context, state);
        dc.begin('a').then(() => {
            const context2 = new TestContext(invalidMessage);
            const dc2 = dialogs.createContext(context2, state);
            return dc2.continue().then(() => {
                assert(context2.sent && context2.sent[0].text === 'foo');
                const dc3 = dialogs.createContext(new TestContext(answerMessage), state);
                return dc3.continue();
            });
        });
    });

    it('should send custom retryPrompt.', function (done) {
        const dialogs = new DialogSet();
        dialogs.add('prompt', new ChoicePrompt((context, value) => {
            assert(context);
            return value;
        }).style(ListStyle.none));
        dialogs.add('a', [
            function (dc) {
                return dc.prompt('prompt', 'foo', { retryPrompt: 'bar', choices: choices });
            },
            function (dc, result) {
                assert(result && result.value === 'red');
                done();
            }
        ]);

        const state = {};
        const context = new TestContext(beginMessage);
        const dc = dialogs.createContext(context, state);
        dc.begin('a').then(() => {
            const context2 = new TestContext(invalidMessage);
            const dc2 = dialogs.createContext(context2, state);
            return dc2.continue().then(() => {
                assert(context2.sent && context2.sent[0].text === 'bar');
                const dc3 = dialogs.createContext(new TestContext(answerMessage), state);
                return dc3.continue();
            });
        });
    });

    it('should send ignore retryPrompt if validator replies.', function (done) {
        const dialogs = new DialogSet();
        dialogs.add('prompt', new ChoicePrompt((context, value) => {
            assert(context);
            if (value === undefined) {
                return context.sendActivity(`bad input`).then(() => undefined);
            }
            return value;
        }));
        dialogs.add('a', [
            function (dc) {
                return dc.prompt('prompt', 'foo', { retryPrompt: 'bar', choices: choices });
            },
            function (dc, result) {
                assert(result && result.value === 'red');
                done();
            }
        ]);

        const state = {};
        const context = new TestContext(beginMessage);
        const dc = dialogs.createContext(context, state);
        dc.begin('a').then(() => {
            const context2 = new TestContext(invalidMessage);
            const dc2 = dialogs.createContext(context2, state);
            return dc2.continue().then(() => {
                assert(context2.sent && context2.sent[0].text === 'bad input');
                const dc3 = dialogs.createContext(new TestContext(answerMessage), state);
                return dc3.continue();
            });
        });
    });
});
