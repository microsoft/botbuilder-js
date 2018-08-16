const { BotState, BotStatePropertyAccessor, ConversationState, MemoryStorage, TestAdapter, TurnContext } = require('botbuilder-core');
const { AttachmentPrompt, DialogSet, DialogState, WaterfallDialog } =  require('../');
const assert = require('assert');

const answerMessage = { text: `here you go`, type: 'message', attachments: [{ contentType: 'test', content: 'test1' }] };
const invalidMessage = { text: `what?`, type: 'message' };

describe('AttachmentPrompt', function() {
    this.timeout(5000);

    it('should call AttachmentPrompt using dc.prompt().', function (done) {
        // Initialize TestAdapter.
        const adapter = new TestAdapter(async (turnContext) => {
            const dc = await dialogs.createContext(turnContext);

            const results = await dc.continue();
            if (!turnContext.responded && !results.hasActive && !results.hasResult) {
                await dc.prompt('prompt', { prompt: 'Please send an attachment.' });
            } else if (!results.hasActive && results.hasResult) {
                assert(Array.isArray(results.result) && results.result.length > 0);
                const attachment = results.result[0];
                await turnContext.sendActivity(`${attachment.content}`);
            }
        });

        // Create new ConversationState with MemoryStorage and register the state as middleware.
        const convoState = new ConversationState(new MemoryStorage());
        adapter.use(convoState);

        // Create a DialogState property, DialogSet and AttachmentPrompt.
        const dialogState = convoState.createProperty('dialogState');
        const dialogs = new DialogSet(dialogState);
        dialogs.add(new AttachmentPrompt('prompt'));
        
        adapter.send('Hello')
        .assertReply('Please send an attachment.')
        .send(answerMessage)
        .assertReply('test1');
        done();
    });

    it('should call AttachmentPrompt with custom validator.', function (done) {
        const adapter = new TestAdapter(async (turnContext) => {
            const dc = await dialogs.createContext(turnContext);

            const results = await dc.continue();
            if (!turnContext.responded && !results.hasActive && !results.hasResult) {
                await dc.prompt('prompt', { prompt: 'Please send an attachment.' });
            } else if (!results.hasActive && results.hasResult) {
                assert(Array.isArray(results.result) && results.result.length > 0);
                const attachment = results.result[0];
                await turnContext.sendActivity(`${attachment.content}`);
            }
        });

        const convoState = new ConversationState(new MemoryStorage());
        adapter.use(convoState);

        const dialogState = convoState.createProperty('dialogState');
        const dialogs = new DialogSet(dialogState);
        dialogs.add(new AttachmentPrompt('prompt', (context, prompt) => {
            assert(context);
            assert(prompt);
            prompt.end(prompt.recognized.value);
        }));
        
        adapter.send('Hello')
        .assertReply('Please send an attachment.')
        .send(answerMessage)
        .assertReply('test1');
        done();
    });

    it('should send custom retryPrompt.', function (done) {
        const adapter = new TestAdapter(async (turnContext) => {
            const dc = await dialogs.createContext(turnContext);

            const results = await dc.continue();
            if (!turnContext.responded && !results.hasActive && !results.hasResult) {
                await dc.prompt('prompt', { prompt: 'Please send an attachment.', retryPrompt: 'Please try again.' });
            } else if (!results.hasActive && results.hasResult) {
                assert(Array.isArray(results.result) && results.result.length > 0);
                const attachment = results.result[0];
                await turnContext.sendActivity(`${attachment.content}`);
            }
        });

        const convoState = new ConversationState(new MemoryStorage());
        adapter.use(convoState);

        const dialogState = convoState.createProperty('dialogState');
        const dialogs = new DialogSet(dialogState);
        dialogs.add(new AttachmentPrompt('prompt', (context, prompt) => {
            assert(context);
            assert(prompt);

            // If the base recognition logic found an attachment, end the prompt with the recognized value.
            if (prompt.recognized.succeeded && prompt.recognized.value) {
                prompt.end(prompt.recognized.value);
            }
        }));
        
        adapter.send('Hello')
        .assertReply('Please send an attachment.')
        .send(invalidMessage)
        .assertReply('Please try again.')
        .send(answerMessage)
        .assertReply('test1')
        done();
    });

    it('should send ignore retryPrompt if validator replies.', function (done) {
        const adapter = new TestAdapter(async (turnContext) => {
            const dc = await dialogs.createContext(turnContext);

            const results = await dc.continue();
            if (!turnContext.responded && !results.hasActive && !results.hasResult) {
                await dc.prompt('prompt', { prompt: 'Please send an attachment.', retryPrompt: 'Please try again.' });
            } else if (!results.hasActive && results.hasResult) {
                assert(Array.isArray(results.result) && results.result.length > 0);
                const attachment = results.result[0];
                await turnContext.sendActivity(`${attachment.content}`);
            }
        });

        const convoState = new ConversationState(new MemoryStorage());
        adapter.use(convoState);

        const dialogState = convoState.createProperty('dialogState');
        const dialogs = new DialogSet(dialogState);
        dialogs.add(new AttachmentPrompt('prompt', async (context, prompt) => {
            assert(context);
            assert(prompt);
            
            if (!prompt.recognized.value) {
                await context.sendActivity('Bad input.');
            } else {
                prompt.end(prompt.recognized.value);
            }
        }));
        
        adapter.send('Hello')
        .assertReply('Please send an attachment.')
        .send(invalidMessage)
        .assertReply('Bad input.')
        .send(answerMessage)
        .assertReply('test1')
        done();
    });

    it('should not send any retryPrompt if no prompt is specified.', function (done) {
        const adapter = new TestAdapter(async (turnContext) => {
            const dc = await dialogs.createContext(turnContext);

            const results = await dc.continue();
            if (!turnContext.responded && !results.hasActive && !results.hasResult) {
                await dc.begin('prompt');
            } else if (!results.hasActive && results.hasResult) {
                assert(Array.isArray(results.result) && results.result.length > 0);
                const attachment = results.result[0];
                await turnContext.sendActivity(`${attachment.content}`);
            }
        });

        const convoState = new ConversationState(new MemoryStorage());
        adapter.use(convoState);

        const dialogState = convoState.createProperty('dialogState');
        const dialogs = new DialogSet(dialogState);
        dialogs.add(new AttachmentPrompt('prompt'));
        
        adapter.send('Hello')
        .send('what?')
        .send(answerMessage)
        .assertReply('test1')
        done();
    });

});
