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
});
