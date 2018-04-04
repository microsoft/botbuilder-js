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

describe('DialogSet', function() {
    this.timeout(5000);

    it('should call Dialog.begin() and Dialog.continue().', function (done) {
        const dialogs = new DialogSet();
        dialogs.add('a', {
            dialogBegin: (dc, args) => {
                assert(dc, 'Missing dialog context in begin()');
                assert(args === 'z', 'Args not passed');
                return dc.context.sendActivity(beginMessage);
            },
            dialogContinue: (dc) => {
                assert(dc, 'Missing dialog context in continue()');
                return dc.context.sendActivity(continueMessage);
            }
        });

        const state = {};
        const context = new TestContext(beginMessage);
        const dc = dialogs.createContext(context, state);
        dc.continue().then(() => {
            if (!context.responded) {
                return dc.begin('a', 'z');
            }
        }).then(() => {
            assert(context.responded, `no reply sent`);
            assert(Array.isArray(state.dialogStack), `no dialog stack persisted.`);
            assert(state.dialogStack.length === 1, `invalid number of entries on stack.`)
            done();
        });
    });

    it('should throw an exception when trying to add the same dialog twice.', function (done) {
        const dialogs = new DialogSet();
        dialogs.add('a', [
            function (dc) { }
        ]);

        try {
            dialogs.add('a', [
                function (dc) { }
            ]);
        } catch(err) {
            done();
        }
    });

    it('should find() a dialog that was added.', function (done) {
        const dialogs = new DialogSet();
        dialogs.add('a', [
            function (dc) { }
        ]);

        assert(dialogs.find('a'), `dialog not found.`);
        assert(!dialogs.find('b'), `dialog found that shouldn't exist.`);
        done();
    });

    it('should add a waterfall to the dialog set.', function (done) {
        const dialogs = new DialogSet();
        dialogs.add('a', [
            function (dc) {
                assert(dc);
                done();
            }
        ]);

        const state = {};
        const context = new TestContext(beginMessage);
        const dc = dialogs.createContext(context, state);
        dc.begin('a');
    });

    it('should save dialog stack state between turns.', function (done) {
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
});
