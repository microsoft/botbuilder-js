const { TestAdapter, TurnContext } = require('botbuilder');
const { DialogSet, Dialog } =  require('../');
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

class TestDialog extends Dialog {
    constructor(options) {
        super(options);
        this.beginCalled = false;
        this.beginArgs = undefined;
        this.continueCalled = false;
    }

    dialogBegin(dc, args) {
        this.beginCalled = true;
        this.beginArgs = args;
        return dc.context.sendActivity(`begin called`);
    }

    dialogContinue(dc) {
        this.continueCalled = true;
        return dc.end(120);
    }
}

describe('Dialog', function() {
    this.timeout(5000);

    it('should call dialog from a dialog set.', function (done) {
        const dialog = new TestDialog();

        const dialogs = new DialogSet();
        dialogs.add('dialog', dialog);

        const state = {};
        const context = new TestContext(beginMessage);
        const dc = dialogs.createContext(context, state);
        dc.begin('dialog', { foo: 'bar' }).then(() => {
            const result = dc.dialogResult;
            assert(result && result.active);
            assert(dialog.beginCalled);
            assert(dialog.beginArgs && dialog.beginArgs.foo === 'bar');
            done();
        });
    });

    it('should call dialog using begin().', function (done) {
        const dialog = new TestDialog();

        const state = {};
        const context = new TestContext(beginMessage);
        dialog.begin(context, state, { foo: 'bar' }).then((result) => {
            assert(result && result.active);
            assert(dialog.beginCalled);
            assert(dialog.beginArgs && dialog.beginArgs.foo === 'bar');
            done();
        });
    });

    it('should continue() a multi-turn dialog.', function (done) {
        const dialog = new TestDialog();

        const state = {};
        const context = new TestContext(beginMessage);
        dialog.begin(context, state, { foo: 'bar' }).then((result) => {
            assert(result && result.active);
            dialog.continue(context, state).then((result) => {
                assert(dialog.continueCalled);
                assert(result && !result.active);
                assert(result.result === 120);
                done();
            });
        });
    });
});


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
        dc.begin('a', 'z').then(() => {
            const result = dc.dialogResult;
            assert(result && !result.active);
            assert(result.result === 'z');
            done();
        });
    });
});
