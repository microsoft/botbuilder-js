const { TestAdapter, TurnContext } = require('botbuilder');
const { DialogSet } =  require('../');
const assert = require('assert');

const beginMessage = { text: `begin`, type: 'message' };
const continueMessage = { text: `continue`, type: 'message' };

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

describe('Waterfall', function() {
    this.timeout(5000);

    it('should execute a sequence of waterfall steps.', function (done) {
        const dialogs = new DialogSet();
        dialogs.add('a', [
            function (dc) {
                assert(dc);
                return dc.context.sendActivity(`foo`);
            },
            function (dc) {
                assert(dc);
                done();
            }
        ]);

        const state = {};
        const context = new TestContext(beginMessage);
        const dc = dialogs.createContext(context, state);
        dc.begin('a').then(() => {
            const dc2 = dialogs.createContext(context, state);
            return dc2.continue();
        });
    });

    it('should support calling next() to move to next steps.', function (done) {
        const dialogs = new DialogSet();
        dialogs.add('a', [
            function (dc, args, next) {
                assert(dc);
                assert(args === 'z');
                return next(args);
            },
            function (dc, args) {
                assert(dc);
                assert(args === 'z');
                return dc.end(args);
            }
        ]);

        const state = {};
        const context = new TestContext(beginMessage);
        const dc = dialogs.createContext(context, state);
        dc.begin('a', 'z').then((result) => {
            assert(result && !result.active);
            assert(result.result === 'z');
            done();
        });
    });
});
