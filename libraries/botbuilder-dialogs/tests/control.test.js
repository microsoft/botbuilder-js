const { TestAdapter, TurnContext } = require('botbuilder');
const { DialogSet, Control } =  require('../');
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

class TestControl extends Control {
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

describe('Control', function() {
    this.timeout(5000);

    it('should call control from a dialog set.', function (done) {
        const control = new TestControl();

        const dialogs = new DialogSet();
        dialogs.add('control', control);

        const state = {};
        const context = new TestContext(beginMessage);
        const dc = dialogs.createContext(context, state);
        dc.begin('control', { foo: 'bar' }).then((result) => {
            assert(result && result.active);
            assert(control.beginCalled);
            assert(control.beginArgs && control.beginArgs.foo === 'bar');
            done();
        });
    });

    it('should call control using begin().', function (done) {
        const control = new TestControl();

        const state = {};
        const context = new TestContext(beginMessage);
        control.begin(context, state, { foo: 'bar' }).then((result) => {
            assert(result && result.active);
            assert(control.beginCalled);
            assert(control.beginArgs && control.beginArgs.foo === 'bar');
            done();
        });
    });

    it('should continue() a multi-turn control.', function (done) {
        const control = new TestControl();

        const state = {};
        const context = new TestContext(beginMessage);
        control.begin(context, state, { foo: 'bar' }).then((result) => {
            assert(result && result.active);
            control.continue(context, state).then((result) => {
                assert(control.continueCalled);
                assert(result && !result.active);
                assert(result.result === 120);
                done();
            });
        });
    });
});
