const { ConversationState, MemoryStorage, TestAdapter } = require('botbuilder-core');
const { Dialog, DialogSet, WaterfallDialog, DialogTurnStatus } =  require('../');

const assert = require('assert');

const beginMessage = { text: `begin`, type: 'message' };

describe('WaterfallDialog', function () {
    this.timeout(5000);

    it('should execute a sequence of waterfall steps.', async function (done) {
        // Initialize TestAdapter.
        const adapter = new TestAdapter(async (turnContext) => {
            const dc = await dialogs.createContext(turnContext);

            const results = await dc.continue();
            switch (results.status) {
                case DialogTurnStatus.empty:
                    await dc.begin('a');
                    break;

                case DialogTurnStatus.complete:
                    await turnContext.sendActivity(results.result);
                    break;
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
                assert(dc);
                assert(step, 'hey!');
                await dc.context.sendActivity('bot responding.');
                return Dialog.EndOfTurn;
            },
            async function (dc, step) {
                assert(dc);
                assert(step);
                return await dc.end('ending WaterfallDialog.');
            }
        ]));

        adapter.send(beginMessage)
            .assertReply('bot responding.')
            .send('continue')
            .assertReply('ending WaterfallDialog.')
        done();
    });

    it('should support calling next() to move to next steps.', async function (done) {
        const adapter = new TestAdapter(async (turnContext) => {
            const dc = await dialogs.createContext(turnContext);

            const results = await dc.continue();
            switch (results.status) {
                case DialogTurnStatus.empty:
                    await dc.begin('a', { test: 'test' });
                    break;

                case DialogTurnStatus.complete:
                    await turnContext.sendActivity(`ended WaterfallDialog ["${results.result}"].`);
                    break;
            }
        });

        const convoState = new ConversationState(new MemoryStorage());
        adapter.use(convoState);

        const dialogState = convoState.createProperty('dialogState');
        const dialogs = new DialogSet(dialogState);
        dialogs.add(new WaterfallDialog('a', [
            async function (dc, step) {
                assert(dc);
                assert(step.options && step.options.test === 'test', `step.options not found.`);
                await dc.context.sendActivity('bot responding.');
                return Dialog.EndOfTurn;
            },
            async function (dc, step) {
                assert(dc);
                assert(step);
                return await dc.end(step.result);
            }
        ]));

        adapter.send(beginMessage)
            .assertReply('bot responding.')
            .send('test-test')
            .assertReply('ended WaterfallDialog ["test-test"].')
        done();
    });

    it('should support receive options via `step.options`.', async function (done) {
        const adapter = new TestAdapter(async (turnContext) => {
            const dc = await dialogs.createContext(turnContext);

            const results = await dc.continue();
            switch (results.status) {
                case (DialogTurnStatus.empty):
                    await dc.begin('a', { test: 'test' });
                    break;
                case (DialogTurnStatus.complete):
                    await turnContext.sendActivity(results.result);
                    break;
            }
        });

        const convoState = new ConversationState(new MemoryStorage());
        adapter.use(convoState);

        const dialogState = convoState.createProperty('dialogState');
        const dialogs = new DialogSet(dialogState);
        dialogs.add(new WaterfallDialog('a', [
            async function (dc, step) {
                assert(dc, `dc not found.`);
                assert(step, `step not found.`);
                assert(step.options, `step.options not found.`);
                assert.strictEqual(step.options.test,
                    'test',
                    `step.options.test "${step.options.test}", was not expected value of "test".`);
                await dc.context.sendActivity('bot responding.');
                return Dialog.EndOfTurn;
            },
            async function (dc, step) {
                assert(dc);
                assert(step);
                return await dc.end('ending WaterfallDialog.');
            }
        ]));

        adapter.send(beginMessage)
            .assertReply('bot responding.')
            .send('continue')
            .assertReply('ending WaterfallDialog.')
        done();
    });

    it('should allow changing of `step.options` and persist changes across steps.', async function (done) {
        const adapter = new TestAdapter(async (turnContext) => {
            const dc = await dialogs.createContext(turnContext);

            const results = await dc.continue();
            switch (results.status) {
                case (DialogTurnStatus.empty):
                    await dc.begin('a', { test: 'test1' });
                    break;
                case (DialogTurnStatus.complete):
                    await turnContext.sendActivity(results.result);
                    break;
            }
        });

        const convoState = new ConversationState(new MemoryStorage());
        adapter.use(convoState);

        const dialogState = convoState.createProperty('dialogState');
        const dialogs = new DialogSet(dialogState);
        dialogs.add(new WaterfallDialog('a', [
            async function (dc, step) {
                assert(dc, `dc not found.`);
                assert(step, `step not found.`);
                assert(step.options, `step.options not found.`);
                assert.strictEqual(step.options.test,
                    'test1',
                    `step.options.test "${step.options.test}", was not expected value of "test1".`);
                step.options.test = 'test2';
                await dc.context.sendActivity('bot responding.');
                return Dialog.EndOfTurn;
            },
            async function (dc, step) {
                assert(dc, `dc not found.`);
                assert(step, `step not found.`);
                assert(step.options, `step.options not found.`);
                assert.strictEqual(step.options.test,
                    'test2',
                    `step.options.test "${step.options.test}", was not expected value of "test2".`);
                step.options.test = 'test3';
                await dc.context.sendActivity('bot responding again.');
                return Dialog.EndOfTurn;
            },
            async function (dc, step) {
                assert(dc, `dc not found.`);
                assert(step, `step not found.`);
                assert.strictEqual(step.options.test,
                    'test3',
                    `step.options.test "${step.options.test}", was not expected value of "test3".`);
                return await dc.end('ending WaterfallDialog.');
            }
        ]));

        adapter.send(beginMessage)
            .assertReply('bot responding.')
            .send('continue')
            .assertReply('bot responding again.')
            .send('continue again')
            .assertReply('ending WaterfallDialog.')
        done();
    });

    it('should allow setting of step.values and persist values across steps.', async function (done) {
        const adapter = new TestAdapter(async (turnContext) => {
            const dc = await dialogs.createContext(turnContext);

            const results = await dc.continue();
            switch (results.status) {
                case (DialogTurnStatus.empty):
                    await dc.begin('a');
                    break;
                case (DialogTurnStatus.complete):
                    await turnContext.sendActivity(results.result);
                    break;
            }
        });

        const convoState = new ConversationState(new MemoryStorage());
        adapter.use(convoState);

        const dialogState = convoState.createProperty('dialogState');
        const dialogs = new DialogSet(dialogState);
        dialogs.add(new WaterfallDialog('a', [
            async function (dc, step) {
                assert(dc, `dc not found.`);
                assert(step, `step not found.`);
                assert.equal(typeof step.values, 'object', `initial step.values should be an object.`);
                step.values.test = 'test1'
                await dc.context.sendActivity('bot responding.');
                return Dialog.EndOfTurn;
            },
            async function (dc, step) {
                assert(dc, `dc not found.`);
                assert(step, `step not found.`);
                assert(step.values, `step.values not found.`);
                assert.strictEqual(step.values.test,
                    'test1',
                    `step.values.test ["${step.values.test}"] was not expected value "test1".`);
                step.values.test2 = 'test2';
                await dc.context.sendActivity('bot responding again.');
                return Dialog.EndOfTurn;
            },
            async function (dc, step) {
                assert(dc, `dc not found.`);
                assert(step, `step not found.`);
                assert(step.values, `step.values not found.`);
                assert.strictEqual(step.values.test,
                    'test1',
                    `step.values.test ["${step.values.test}"] was not expected value "test1".`);
                assert.strictEqual(step.values.test2,
                    'test2',
                    `step.values.test2 ["${step.values.test2}"] was not expected value "test2".`);
                return await dc.end('ending WaterfallDialog.');
            }
        ]));

        adapter.send(beginMessage)
            .assertReply('bot responding.')
            .send('continue')
            .assertReply('bot responding again.')
            .send('continue again')
            .assertReply('ending WaterfallDialog.')
        done();
    });

    it('should not move step.values from one WaterfallDialog to another.', async function (done) {
        const adapter = new TestAdapter(async (turnContext) => {
            const dc = await dialogs.createContext(turnContext);

            const results = await dc.continue();
            switch (results.status) {
                case (DialogTurnStatus.empty):
                    await dc.begin('a');
                    break;
                case (DialogTurnStatus.complete):
                    await turnContext.sendActivity(results.result);
                    break;
            }
        });

        const convoState = new ConversationState(new MemoryStorage());
        adapter.use(convoState);

        const dialogState = convoState.createProperty('dialogState');
        const dialogs = new DialogSet(dialogState);
        dialogs.add(new WaterfallDialog('a', [
            async function (dc, step) {
                assert(dc, `dc not found.`);
                assert(step, `step not found.`);
                assert.equal(typeof step.values, 'object', `initial step.values should be an object.`);
                step.values.test = 'test1';
                await dc.context.sendActivity('bot responding.');
                return await dc.begin('b');
            },
            async function (dc, step) {
                assert(dc, `dc not found.`);
                assert(step, `step not found.`);
                assert(step.values, `step.values not found.`);
                assert.strictEqual(step.values.test,
                    'test1',
                    `step.values.test ["${step.values.test}"] was not expected value "test1".`);
                assert.strictEqual(step.values.test_b,
                    undefined,
                    `step.values.test_b should not be available in WaterfallDialog('a').`);
                return await dc.end('ending WaterfallDialog.');
            }
        ]));

        dialogs.add(new WaterfallDialog('b', [
            async function (dc, step) {
                assert(dc, `dc not found.`);
                assert(step, `step not found.`);
                assert.equal(typeof step.values, 'object', `new step.values for second WaterfallDialog should be an object.`);
                assert(!step.values.hasOwnProperty('test'), `new WaterfallDialog's step.values shouldn't have values from parent dialog's step.values.`);
                
                // Add a new value to this WaterfallDialog's step.values.
                // This value should not be available to this dialog's parent.
                step.values.test_b = 'test_b';
                return Dialog.EndOfTurn;
            },
            async function (dc, step) {
                assert(dc, `dc not found.`);
                assert(step, `step not found.`);
                assert.equal(typeof step.values, 'object', `step.values for second WaterfallDialog should be an object.`);
                assert(!step.values.hasOwnProperty('test'), `new WaterfallDialog's step.values shouldn't have values from parent dialog's step.values.`);
                assert.strictEqual(step.values.test_b,
                    'test_b',
                    `step.values.test_b should not be available in WaterfallDialog 'a'.`);
                
                return await dc.end();
            }
        ]))

        adapter.send(beginMessage)
            .assertReply('bot responding.')
            .send('continue')
            .assertReply('ending WaterfallDialog.');
        done();
    });
    
    it('should not move step.options from one WaterfallDialog to another.', async function (done) {
        const adapter = new TestAdapter(async (turnContext) => {
            const dc = await dialogs.createContext(turnContext);

            const results = await dc.continue();
            switch (results.status) {
                case (DialogTurnStatus.empty):
                    await dc.begin('a', { test_a: 'test_a' });
                    break;
                case (DialogTurnStatus.complete):
                    await turnContext.sendActivity(results.result);
                    break;
            }
        });

        const convoState = new ConversationState(new MemoryStorage());
        adapter.use(convoState);

        const dialogState = convoState.createProperty('dialogState');
        const dialogs = new DialogSet(dialogState);
        dialogs.add(new WaterfallDialog('a', [
            async function (dc, step) {
                assert(dc, `dc not found.`);
                assert(step, `step not found.`);
                assert(step.options, `step.options not found.`);
                assert.strictEqual(step.options.test_a,
                    'test_a',
                    `step.options.test_a "${step.options.test_a}", was not expected value of "test_a".`);
                await dc.context.sendActivity('bot responding.');
                return await dc.begin('b');
            },
            async function (dc, step) {
                assert(dc, `dc not found.`);
                assert(step, `step not found.`);
                assert(step.options, `step.options not found.`);
                assert.strictEqual(step.options.test_a,
                    'test_a',
                    `step.options.test_a "${step.options.test_a}", was not expected value of "test_a".`);
                return await dc.end('ending WaterfallDialog.');
            }
        ]));

        dialogs.add(new WaterfallDialog('b', [
            async function (dc, step) {
                assert(dc, `dc not found.`);
                assert(step, `step not found.`);
                assert(step.options, `step.options not found.`);
                assert.strictEqual(step.options.test_a,
                    undefined,
                    `step.options.test_a "${step.options.test_a}", was not expected value of "undefined".`);
                    step.options.test_b = 'test_b';
                return Dialog.EndOfTurn;
            },
            async function (dc, step) {
                assert(dc, `dc not found.`);
                assert(step, `step not found.`);
                assert(step.options, `step.options not found.`);
                assert.strictEqual(step.options.test_b,
                    'test_b',
                    `step.options.test_b "${step.options.test_b}", was not expected value of "test_b".`)
                return await dc.end();
            }
        ]))

        adapter.send(beginMessage)
            .assertReply('bot responding.')
            .send('continue')
            .assertReply('ending WaterfallDialog.');
        done();
    });
});
