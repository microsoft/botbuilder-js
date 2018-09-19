const { ConversationState, MemoryStorage, TestAdapter } = require('botbuilder-core');
const { Dialog, DialogSet, WaterfallDialog, DialogTurnStatus } =  require('../');
const assert = require('assert');

const beginMessage = { text: `begin`, type: 'message' };
const continueMessage = { text: `continue`, type: 'message' };

describe('DialogContext', function() {
    this.timeout(5000);

    it('should beginDialog() a new dialog.', function (done) {
        // Initialize TestAdapter.
        const adapter = new TestAdapter(async (turnContext) => {
            const dc = await dialogs.createContext(turnContext);
        
            const results = await dc.beginDialog('a');
            if (results.status === DialogTurnStatus.complete) {
                assert(results.result === true, `End result from WaterfallDialog was not expected value.`);
                done();
            }
            await convoState.saveChanges(turnContext);
        });

        // Create new ConversationState with MemoryStorage and register the state as middleware.
        const convoState = new ConversationState(new MemoryStorage());
        
        // Create a DialogState property, DialogSet and register the WaterfallDialog.
        const dialogState = convoState.createProperty('dialogState');
        const dialogs = new DialogSet(dialogState);
        dialogs.add(new WaterfallDialog('a', [
            async function (step) {
                assert(step, `WaterfallStepContext not passed in to WaterfallStep.`);
                return await step.endDialog(true);
            }
        ]));

        adapter.send(beginMessage);
    });

    it('beginDialog() should pass in dialogOptions to a begun dialog.', function (done) {
        const adapter = new TestAdapter(async (turnContext) => {
            const dc = await dialogs.createContext(turnContext);
        
            const results = await dc.beginDialog('a', { z: 'z' });
            if (results.status === DialogTurnStatus.complete) {
                assert(results.result === true, `End result from WaterfallDialog was not expected value.`);
                done();
            }
            await convoState.saveChanges(turnContext);
        });

        const convoState = new ConversationState(new MemoryStorage());
        
        const dialogState = convoState.createProperty('dialogState');
        const dialogs = new DialogSet(dialogState);
        dialogs.add(new WaterfallDialog('a', [
            async function (step) {
                assert(step, `WaterfallStepContext not passed in to WaterfallStep.`);
                assert(step.options.z === 'z', `Correct DialogOptions was not passed in to WaterfallDialog.`); 
                return await step.endDialog(true);
            }
        ]));

        adapter.send(beginMessage);
    });

    it('should return error if beginDialog() called with invalid dialogId.', function (done) {
        const adapter = new TestAdapter(async (turnContext) => {
            const dc = await dialogs.createContext(turnContext);
        
            try {
                let results = await dc.beginDialog('b');
                await convoState.saveChanges(turnContext);
            }
            catch (err) {
                assert(err);
                assert.strictEqual(err.message, `DialogContext.beginDialog(): A dialog with an id of 'b' wasn't found.`, `unexpected error message thrown: "${err.message}"`);
                return done();
            }
            throw new Error('Should have thrown an error.');
        });

        const convoState = new ConversationState(new MemoryStorage());
        const dialogState = convoState.createProperty('dialogState');
        const dialogs = new DialogSet(dialogState);

        dialogs.add(new WaterfallDialog('a', [
            async function (step) {
                return await step.endDialog();
            }
        ]));

        adapter.send(beginMessage);
    });

    it('should pass prompt() args to dialog.', function (done) {
        const adapter = new TestAdapter(async (turnContext) => {
            const dc = await dialogs.createContext(turnContext);
        
            const results = await dc.prompt('a', 'test');
            await convoState.saveChanges(turnContext);
            done();
        });

        const convoState = new ConversationState(new MemoryStorage());
        const dialogState = convoState.createProperty('dialogState');

        const dialogs = new DialogSet(dialogState);
        dialogs.add(new WaterfallDialog('a', [
            async function (step) {
                assert(step, `WaterfallStepContext not passed in to WaterfallStep.`);
                assert.strictEqual(step.options.prompt, 'test', `promptOrOptions arg was not correctly passed through.`);
                return await step.endDialog();
            }
        ]));

        adapter.send(beginMessage);
    });

    it('should pass undefined prompt() to dialog.', function (done) {
        const adapter = new TestAdapter(async (turnContext) => {
            const dc = await dialogs.createContext(turnContext);
        
            const results = await dc.prompt('a');
            await convoState.saveChanges(turnContext);
            done();
        });

        const convoState = new ConversationState(new MemoryStorage());
        const dialogState = convoState.createProperty('dialogState');

        const dialogs = new DialogSet(dialogState);
        dialogs.add(new WaterfallDialog('a', [
            async function (step) {
                assert(step, `WaterfallStepContext not passed in to WaterfallStep.`);
                return await step.endDialog();
            }
        ]));

        adapter.send(beginMessage);
    });

    it('should pass choice array to prompt() to dialog.', function (done) {
        const adapter = new TestAdapter(async (turnContext) => {
            const dc = await dialogs.createContext(turnContext);
        
            const results = await dc.prompt('a', 'test', ['red', 'green', 'blue']);
            await convoState.saveChanges(turnContext);
            done();
        });

        const convoState = new ConversationState(new MemoryStorage());
        const dialogState = convoState.createProperty('dialogState');

        const dialogs = new DialogSet(dialogState);
        dialogs.add(new WaterfallDialog('a', [
            async function (step) {
                assert(step, `WaterfallStepContext not passed in to WaterfallStep.`);
                assert(Array.isArray(step.options.choices), `choices received in step is not an array.`); 
                assert.strictEqual(step.options.choices.length, 3, `not all choices were passed in.`); 
                return await step.endDialog();
            }
        ]));

        adapter.send(beginMessage);
    });

    it('should return a value to parent when endDialog() called with a value.', function (done) {
        const adapter = new TestAdapter(async (turnContext) => {
            const dc = await dialogs.createContext(turnContext);
        
            const results = await dc.beginDialog('a');
            await convoState.saveChanges(turnContext);
            assert.strictEqual(results.result, 119, `unexpected results.result value received from 'a' dialog.`);
            done();
        });

        const convoState = new ConversationState(new MemoryStorage());
        const dialogState = convoState.createProperty('dialogState');

        const dialogs = new DialogSet(dialogState);
        dialogs.add(new WaterfallDialog('a', [
            async function (step) {
                assert(step, `WaterfallStepContext not passed in to WaterfallStep.`);
                return await step.beginDialog('b');
            },
            async function (step) {
                assert(step, `WaterfallStepContext not passed in to WaterfallStep.`);
                assert.strictEqual(step.result, 120, `incorrect step.result value received from 'b' dialog.`);
                return await step.endDialog(119);
            }
        ]));

        dialogs.add(new WaterfallDialog('b', [
            async function (step) {
                assert(step, `WaterfallStepContext not passed in to WaterfallStep.`);
                return await step.endDialog(120);
            }
        ]));

        adapter.send(beginMessage);
    });

    it('should continue() execution of a dialog.', function (done) {
        const adapter = new TestAdapter(async (turnContext) => {
            const dc = await dialogs.createContext(turnContext);
        
            const results = await dc.continueDialog();
            switch (results.status) {
                case DialogTurnStatus.empty:
                    await dc.beginDialog('a');
                    break;
                
                case DialogTurnStatus.complete:
                    assert.strictEqual(results.result, true, `received unexpected final result from dialog.`);
                    done();
                    break;
            }
            await convoState.saveChanges(turnContext);
        });

        const convoState = new ConversationState(new MemoryStorage());
        const dialogState = convoState.createProperty('dialogState');

        const dialogs = new DialogSet(dialogState);
        dialogs.add(new WaterfallDialog('a', [
            async function (step) {
                assert(step, `WaterfallStepContext not passed in to WaterfallStep.`);
                await step.context.sendActivity(`foo`);
                return Dialog.EndOfTurn;
            },
            async function (step) {
                assert(step, `WaterfallStepContext not passed in to WaterfallStep.`);
                return await step.endDialog(true);
            }
        ]));

        adapter.send(beginMessage)
            .send(continueMessage);
    });

    it('should return an error if dialog not found when continue() called.', function (done) {
        const adapter = new TestAdapter(async (turnContext) => {
            const dc = await dialogs.createContext(turnContext);

            let results;
            try {
                results = await dc.continueDialog();
            }
            catch (err) {
                assert(err, `Error not found.`);
                assert.strictEqual(err.message, `DialogContext.continue(): Can't continue dialog. A dialog with an id of 'b' wasn't found.`, `unexpected error message thrown: "${err.message}"`);
                return done();
            }
            if (results.status === DialogTurnStatus.empty) {
                await dc.beginDialog('a');
            }
            await convoState.saveChanges(turnContext);
        });
        
        const convoState = new ConversationState(new MemoryStorage());
        const dialogState = convoState.createProperty('dialogState');

        const dialogs = new DialogSet(dialogState);
        dialogs.add(new WaterfallDialog('a', [
            async function (step) {
                assert(step, `WaterfallStepContext not passed in to WaterfallStep.`);
                assert.strictEqual(step.activeDialog.id, 'a', `incorrect value for step.activeDialog.id`);
                step.activeDialog.id = 'b';
                return Dialog.EndOfTurn;
            },
            async function (step) {
                assert(false, `shouldn't continue`);
            }
        ]));

        adapter.send(beginMessage)
            .send(continueMessage);
    });

    it(`should return a DialogTurnResult if continue() is called without an activeDialog.`, function (done) {
        const adapter = new TestAdapter(async (turnContext) => {
            const dc = await dialogs.createContext(turnContext);
            const results = await dc.continueDialog();
            assert.strictEqual(typeof results, 'object', `results is not the expected object`);
            assert.strictEqual(results.status, DialogTurnStatus.empty, `results.status is not 'empty'.`);
            await convoState.saveChanges(turnContext);
            done();
        });

        const convoState = new ConversationState(new MemoryStorage());
        const dialogState = convoState.createProperty('dialogState');

        const dialogs = new DialogSet(dialogState);        

        adapter.send(beginMessage);
    });

    it('should return to parent dialog when endDialog() called.', function (done) {
        const adapter = new TestAdapter(async (turnContext) => {
            const dc = await dialogs.createContext(turnContext);
        
            const results = await dc.beginDialog('a');
            assert.strictEqual(results.result, true, `received unexpected final result from dialog.`);
            await convoState.saveChanges(turnContext);
            done();
        });

        const convoState = new ConversationState(new MemoryStorage());
        
        const dialogState = convoState.createProperty('dialogState');

        const dialogs = new DialogSet(dialogState);
        dialogs.add(new WaterfallDialog('a', [
            async function (step) {
                assert(step, `WaterfallStepContext not passed in to WaterfallStep.`);
                return await step.beginDialog('b');
            },
            async function (step) {
                assert(step, `WaterfallStepContext not passed in to WaterfallStep.`);
                assert(step.context.activity.text, 'begin', `unexpected message received.`);
                assert(step.result, `ended dialog.`, `unexpected step.result received.`);
                return await step.endDialog(true);
            }
        ]));

        dialogs.add(new WaterfallDialog('b', [
            async function (step) {
                assert(step, `WaterfallStepContext not passed in to WaterfallStep.`);
                return await step.endDialog('ended dialog.');
            }
        ]));

        adapter.send(beginMessage);
    });

    it(`should accept calls to end when no activeDialogs or parent dialogs exist.`, function (done) {
        const adapter = new TestAdapter(async (turnContext) => {
            const dc = await dialogs.createContext(turnContext);
            
            const results = await dc.endDialog();
            await convoState.saveChanges(turnContext);
            assert.strictEqual(results.status, DialogTurnStatus.complete, `results.status not equal 'complete'.`);
            assert.strictEqual(results.result, undefined, `received unexpected value for results.result (expected undefined).`);
            done();
        });

        const convoState = new ConversationState(new MemoryStorage());
        
        const dialogState = convoState.createProperty('dialogState');

        const dialogs = new DialogSet(dialogState);
        dialogs.add(new WaterfallDialog('a', [
            async function (step) {
                assert(step, `WaterfallStepContext not passed in to WaterfallStep.`);
                return await step.replaceDialog('b', { z: step.options.z });
            }
        ]));

        adapter.send(beginMessage);
    });

    it(`should replace() dialog.`, function (done) {
        const adapter = new TestAdapter(async (turnContext) => {
            const dc = await dialogs.createContext(turnContext);
        
            const results = await dc.beginDialog('a', { z: 'z' });
            await convoState.saveChanges(turnContext);
            assert.strictEqual(results.result, 'z', `received unexpected final result from dialog.`);
            done();
        });

        const convoState = new ConversationState(new MemoryStorage());
        
        const dialogState = convoState.createProperty('dialogState');

        const dialogs = new DialogSet(dialogState);
        dialogs.add(new WaterfallDialog('a', [
            async function (step) {
                assert(step, `WaterfallStepContext not passed in to WaterfallStep.`);
                return await step.replaceDialog('b', { z: step.options.z });
            }
        ]));

        dialogs.add(new WaterfallDialog('b', [
            async function (step) {
                assert(step, `WaterfallStepContext not passed in to WaterfallStep.`);
                assert.strictEqual(step.stack.length, 1, `current DialogContext.stack.length should be 1.`);
                assert.strictEqual(step.options.z, 'z', `incorrect step.options received.`);
                return await step.endDialog(step.options.z);
            }
        ]));

        adapter.send(beginMessage);
    });

    it(`should begin dialog if stack empty when replaceDialog() called with valid dialogId.`, function (done) {
        const adapter = new TestAdapter(async (turnContext) => {
            const dc = await dialogs.createContext(turnContext);

            const results = await dc.replaceDialog('b');
            await convoState.saveChanges(turnContext);
            done();
        });
        const convoState = new ConversationState(new MemoryStorage());
        
        const dialogState = convoState.createProperty('dialogState');

        const dialogs = new DialogSet(dialogState);
        dialogs.add(new WaterfallDialog('b', [
            async function (step) {
                assert(step, `WaterfallStepContext not passed in to WaterfallStep.`);
                return await step.endDialog();
            }
        ]));

        adapter.send(beginMessage);
    });
});
