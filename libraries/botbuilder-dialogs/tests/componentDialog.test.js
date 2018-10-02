const { ConversationState, MemoryStorage, TestAdapter, TurnContext } = require('botbuilder-core');
const { Dialog, DialogReason, DialogSet, DialogTurnStatus, ComponentDialog, WaterfallDialog } = require('../');
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

function simpleStepContextCheck(step) {
    assert(step, `step not found.`);
    assert(typeof step === 'object', `step is not a WaterfallStepContext.`);
}

describe('ComponentDialog', function () {
    this.timeout(5000);

    it('should set initial dialog to be first dialog added via addDialog()', (done) => {
        const simpleWaterfall = new WaterfallDialog('simpleWaterfall', [
            async (step) => { }
        ]);

        const simpleH2ofall = new WaterfallDialog('simpleH2ofall', [
            async (step) => { }
        ]);

        const component = new ComponentDialog('component');
        component.addDialog(simpleWaterfall);
        assert(component.initialDialogId === 'simpleWaterfall', `unexpected initialDialogId`);
        component.addDialog(simpleH2ofall);
        assert(component.initialDialogId === 'simpleWaterfall', `unexpected change in initialDialogId, it is now ${ component.initialDialogId }`);
        done();
    });

    it('should call ComponentDialog from another DialogSet.', (done) => {
        const conversationState = new ConversationState(new MemoryStorage());
        const dialogState = conversationState.createProperty('dialog');

        const startDialog = new WaterfallDialog('start', [
            async (step) => {
                simpleStepContextCheck(step);
                assert(step.options.foo === 'bar');
                return await step.endDialog();
            }
        ]);
        const component = new ComponentDialog('composite');
        component.addDialog(startDialog);

        const dialogs = new DialogSet(dialogState);
        dialogs.add(component);

        const adapter = new TestAdapter(async turnContext => {
            const dc = await dialogs.createContext(turnContext);
            const results = await dc.beginDialog('composite', { foo: 'bar' });
        });

        adapter.send('Hi');
        done();
    });

    it('should throw an error up if child dialog does not return DialogTurnResult on beginDialog.', (done) => {
        const conversationState = new ConversationState(new MemoryStorage());
        const dialogState = conversationState.createProperty('dialog');

        const startDialog = new WaterfallDialog('start', [
            async (step) => {
                simpleStepContextCheck(step);
            }
        ]);
        const component = new ComponentDialog('composite');
        component.addDialog(startDialog);

        const dialogs = new DialogSet(dialogState);
        dialogs.add(component);

        const adapter = new TestAdapter(async turnContext => {
            const dc = await dialogs.createContext(turnContext);
            const results = await dc.beginDialog('composite')
                .catch(err => {
                    assert(err.message === `Cannot read property 'status' of undefined`,
                        `unexpected Error thrown.`);
                    done();
                });
        });
        adapter.send('Hi');
    });

    it('should have DialogTurnResult.status equal DialogTurnStatus.complete when endComponent() is called.', (done) => {
        const conversationState = new ConversationState(new MemoryStorage());
        const dialogState = conversationState.createProperty('dialog');

        const startDialog = new WaterfallDialog('start', [
            async (step) => {
                simpleStepContextCheck(step);
                return { status: DialogTurnStatus.cancelled, result: undefined };
            }
        ]);
        const component = new ComponentDialog('composite');
        component.addDialog(startDialog);

        const dialogs = new DialogSet(dialogState);
        dialogs.add(component);

        const adapter = new TestAdapter(async turnContext => {
            const dc = await dialogs.createContext(turnContext);
            const results = await dc.beginDialog('composite');
            assert(results.status === DialogTurnStatus.complete, `unexpected DialogTurnStatus received: ${ results.status }`);
            assert(results.result === undefined, `unexpected results.result received: ${ results.result }`);
            done();
        });

        adapter.send('Hi');
    });

    it(`should return Dialog.EndOfTurn if the dialog's turnResult.status === 'waiting'.`, (done) => {
        const conversationState = new ConversationState(new MemoryStorage());
        const dialogState = conversationState.createProperty('dialog');

        const startDialog = new WaterfallDialog('start', [
            async (step) => {
                simpleStepContextCheck(step);
                return { status: DialogTurnStatus.waiting, result: undefined };
            },
            async (step) => {
                simpleStepContextCheck(step);
                return await step.endDialog();
            }
        ]);
        const component = new ComponentDialog('composite');
        component.addDialog(startDialog);

        const dialogs = new DialogSet(dialogState);
        dialogs.add(component);

        const adapter = new TestAdapter(async turnContext => {
            const dc = await dialogs.createContext(turnContext);
            const results = await dc.beginDialog('composite');
            assert(results.status === DialogTurnStatus.waiting, `unexpected DialogTurnStatus received: ${ results.status }`);
            assert(results.result === undefined, `unexpected results.result received: ${ results.result }`);
            done();
        });

        adapter.send('Hi');
    });

    it('should return any found dialogs.', (done) => {
        const simpleWaterfall = new WaterfallDialog('simpleWaterfall', [
            async (step) => { }
        ]);

        const component = new ComponentDialog('component');
        component.addDialog(simpleWaterfall);
        const dialog = component.findDialog('simpleWaterfall');
        assert(dialog === simpleWaterfall, `unexpected dialog returned`);
        done();
    });

    it('should return undefined for not found dialogs.', (done) => {
        const component = new ComponentDialog('component');
        const notADialog = component.findDialog('notADialog');
        assert(notADialog === undefined, `unexpected value returned: ${ typeof notADialog }`);
        done();
    });

    it('should continue from dc.continueDialog() and call onContinueDialog().', (done) => {
        const conversationState = new ConversationState(new MemoryStorage());
        const dialogState = conversationState.createProperty('dialog');

        const startDialog = new WaterfallDialog('start', [
            async step => {
                simpleStepContextCheck(step);
                await step.context.sendActivity('First step.');
                return Dialog.EndOfTurn;
            },
            async step => {
                simpleStepContextCheck(step);
                return await step.endDialog();
            }
        ]);
        const component = new ContinueDialog('composite');
        component.addDialog(startDialog);

        const dialogs = new DialogSet(dialogState);
        dialogs.add(component);

        const adapter = new TestAdapter(async turnContext => {
            const dc = await dialogs.createContext(turnContext);
            const results = await dc.continueDialog();

            if (results.status === DialogTurnStatus.empty) {
                await dc.beginDialog('composite');
            } else {
                assert(results.status === DialogTurnStatus.complete, `results.status should be 'complete' not ${ results.status }`);
                assert(results.result === undefined, `results.result should be undefined, not ${ results.result }`);
                await turnContext.sendActivity('Done.');
                done();
            }
            await conversationState.saveChanges(turnContext);
        });

        adapter.send('Hi')
            .assertReply('First step.')
            .send('Hi again')
            .assertReply('Called onContinueDialog.')
            .assertReply('Done.')
    });

    xit('should cancel all Dialogs inside of ComponentDialog namespace.', () => {
        // TODOs
    });

    it('should not cancel any Dialogs outside of ComponentDialog namespace.', () => {
        const conversationState = new ConversationState(new MemoryStorage());
        const dialogState = conversationState.createProperty('dialog');

        const outerDialog = new WaterfallDialog('outerDialog', [
            async step => {
                simpleStepContextCheck(step);
                return await step.beginDialog('component');
            },
            async step => {
                simpleStepContextCheck(step);
                assert(step.reason === DialogReason.endCalled, `called ComponentDialog should have bubbled up "cancelCalled" not "${ step.reason }".`);
                await step.context.sendActivity('Cancelled successfully.');
                return await step.endDialog();
            }
        ]);
        const firstChildDialog = new WaterfallDialog('first', [
            async step => {
                simpleStepContextCheck(step);
                await step.context.sendActivity('Reached first component dialog child.');
                return await step.beginDialog('second');
            }
        ]);
        const secondChildDialog = new WaterfallDialog('second', [
            async step => {
                simpleStepContextCheck(step);
                await step.context.sendActivity('Cancelling all component dialog dialogs.');
                return await step.cancelAllDialogs();
            }
        ]);

        const component = new ComponentDialog('component');
        component.addDialog(firstChildDialog);
        component.addDialog(secondChildDialog);

        const dialogs = new DialogSet(dialogState);
        dialogs.add(component)
            .add(outerDialog);

        const adapter = new TestAdapter(async turnContext => {
            const dc = await dialogs.createContext(turnContext);
            await dc.beginDialog('outerDialog');
        });

        adapter.send('Hi')
            .assertReply('Reached first component dialog child.')
            .assertReply('Cancelling all component dialog dialogs.')
            .assertReply('Cancelled successfully.');
    });

    xit('should return result from DialogContext.beginDialog() when composite ends immediately.', async function () {
        const cDialogs = new DialogSet();
        cDialogs.add(new WaterfallDialog('start', [
            async (dc) => {
                return await dc.endDialog(120);
            }
        ]));
        const composite = new ComponentDialog('composite', cDialogs);

        const dialogs = new DialogSet();
        dialogs.add(composite);
        dialogs.add(new WaterfallDialog('test', [
            async (dc) => {
                return await dc.beginDialog('composite');
            },
            async (step) => {
                assert(step.result === 120);
                done();
            }
        ]));

        const state = {};
        const context = new TestContext(beginMessage);
        const dc = await dialogs.createContext(context, state);
        await dc.beginDialog('test');
    });

    xit('should DialogContext.continue() execution of a multi-turn composite.', function (done) {
        let finished = false;
        const cDialogs = new DialogSet();
        cDialogs.add(new WaterfallDialog('start', [
            function (dc) {
                return dc.context.sendActivity('foo');
            },
            function (dc) {
                return dc.context.sendActivity('bar');
            },
            function (dc) {
                finished = true;
                return dc.endDialog();
            }
        ]));
        const composite = new ComponentDialog('start', cDialogs);

        const dialogs = new DialogSet();
        dialogs.add('composite', composite);

        const state = {};
        const context = new TestContext(beginMessage);
        const dc = dialogs.createContext(context, state);
        dc.beginDialog('composite').then(() => {
            assert(dc.activeDialog);
            dc.continueDialog().then(() => {
                assert(dc.activeDialog);
                dc.continueDialog().then(() => {
                    assert(dc.activeDialog === undefined);
                    assert(finished);
                    done();
                });
            });
        });
    });

    xit('should call composite composite using begin().', async function () {
        const cDialogs = new DialogSet();
        cDialogs.add(new WaterfallDialog('start', [
            function (dc, args) {
                assert(dc);
                assert(typeof args === 'object');
                assert(args.foo === 'bar');
                done();
            }
        ]));
        const composite = new ComponentDialog('start', cDialogs);

        const state = {};
        const context = new TestContext(beginMessage);
        await composite.begin(context, state, { foo: 'bar' });
    });

    xit('should continue() execution of a multi-turn composite.', function (done) {
        const cDialogs = new DialogSet();
        cDialogs.add(new WaterfallDialog('start', [
            function (dc) {
                return dc.context.sendActivity('foo');
            },
            function (dc) {
                return dc.context.sendActivity('bar');
            },
            function (dc) {
                return dc.endDialog(120);
            }
        ]));
        const composite = new ComponentDialog('start', cDialogs);

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

class ContinueDialog extends ComponentDialog {
    constructor(dialogId) {
        super(dialogId);
    }

    async onContinueDialog(innerDC) {
        await innerDC.context.sendActivity('Called onContinueDialog.');
        return await innerDC.continueDialog();
    }
}

