const { TestAdapter, TurnContext } = require('botbuilder-core');
const { DialogSet, Waterfall } =  require('../');
const assert = require('assert');

const beginMessage = { text: `begin`, type: 'message' };

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


describe.skip('Waterfall', function() {
    this.timeout(5000);

    it('should execute a sequence of waterfall steps.', async function () {
        let done = false;
        const dialogs = new DialogSet();
        dialogs.add('a', new Waterfall([
            async function (dc) {
                assert(dc);
                await dc.context.sendActivity(`foo`);
            },
            async function (dc) {
                assert(dc);
                done = true;
            }
        ]));

        const state = {};
        const context = new TestContext(beginMessage);
        const dc = await dialogs.createContext(context, state);
        await dc.begin('a');
        const dc2 = await dialogs.createContext(context, state);
        await dc2.continue();
        assert(done);
    });

    it('should support calling next() to move to next steps.', async function () {
        let calledNext = false;
        const dialogs = new DialogSet();
        dialogs.add('a', new Waterfall([
            async function (dc, args, next) {
                assert(dc);
                assert(args === 'z');
                return await next(args);
            },
            async function (dc, args) {
                assert(dc);
                assert(args === 'z');
                calledNext = true;
                return await dc.end();
            }
        ]));

        const state = {};
        const context = new TestContext(beginMessage);
        const dc = await dialogs.createContext(context, state);
        await dc.begin('a', 'z');
        assert(calledNext);
    });
});
