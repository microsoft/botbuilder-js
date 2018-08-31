const { ConversationState, MemoryStorage, TestAdapter } = require('botbuilder-core');
const { Dialog, DialogSet, WaterfallDialog } =  require('../');
const assert = require('assert');

const beginMessage = { text: `begin`, type: 'message' };
const continueMessage = { text: `continue`, type: 'message' };

describe('DialogContext', function() {
    this.timeout(5000);

    it('should begin() a new dialog.', function (done) {
        // Initialize TestAdapter.
        const adapter = new TestAdapter(async (turnContext) => {
            const dc = await dialogs.createContext(turnContext);
        
            const results = await dc.begin('a');
            if (!results.hasActive && results.hasResult) {
                assert(results.result === true, `End result from WaterfallDialog was not expected value.`);
                done();
            }
        });

        // Create new ConversationState with MemoryStorage and register the state as middleware.
        const convoState = new ConversationState(new MemoryStorage());
        adapter.use(convoState);
        
        // Create a DialogState property, DialogSet and register the WaterfallDialog.
        const dialogState = convoState.createProperty('dialogState');
        const dialogs = new DialogSet(dialogState);
        dialogs.add(new WaterfallDialog('a', [
            async function (dc, step) {
                assert(dc, `DialogContext not passed in to WaterfallStep.`);
                assert(step, `WaterfallStepContext not passed in to WaterfallStep.`);
                return await dc.end(true);
            }
        ]));

        adapter.send(beginMessage);
    });

    it('begin() should pass in dialogOptions to a begun dialog.', function (done) {
        const adapter = new TestAdapter(async (turnContext) => {
            const dc = await dialogs.createContext(turnContext);
        
            const results = await dc.begin('a', { z: 'z' });
            if (!results.hasActive && results.hasResult) {
                assert(results.result === true, `End result from WaterfallDialog was not expected value.`);
                done();
            }
        });

        const convoState = new ConversationState(new MemoryStorage());
        adapter.use(convoState);
        
        const dialogState = convoState.createProperty('dialogState');
        const dialogs = new DialogSet(dialogState);
        dialogs.add(new WaterfallDialog('a', [
            async function (dc, step) {
                assert(dc, `DialogContext not passed in to WaterfallStep.`);
                assert(step, `WaterfallStepContext not passed in to WaterfallStep.`);
                assert(step.options.z === 'z', `Correct DialogOptions was not passed in to WaterfallDialog.`); 
                return await dc.end(true);
            }
        ]));

        adapter.send(beginMessage);
    });

    it('should return error if begin() called with invalid dialogId.', function (done) {
        const adapter = new TestAdapter(async (turnContext) => {
            const dc = await dialogs.createContext(turnContext);
        
            try {
                let results = await dc.begin('b');
            }
            catch (err) {
                assert(err);
                assert.strictEqual(err.message, `DialogContext.begin(): A dialog with an id of 'b' wasn't found.`, `unexpected error message thrown: "${err.message}"`);
                return done();
            }
            throw new Error('Should have thrown an error.');
        });

        const convoState = new ConversationState(new MemoryStorage());
        adapter.use(convoState);
        const dialogState = convoState.createProperty('dialogState');
        const dialogs = new DialogSet(dialogState);

        dialogs.add(new WaterfallDialog('a', [
            async function (dc, args) {
                return await dc.end();
            }
        ]));

        adapter.send(beginMessage);
    });

    it('should pass prompt() args to dialog.', function (done) {
        const adapter = new TestAdapter(async (turnContext) => {
            const dc = await dialogs.createContext(turnContext);
        
            const results = await dc.prompt('a', 'test');
            done();
        });

        const convoState = new ConversationState(new MemoryStorage());
        adapter.use(convoState);
        const dialogState = convoState.createProperty('dialogState');

        const dialogs = new DialogSet(dialogState);
        dialogs.add(new WaterfallDialog('a', [
            async function (dc, step) {
                assert(dc, `DialogContext not passed in to WaterfallStep.`);
                assert(step, `WaterfallStepContext not passed in to WaterfallStep.`);
                assert.strictEqual(step.options.prompt, 'test', `promptOrOptions arg was not correctly passed through.`);
                return await dc.end();
            }
        ]));

        adapter.send(beginMessage);
    });

    it('should pass undefined prompt() to dialog.', function (done) {
        const adapter = new TestAdapter(async (turnContext) => {
            const dc = await dialogs.createContext(turnContext);
        
            const results = await dc.prompt('a');
            done();
        });

        const convoState = new ConversationState(new MemoryStorage());
        adapter.use(convoState);
        const dialogState = convoState.createProperty('dialogState');

        const dialogs = new DialogSet(dialogState);
        dialogs.add(new WaterfallDialog('a', [
            async function (dc, step) {
                assert(dc, `DialogContext not passed in to WaterfallStep.`);
                assert(step, `WaterfallStepContext not passed in to WaterfallStep.`);
                return await dc.end();
            }
        ]));

        adapter.send(beginMessage);
    });

    it('should pass choice array to prompt() to dialog.', function (done) {
        const adapter = new TestAdapter(async (turnContext) => {
            const dc = await dialogs.createContext(turnContext);
        
            const results = await dc.prompt('a', 'test', ['red', 'green', 'blue']);
            done();
        });

        const convoState = new ConversationState(new MemoryStorage());
        adapter.use(convoState);
        const dialogState = convoState.createProperty('dialogState');

        const dialogs = new DialogSet(dialogState);
        dialogs.add(new WaterfallDialog('a', [
            async function (dc, step) {
                assert(dc, `DialogContext not passed in to WaterfallStep.`);
                assert(step, `WaterfallStepContext not passed in to WaterfallStep.`);
                assert(Array.isArray(step.options.choices), `choices received in step is not an array.`); 
                assert.strictEqual(step.options.choices.length, 3, `not all choices were passed in.`); 
                return await dc.end();
            }
        ]));

        adapter.send(beginMessage);
    });

    it('should return a value to parent when end() called with a value.', function (done) {
        const adapter = new TestAdapter(async (turnContext) => {
            const dc = await dialogs.createContext(turnContext);
        
            const results = await dc.begin('a');
            assert.strictEqual(results.result, 119, `unexpected results.result value received from 'a' dialog.`);
            done();
        });

        const convoState = new ConversationState(new MemoryStorage());
        adapter.use(convoState);
        const dialogState = convoState.createProperty('dialogState');

        const dialogs = new DialogSet(dialogState);
        dialogs.add(new WaterfallDialog('a', [
            async function (dc, step) {
                assert(dc, `DialogContext not passed in to WaterfallStep.`);
                assert(step, `WaterfallStepContext not passed in to WaterfallStep.`);
                return await dc.begin('b');
            },
            async function (dc, step) {
                assert(dc, `DialogContext not passed in to WaterfallStep.`);
                assert(step, `WaterfallStepContext not passed in to WaterfallStep.`);
                assert.strictEqual(step.result, 120, `incorrect step.result value received from 'b' dialog.`);
                return await dc.end(119);
            }
        ]));

        dialogs.add(new WaterfallDialog('b', [
            async function (dc, step) {
                assert(dc, `DialogContext not passed in to WaterfallStep.`);
                assert(step, `WaterfallStepContext not passed in to WaterfallStep.`);
                return await dc.end(120);
            }
        ]));

        adapter.send(beginMessage);
    });

    it('should continue() execution of a dialog.', function (done) {
        const adapter = new TestAdapter(async (turnContext) => {
            const dc = await dialogs.createContext(turnContext);
        
            const results = await dc.continue();
            if (!turnContext.responded && !results.hasActive && !results.hasResult) {
                await dc.begin('a');
            } else if (!results.hasActive && results.hasResult) {
                assert.strictEqual(results.result, true, `received unexpected final result from dialog.`);
                done();
            }
        });

        const convoState = new ConversationState(new MemoryStorage());
        adapter.use(convoState);
        const dialogState = convoState.createProperty('dialogState');

        const dialogs = new DialogSet(dialogState);
        dialogs.add(new WaterfallDialog('a', [
            async function (dc, step) {
                assert(dc, `DialogContext not passed in to WaterfallStep.`);
                assert(step, `WaterfallStepContext not passed in to WaterfallStep.`);
                return dc.context.sendActivity(`foo`);
                return Dialog.EndOfTurn;
            },
            async function (dc, step) {
                assert(dc, `DialogContext not passed in to WaterfallStep.`);
                assert(step, `WaterfallStepContext not passed in to WaterfallStep.`);
                return await dc.end(true);
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
                results = await dc.continue();
            }
            catch (err) {
                assert(err, `Error not found.`);
                assert.strictEqual(err.message, `DialogContext.continue(): Can't continue dialog. A dialog with an id of 'b' wasn't found.`, `unexpected error message thrown: "${err.message}"`);
                return done();
            }
            if (!turnContext.responded && !results.hasActive && !results.hasResult) {
                await dc.begin('a');
            }
        });
        
        const convoState = new ConversationState(new MemoryStorage());
        adapter.use(convoState);
        const dialogState = convoState.createProperty('dialogState');

        const dialogs = new DialogSet(dialogState);
        dialogs.add(new WaterfallDialog('a', [
            async function (dc, step) {
                assert(dc, `DialogContext not passed in to WaterfallStep.`);
                assert(step, `WaterfallStepContext not passed in to WaterfallStep.`);
                assert.strictEqual(dc.activeDialog.id, 'a', `incorrect value for dc.activeDialog.id`);
                dc.activeDialog.id = 'b';
                return Dialog.EndOfTurn;
            },
            async function (dc, step) {
                assert(false, `shouldn't continue`);
            }
        ]));

        adapter.send(beginMessage)
            .send(continueMessage);
    });

    it(`should return a DialogTurnResult if continue() is called without an activeDialog.`, function (done) {
        const adapter = new TestAdapter(async (turnContext) => {
            const dc = await dialogs.createContext(turnContext);
            const results = await dc.continue();
            assert.strictEqual(typeof results, 'object', `results is not the expected object`);
            assert.strictEqual(results.hasActive, false, `results.hasActive is not false.`);
            assert.strictEqual(results.hasResult, false, `results.hasResult is not false.`);
            done();
        });

        const convoState = new ConversationState(new MemoryStorage());
        adapter.use(convoState);
        const dialogState = convoState.createProperty('dialogState');

        const dialogs = new DialogSet(dialogState);        

        adapter.send(beginMessage);
    });

    it('should return to parent dialog when end() called.', function (done) {
        const adapter = new TestAdapter(async (turnContext) => {
            const dc = await dialogs.createContext(turnContext);
        
            const results = await dc.begin('a');
            assert.strictEqual(results.result, true, `received unexpected final result from dialog.`);
            done();
        });

        const convoState = new ConversationState(new MemoryStorage());
        adapter.use(convoState);
        const dialogState = convoState.createProperty('dialogState');

        const dialogs = new DialogSet(dialogState);
        dialogs.add(new WaterfallDialog('a', [
            async function (dc, step) {
                assert(dc, `DialogContext not passed in to WaterfallStep.`);
                assert(step, `WaterfallStepContext not passed in to WaterfallStep.`);
                return await dc.begin('b');
            },
            async function (dc, step) {
                assert(dc, `DialogContext not passed in to WaterfallStep.`);
                assert(step, `WaterfallStepContext not passed in to WaterfallStep.`);
                assert(dc.context.activity.text, 'begin', `unexpected message received.`);
                assert(step.result, `ended dialog.`, `unexpected step.result received.`);
                return await dc.end(true);
            }
        ]));

        dialogs.add(new WaterfallDialog('b', [
            async function (dc, step) {
                assert(dc, `DialogContext not passed in to WaterfallStep.`);
                assert(step, `WaterfallStepContext not passed in to WaterfallStep.`);
                return await dc.end('ended dialog.');
            }
        ]));

        adapter.send(beginMessage);
    });

    it(`should accept calls to end when no activeDialogs or parent dialogs exist.`, function (done) {
        const adapter = new TestAdapter(async (turnContext) => {
            const dc = await dialogs.createContext(turnContext);
            
            const results = await dc.end();
            assert.strictEqual(results.hasActive, false, `received true for results.hasActive (expected true).`);
            assert.strictEqual(results.hasResult, true, `received false for results.hasResult (expected true).`);
            assert.strictEqual(results.result, undefined, `received unexpected value for results.result (expected undefined).`);
            done();
        });

        const convoState = new ConversationState(new MemoryStorage());
        adapter.use(convoState);
        const dialogState = convoState.createProperty('dialogState');

        const dialogs = new DialogSet(dialogState);
        dialogs.add(new WaterfallDialog('a', [
            async function (dc, step) {
                assert(dc, `DialogContext not passed in to WaterfallStep.`);
                assert(step, `WaterfallStepContext not passed in to WaterfallStep.`);
                return await dc.replace('b', { z: step.options.z });
            }
        ]));

        adapter.send(beginMessage);
    });

    it(`should replace() dialog.`, function (done) {
        const adapter = new TestAdapter(async (turnContext) => {
            const dc = await dialogs.createContext(turnContext);
        
            const results = await dc.begin('a', { z: 'z' });
            assert.strictEqual(results.result, 'z', `received unexpected final result from dialog.`);
            done();
        });

        const convoState = new ConversationState(new MemoryStorage());
        adapter.use(convoState);
        const dialogState = convoState.createProperty('dialogState');

        const dialogs = new DialogSet(dialogState);
        dialogs.add(new WaterfallDialog('a', [
            async function (dc, step) {
                assert(dc, `DialogContext not passed in to WaterfallStep.`);
                assert(step, `WaterfallStepContext not passed in to WaterfallStep.`);
                return await dc.replace('b', { z: step.options.z });
            }
        ]));

        dialogs.add(new WaterfallDialog('b', [
            async function (dc, step) {
                assert(dc, `DialogContext not passed in to WaterfallStep.`);
                assert(step, `WaterfallStepContext not passed in to WaterfallStep.`);
                assert.strictEqual(dc.stack.length, 1, `current DialogContext.stack.length should be 1.`);
                assert.strictEqual(step.options.z, 'z', `incorrect step.options received.`);
                return await dc.end(step.options.z);
            }
        ]));

        adapter.send(beginMessage);
    });

    it(`should begin dialog if stack empty when replace() called with valid dialogId.`, function (done) {
        const adapter = new TestAdapter(async (turnContext) => {
            const dc = await dialogs.createContext(turnContext);

            const results = await dc.replace('b');
            done();
        });
        const convoState = new ConversationState(new MemoryStorage());
        adapter.use(convoState);
        const dialogState = convoState.createProperty('dialogState');

        const dialogs = new DialogSet(dialogState);
        dialogs.add(new WaterfallDialog('b', [
            async function (dc, step) {
                assert(dc, `DialogContext not passed in to WaterfallStep.`);
                assert(step, `WaterfallStepContext not passed in to WaterfallStep.`);
                return await dc.end();
            }
        ]));

        adapter.send(beginMessage);
    });
});
