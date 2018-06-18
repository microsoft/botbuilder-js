const { TestAdapter, TurnContext } = require('botbuilder');
const { DialogSet, TextPrompt } =  require('../');
const assert = require('assert');

const beginMessage = { text: `begin`, type: 'message' };
const continueMessage = { text: `continue`, type: 'message' };
const shortMessage = { text: `a`, type: 'message' };
const longMessage = { text: `abcdefg`, type: 'message' };

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

describe('prompts/TextPrompt', function() {
    this.timeout(5000);

    it('should call TextPrompt using dc.prompt().', function (done) {
        const dialogs = new DialogSet();
        dialogs.add('prompt', new TextPrompt());
        dialogs.add('a', [
            function (dc) {
                return dc.prompt('prompt', 'foo');
            },
            function (dc, result) {
                assert(result === 'continue');
                done();
            }
        ]);

        const state = {};
        const context = new TestContext(beginMessage);
        const dc = dialogs.createContext(context, state);
        dc.begin('a').then(() => {
            const dc2 = dialogs.createContext(new TestContext(continueMessage), state);
            return dc2.continue();
        });
    });
    
    it('should call TextPrompt with custom validator.', function (done) {
        const dialogs = new DialogSet();
        dialogs.add('prompt', new TextPrompt((context, value) => {
            assert(context);
            return value.length >= 3 ? value : undefined;
        }));
        dialogs.add('a', [
            function (dc) {
                return dc.prompt('prompt', 'foo');
            },
            function (dc, result) {
                assert(result === 'abcdefg');
                done();
            }
        ]);

        const state = {};
        const context = new TestContext(beginMessage);
        const dc = dialogs.createContext(context, state);
        dc.begin('a').then(() => {
            const context2 = new TestContext(shortMessage);
            const dc2 = dialogs.createContext(context2, state);
            return dc2.continue().then(() => {
                assert(context2.sent && context2.sent[0].text === 'foo');
                const dc3 = dialogs.createContext(new TestContext(longMessage), state);
                return dc3.continue();
            });
        });
    });

    it('should send custom retryPrompt.', function (done) {
        const dialogs = new DialogSet();
        dialogs.add('prompt', new TextPrompt((context, value) => {
            assert(context);
            return value.length >= 3 ? value : undefined;
        }));
        dialogs.add('a', [
            function (dc) {
                return dc.prompt('prompt', 'foo', { retryPrompt: 'bar' });
            },
            function (dc, result) {
                assert(result === 'abcdefg');
                done();
            }
        ]);

        const state = {};
        const context = new TestContext(beginMessage);
        const dc = dialogs.createContext(context, state);
        dc.begin('a').then(() => {
            const context2 = new TestContext(shortMessage);
            const dc2 = dialogs.createContext(context2, state);
            return dc2.continue().then(() => {
                assert(context2.sent && context2.sent[0].text === 'bar');
                const dc3 = dialogs.createContext(new TestContext(longMessage), state);
                return dc3.continue();
            });
        });
    });

    it('should send ignore retryPrompt if validator replies.', function (done) {
        const dialogs = new DialogSet();
        dialogs.add('prompt', new TextPrompt((context, value) => {
            assert(context);
            if (value.length < 3) {
                return context.sendActivity(`too short`).then(() => undefined);
            }
            return value;
        }));
        dialogs.add('a', [
            function (dc) {
                return dc.prompt('prompt', 'foo', { retryPrompt: 'bar' });
            },
            function (dc, result) {
                assert(result === 'abcdefg');
                done();
            }
        ]);

        const state = {};
        const context = new TestContext(beginMessage);
        const dc = dialogs.createContext(context, state);
        dc.begin('a').then(() => {
            const context2 = new TestContext(shortMessage);
            const dc2 = dialogs.createContext(context2, state);
            return dc2.continue().then(() => {
                assert(context2.sent && context2.sent[0].text === 'too short');
                const dc3 = dialogs.createContext(new TestContext(longMessage), state);
                return dc3.continue();
            });
        });
    });

    it('should not send any retryPrompt no prompt specified.', function (done) {
        const dialogs = new DialogSet();
        dialogs.add('prompt', new TextPrompt((context, value) => {
            assert(context);
            return value.length >= 3 ? value : undefined;
        }));
        dialogs.add('a', [
            function (dc) {
                return dc.begin('prompt');
            },
            function (dc, result) {
                assert(result === 'abcdefg');
                done();
            }
        ]);

        const state = {};
        const context = new TestContext(beginMessage);
        const dc = dialogs.createContext(context, state);
        dc.begin('a').then(() => {
            const context2 = new TestContext(shortMessage);
            const dc2 = dialogs.createContext(context2, state);
            return dc2.continue().then(() => {
                assert(!context2.sent);
                const dc3 = dialogs.createContext(new TestContext(longMessage), state);
                return dc3.continue();
            });
        });
    });
});
