const { ActivityTypes, BotState, BotStatePropertyAccessor, ConversationState, MemoryStorage, TestAdapter, TurnContext } = require('botbuilder-core');
const { DialogSet, DialogState, NumberPrompt, WaterfallDialog } =  require('../');
const assert = require('assert');

describe('NumberPrompt', function() {
    this.timeout(5000);
    it('should call NumberPrompt using dc.prompt().', function (done) {
        // Initialize TestAdapter.
        const adapter = new TestAdapter(async (turnContext) => {
            const dc = await dialogs.createContext(turnContext);

            const results = await dc.continue();
            if (!turnContext.responded && !results.hasActive && !results.hasResult) {
                await dc.prompt('prompt', 'Please send a number.');
            } else if (!results.hasActive && results.hasResult) {
                const reply = results.result.toString();
                await turnContext.sendActivity(reply);
            }
        });
        // Create new ConversationState with MemoryStorage and register the state as middleware.
        const convoState = new ConversationState(new MemoryStorage());
        adapter.use(convoState);

        // Create a DialogState property, DialogSet and NumberPrompt.
        const dialogState = convoState.createProperty('dialogState');
        const dialogs = new DialogSet(dialogState);
        dialogs.add(new NumberPrompt('prompt'));

        adapter.send('Hello')
        .assertReply('Please send a number.')
        .send('35')
        .assertReply('35');
        done();
    });
   
    it('should call NumberPrompt with custom validator.', function (done) {
        const adapter = new TestAdapter(async (turnContext) => {
            const dc = await dialogs.createContext(turnContext);

            const results = await dc.continue();
            if (!turnContext.responded && !results.hasActive && !results.hasResult) {
                await dc.prompt('prompt', 'Please send a number.');
            } else if (!results.hasActive && results.hasResult) {
                const reply = results.result.toString();
                await turnContext.sendActivity(reply);
            }
        });

        const convoState = new ConversationState(new MemoryStorage());
        adapter.use(convoState);

        const dialogState = convoState.createProperty('dialogState');
        const dialogs = new DialogSet(dialogState);
        dialogs.add(new NumberPrompt('prompt', async (context, prompt) => {
            assert(context);
            assert(prompt);
            let value = prompt.recognized.value;
            const valid = value !== undefined && value >= 1 && value <= 100;
            if (valid) {
                prompt.end(value);
            }
        }));

        adapter.send('Hello')
        .assertReply('Please send a number.')
        .send('0')
        .assertReply('Please send a number.')
        .send('25')
        .assertReply('25')
        done();
    });

    it('should send custom retryPrompt.', function (done) {
        const adapter = new TestAdapter(async (turnContext) => {
            const dc = await dialogs.createContext(turnContext);

            const results = await dc.continue();
            if (!turnContext.responded && !results.hasActive && !results.hasResult) {
                await dc.prompt('prompt', { prompt: 'Please send a number.', retryPrompt: 'Please send a number between 1 and 100.' });
            } else if (!results.hasActive && results.hasResult) {
                const reply = results.result.toString();
                await turnContext.sendActivity(reply);
            }
        });

        const convoState = new ConversationState(new MemoryStorage());
        adapter.use(convoState);

        const dialogState = convoState.createProperty('dialogState');
        const dialogs = new DialogSet(dialogState);
        dialogs.add(new NumberPrompt('prompt', async (context, prompt) => {
            assert(context);
            assert(prompt);
            let value = prompt.recognized.value;
            const valid = value !== undefined && value >= 1 && value <= 100;
            if (valid) {
                prompt.end(value);
            }
        }));

        adapter.send('Hello')
        .assertReply('Please send a number.')
        .send('0')
        .assertReply('Please send a number between 1 and 100.')
        .send('42')
        .assertReply('42')
        done();
    });

    it('should send ignore retryPrompt if validator replies.', function (done) {
        const adapter = new TestAdapter(async (turnContext) => {
            const dc = await dialogs.createContext(turnContext);

            const results = await dc.continue();
            if (!turnContext.responded && !results.hasActive && !results.hasResult) {
                await dc.prompt('prompt', { prompt: 'Please send a number.', retryPrompt: 'Please send a number between 1 and 100.' });
            } else if (!results.hasActive && results.hasResult) {
                const reply = results.result.toString();
                await turnContext.sendActivity(reply);
            }
        });

        const convoState = new ConversationState(new MemoryStorage());
        adapter.use(convoState);

        const dialogState = convoState.createProperty('dialogState');
        const dialogs = new DialogSet(dialogState);
        dialogs.add(new NumberPrompt('prompt', async (context, prompt) => {
            assert(context);
            assert(prompt);
            let value = prompt.recognized.value;
            const valid = value !== undefined && value >= 1 && value <= 100;
            if (valid) {
                prompt.end(value);
            } else {
                await context.sendActivity('out of range');
            }
        }));

        adapter.send('Hello')
        .assertReply('Please send a number.')
        .send('-1')
        .assertReply('out of range')
        .send('67')
        .assertReply('67')
        done();
    });

    it('should not send any retryPrompt no prompt specified.', function (done) {
        const adapter = new TestAdapter(async (turnContext) => {
            const dc = await dialogs.createContext(turnContext);

            const results = await dc.continue();
            if (!turnContext.responded && !results.hasActive && !results.hasResult) {
                await dc.begin('prompt');
            } else if (!results.hasActive && results.hasResult) {
                const reply = results.result.toString();
                await turnContext.sendActivity(reply);
            }
        });

        const convoState = new ConversationState(new MemoryStorage());
        adapter.use(convoState);

        const dialogState = convoState.createProperty('dialogState');
        const dialogs = new DialogSet(dialogState);
        dialogs.add(new NumberPrompt('prompt', async (context, prompt) => {
            assert(context);
            assert(prompt);
            let value = prompt.recognized.value;
            const valid = value !== undefined && value >= 1 && value <= 100;
            if (valid) {
                prompt.end(value);
            }
        }));

        adapter.send('Hello')
        .send('0')
        .send('25')
        .assertReply('25')
        done();
    });
});
