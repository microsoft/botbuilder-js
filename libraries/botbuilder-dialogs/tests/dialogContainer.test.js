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

    it('should call composite dialog from another dialog set.', function (done) {
        const cDialogs = new DialogSet();
        cDialogs.add('start', [
            function (dc, args) {
                assert(dc);
                assert(typeof args === 'object');
                assert(args.foo === 'bar');
                done();
            }
        ]);
        const composite = new DialogContainer('start', cDialogs);

        const dialogs = new DialogSet();
        dialogs.add('composite', composite);

        const state = {};
        const context = new TestContext(beginMessage);
        const dc = dialogs.createContext(context, state);
        dc.begin('composite', { foo: 'bar' });
    });

    it('should return result from DialogContext.begin() when composite ends immediately.', function (done) {
        const cDialogs = new DialogSet();
        cDialogs.add('start', [
            function (dc) {
                return dc.end(120);
            }
        ]);
        const composite = new DialogContainer('start', cDialogs);

        const dialogs = new DialogSet();
        dialogs.add('composite', composite);
        dialogs.add('test', [
            function (dc) {
                return dc.begin('composite');
            },
            function (dc, result) {
                assert(result === 120);
                done();
            }
        ])

        const state = {};
        const context = new TestContext(beginMessage);
        const dc = dialogs.createContext(context, state);
        dc.begin('test');
    });

    it('should DialogContext.continue() execution of a multi-turn composite.', function (done) {
        let finished = false;
        const cDialogs = new DialogSet();
        cDialogs.add('start', [
            function (dc) {
                return dc.context.sendActivity('foo');
            },
            function (dc) {
                return dc.context.sendActivity('bar');
            },
            function (dc) {
                finished = true;
                return dc.end();
            }
        ]);
        const composite = new DialogContainer('start', cDialogs);

        const dialogs = new DialogSet();
        dialogs.add('composite', composite);

        const state = {};
        const context = new TestContext(beginMessage);
        const dc = dialogs.createContext(context, state);
        dc.begin('composite').then(() => {
            assert(dc.activeDialog);
            dc.continue().then(() => {
                assert(dc.activeDialog);
                dc.continue().then(() => {
                    assert(dc.activeDialog === undefined);
                    assert(finished);
                    done();
                });
            });
        });
    });

    it('should call composite composite using begin().', function (done) {
        const cDialogs = new DialogSet();
        cDialogs.add('start', [
            function (dc, args) {
                assert(dc);
                assert(typeof args === 'object');
                assert(args.foo === 'bar');
                done();
            }
        ]);
        const composite = new DialogContainer('start', cDialogs);

        const state = {};
        const context = new TestContext(beginMessage);
        composite.begin(context, state, { foo: 'bar' });
    });

    it('should continue() execution of a multi-turn composite.', function (done) {
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
        const composite = new DialogContainer('start', cDialogs);

        const state = {};
        const context = new TestContext(beginMessage);
        composite.begin(context, state).then((completion) => {
            assert(completion && completion.isActive);
            composite.continue(context, state).then((completion) => {
                assert(completion && completion.isActive);
                composite.continue(context, state).then((completion) => {
                    assert(completion && !completion.isActive && completion.isCompleted);
                    assert(completion.result === 120);
                    done();
                });
            });
        });
    });
});
