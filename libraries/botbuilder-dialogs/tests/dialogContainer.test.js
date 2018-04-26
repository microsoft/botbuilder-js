const { TestAdapter, TurnContext } = require('botbuilder');
const { DialogSet, DialogContainer } =  require('../');
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

describe('DialogContainer', function() {
    this.timeout(5000);

    it('should call composite control from another dialog set.', function (done) {
        const cDialogs = new DialogSet();
        cDialogs.add('start', [
            function (dc, args) {
                assert(dc);
                assert(typeof args === 'object');
                assert(args.foo === 'bar');
                done();
            }
        ]);
        const control = new DialogContainer('start', cDialogs);

        const dialogs = new DialogSet();
        dialogs.add('control', control);

        const state = {};
        const context = new TestContext(beginMessage);
        const dc = dialogs.createContext(context, state);
        dc.begin('control', { foo: 'bar' });
    });

    it('should return result from DialogContext.begin() when control ends immediately.', function (done) {
        const cDialogs = new DialogSet();
        cDialogs.add('start', [
            function (dc) {
                return dc.end(120);
            }
        ]);
        const control = new DialogContainer('start', cDialogs);

        const dialogs = new DialogSet();
        dialogs.add('control', control);

        const state = {};
        const context = new TestContext(beginMessage);
        const dc = dialogs.createContext(context, state);
        dc.begin('control').then(() => {
            const result = dc.dialogResult;
            assert(result && !result.active);
            assert(result.result === 120);
            done();
        });
    });

    it('should DialogContext.continue() execution of a multi-turn control.', function (done) {
        const cDialogs = new DialogSet();
        cDialogs.add('start', [
            function (dc) {
                return dc.context.sendActivity('foo');
            },
            function (dc) {
                return dc.context.sendActivity('bar');
            },
            function (dc) {
                return dc.end(120);
            }
        ]);
        const control = new DialogContainer('start', cDialogs);

        const dialogs = new DialogSet();
        dialogs.add('control', control);

        const state = {};
        const context = new TestContext(beginMessage);
        const dc = dialogs.createContext(context, state);
        dc.begin('control').then(() => {
            const result = dc.dialogResult;
            assert(result && result.active);
            dc.continue().then(() => {
                const result = dc.dialogResult;
                assert(result && result.active);
                dc.continue().then(() => {
                    const result = dc.dialogResult;
                    assert(result && !result.active);
                    assert(result.result === 120);
                    done();
                });
            });
        });
    });

    it('should call composite control using begin().', function (done) {
        const cDialogs = new DialogSet();
        cDialogs.add('start', [
            function (dc, args) {
                assert(dc);
                assert(typeof args === 'object');
                assert(args.foo === 'bar');
                done();
            }
        ]);
        const control = new DialogContainer('start', cDialogs);

        const state = {};
        const context = new TestContext(beginMessage);
        control.begin(context, state, { foo: 'bar' });
    });

    it('should continue() execution of a multi-turn control.', function (done) {
        const cDialogs = new DialogSet();
        cDialogs.add('start', [
            function (dc) {
                return dc.context.sendActivity('foo');
            },
            function (dc) {
                return dc.context.sendActivity('bar');
            },
            function (dc) {
                return dc.end(120);
            }
        ]);
        const control = new DialogContainer('start', cDialogs);

        const state = {};
        const context = new TestContext(beginMessage);
        control.begin(context, state).then((result) => {
            assert(result && result.active);
            control.continue(context, state).then((result) => {
                assert(result && result.active);
                control.continue(context, state).then((result) => {
                    assert(result && !result.active);
                    assert(result.result === 120);
                    done();
                });
            });
        });
    });
});
