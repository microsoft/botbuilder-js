const { TestAdapter, TurnContext } = require('botbuilder');
const { DialogSet, CompositeControl } =  require('../');
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

describe('CompositeControl', function() {
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
        const control = new CompositeControl(cDialogs, 'start');

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
        const control = new CompositeControl(cDialogs, 'start');

        const dialogs = new DialogSet();
        dialogs.add('control', control);

        const state = {};
        const context = new TestContext(beginMessage);
        const dc = dialogs.createContext(context, state);
        dc.begin('control').then((result) => {
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
        const control = new CompositeControl(cDialogs, 'start');

        const dialogs = new DialogSet();
        dialogs.add('control', control);

        const state = {};
        const context = new TestContext(beginMessage);
        const dc = dialogs.createContext(context, state);
        dc.begin('control').then((result) => {
            assert(result && result.active);
            dc.continue().then((result) => {
                assert(result && result.active);
                dc.continue().then((result) => {
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
        const control = new CompositeControl(cDialogs, 'start');

        const state = {};
        const context = new TestContext(beginMessage);
        control.begin(context, state, { foo: 'bar' });
    });

    it('should merge options passed to begin() with default options.', function (done) {
        const cDialogs = new DialogSet();
        cDialogs.add('start', [
            function (dc, args) {
                assert(dc);
                assert(typeof args === 'object');
                assert(args.foo === 'bar');
                assert(args.bar === 'foo');
                done();
            }
        ]);
        const control = new CompositeControl(cDialogs, 'start', { bar: 'foo' });

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
        const control = new CompositeControl(cDialogs, 'start');

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
