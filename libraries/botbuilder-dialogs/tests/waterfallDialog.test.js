const { ConversationState, MemoryStorage, TestAdapter, TurnContext } = require('botbuilder-core');
const { Dialog, DialogSet, WaterfallDialog } =  require('../');
const assert = require('assert');

const beginMessage = { text: `begin`, type: 'message' };

describe('WaterfallDialog', function() {
    this.timeout(5000);

    it('should execute a sequence of waterfall steps.', async function (done) {
        // Initialize TestAdapter.
        const adapter = new TestAdapter(async (turnContext) => {
            const dc = await dialogs.createContext(turnContext);
        
            const results = await dc.continue();
            if (!turnContext.responded && !results.hasActive && !results.hasResult) {
                await dc.begin('a');
            } else if (!results.hasActive && results.hasResult) {
                await turnContext.sendActivity(results.result);
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
            if (!turnContext.responded && !results.hasActive && !results.hasResult) {
                await dc.begin('a', { test: 'test' });
            } else if (!results.hasActive && results.hasResult) {
                await turnContext.sendActivity(`ended WaterfallDialog ["${results.result}"].`);
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
});
