const { ActivityTypes, BotState, BotStatePropertyAccessor, ConversationState, MemoryStorage, TestAdapter, TurnContext } = require('botbuilder-core');
const { AttachmentPrompt, DialogSet, DialogState, TextPrompt, WaterfallDialog } =  require('../');
const assert = require('assert');

const invalidMessage = { type: ActivityTypes.Message, text: '' };

describe('TextPrompt', function() {
    this.timeout(5000);

    it('should call TextPrompt using dc.prompt().', function (done) {
        // Initialize TestAdapter.
        const adapter = new TestAdapter(async (turnContext) => {
            const dc = await dialogs.createContext(turnContext);

            const results = await dc.continue();
            if (!turnContext.responded && !results.hasActive && !results.hasResult) {
                await dc.prompt('prompt', 'Please say something.');
            } else if (!results.hasActive && results.hasResult) {
                const reply = results.result;
                await turnContext.sendActivity(reply);
            }
        });
        // Create new ConversationState with MemoryStorage and register the state as middleware.
        const convoState = new ConversationState(new MemoryStorage());
        adapter.use(convoState);

        // Create a DialogState property, DialogSet and TextPrompt.
        const dialogState = convoState.createProperty('dialogState');
        const dialogs = new DialogSet(dialogState);
        dialogs.add(new TextPrompt('prompt'));

        adapter.send('Hello')
        .assertReply('Please say something.')
        .send('test')
        .assertReply('test');
        done();
    });
    
    it('should call TextPrompt with custom validator.', function (done) {
        const adapter = new TestAdapter(async (turnContext) => {
            const dc = await dialogs.createContext(turnContext);

            const results = await dc.continue();
            if (!turnContext.responded && !results.hasActive && !results.hasResult) {
                await dc.prompt('prompt', 'Please say something.');
            } else if (!results.hasActive && results.hasResult) {
                const reply = results.result;
                await turnContext.sendActivity(reply);
            }
        });

        const convoState = new ConversationState(new MemoryStorage());
        adapter.use(convoState);

        const dialogState = convoState.createProperty('dialogState');
        const dialogs = new DialogSet(dialogState);
        dialogs.add(new TextPrompt('prompt', async (context, prompt) => {
            assert(context);
            assert(prompt);
            if (prompt.recognized.value.length >= 3) {
                prompt.end(prompt.recognized.value);
            }
        }));

        adapter.send('Hello')
        .assertReply('Please say something.')
        .send('i')
        .assertReply('Please say something.')
        .send('test')
        .assertReply('test');
        done();
    });

    it('should send custom retryPrompt.', function (done) {
        const adapter = new TestAdapter(async (turnContext) => {
            const dc = await dialogs.createContext(turnContext);

            const results = await dc.continue();
            if (!turnContext.responded && !results.hasActive && !results.hasResult) {
                await dc.prompt('prompt', { prompt: 'Please say something.', retryPrompt: 'Text is required.' });
            } else if (!results.hasActive && results.hasResult) {
                const reply = results.result;
                await turnContext.sendActivity(reply);
            }
        });

        const convoState = new ConversationState(new MemoryStorage());
        adapter.use(convoState);

        const dialogState = convoState.createProperty('dialogState');
        const dialogs = new DialogSet(dialogState);
        dialogs.add(new TextPrompt('prompt'));

        adapter.send('Hello')
        .assertReply('Please say something.')
        .send(invalidMessage)
        .assertReply('Text is required.')
        .send('test')
        .assertReply('test');
        done();
    });

    it('should send ignore retryPrompt if validator replies.', function (done) {
        const adapter = new TestAdapter(async (turnContext) => {
            const dc = await dialogs.createContext(turnContext);

            const results = await dc.continue();
            if (!turnContext.responded && !results.hasActive && !results.hasResult) {
                await dc.prompt('prompt', { prompt: 'Please say something.', retryPrompt: 'Text is required.' });
            } else if (!results.hasActive && results.hasResult) {
                const reply = results.result;
                await turnContext.sendActivity(reply);
            }
        });

        const convoState = new ConversationState(new MemoryStorage());
        adapter.use(convoState);

        const dialogState = convoState.createProperty('dialogState');
        const dialogs = new DialogSet(dialogState);
        dialogs.add(new TextPrompt('prompt', async (context, prompt) => {
            assert(context);
            assert(prompt);
            if (prompt.recognized.value.length >= 3) {
                prompt.end(prompt.recognized.value);
            } else {
                await context.sendActivity('too short')
            }
        }));

        adapter.send('Hello')
        .assertReply('Please say something.')
        .send('i')
        .assertReply('too short')
        .send('test')
        .assertReply('test');
        done();
    });

    it('should not send any retryPrompt no prompt specified.', function (done) {
        const adapter = new TestAdapter(async (turnContext) => {
            const dc = await dialogs.createContext(turnContext);

            const results = await dc.continue();
            if (!turnContext.responded && !results.hasActive && !results.hasResult) {
                await dc.begin('prompt');
            } else if (!results.hasActive && results.hasResult) {
                const reply = results.result;
                await turnContext.sendActivity(reply);
            }
        });

        const convoState = new ConversationState(new MemoryStorage());
        adapter.use(convoState);

        const dialogState = convoState.createProperty('dialogState');
        const dialogs = new DialogSet(dialogState);
        dialogs.add(new TextPrompt('prompt'));

        adapter.send('Hello')
        .send(invalidMessage)
        .send('test')
        .assertReply('test');
        done();
    });
});
