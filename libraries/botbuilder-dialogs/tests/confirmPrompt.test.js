const {  BotState, BotStatePropertyAccessor, ConversationState, MemoryStorage, TestAdapter, TurnContext } = require('botbuilder-core');
const { ConfirmPrompt, DialogSet, DialogState, ListStyle, WaterfallDialog } =  require('../');
const assert = require('assert');

const beginMessage = { text: `begin`, type: 'message' };
const answerMessage = { text: `yes`, type: 'message' };
const invalidMessage = { text: `what?`, type: 'message' };

describe('prompts/ConfirmPrompt', function() {
    this.timeout(5000);

    it('should call ConfirmPrompt using dc.prompt().', function (done) {
        // Initialize TestAdapter.
        const adapter = new TestAdapter(async (turnContext) => {
            const dc = await dialogs.createContext(turnContext);

            const results = await dc.continue();
            if (!turnContext.responded && !results.hasActive && !results.hasResult) {
                await dc.prompt('prompt', { prompt: 'Please confirm.' });
            } else if (!results.hasActive && results.hasResult) {
                await turnContext.sendActivity(`The result found is '${results.result}'.`);
            }
        });

        // Create new ConversationState with MemoryStorage and register the state as middleware.
        const convoState = new ConversationState(new MemoryStorage());
        adapter.use(convoState);

        // Create a DialogState property, DialogSet and AttachmentPrompt.
        const dialogState = convoState.createProperty('dialogState');
        const dialogs = new DialogSet(dialogState);
        dialogs.add(new ConfirmPrompt('prompt'));

        adapter.send('Hello')
        .assertReply('Please confirm. (1) Yes or (2) No')
        .send('yes')
        .assertReply(`The result found is 'true'.`);
        done();
    });
    
    it('should call ConfirmPrompt with custom validator.', function (done) {
        const adapter = new TestAdapter(async (turnContext) => {
            const dc = await dialogs.createContext(turnContext);

            const results = await dc.continue();
            if (!turnContext.responded && !results.hasActive && !results.hasResult) {
                await dc.prompt('prompt', { prompt: 'Please confirm. Yes or No' });
            } else if (!results.hasActive && results.hasResult) {
                await turnContext.sendActivity(`The result found is '${results.result}'.`);
            }
        });

        const convoState = new ConversationState(new MemoryStorage());
        adapter.use(convoState);

        const dialogState = convoState.createProperty('dialogState');
        const dialogs = new DialogSet(dialogState);
        const confirmPrompt = new ConfirmPrompt('prompt', async (context, prompt) => {
            assert(context, `TurnContext not found.`);
            assert(prompt, `PromptValidatorContext not found.`);
            prompt.end(prompt.recognized.value);
        });
        confirmPrompt.style = ListStyle.none;
        dialogs.add(confirmPrompt);

        adapter.send('Hello')
        .assertReply('Please confirm. Yes or No')
        .send('no')
        .assertReply(`The result found is 'false'.`)
        done();
    });

    it('should send custom retryPrompt.', function (done) {
        const adapter = new TestAdapter(async (turnContext) => {
            const dc = await dialogs.createContext(turnContext);

            const results = await dc.continue();
            if (!turnContext.responded && !results.hasActive && !results.hasResult) {
                await dc.prompt('prompt', {
                    prompt: 'Please confirm. Yes or No',
                    retryPrompt: `Please reply with 'Yes' or 'No'.`
                });
            } else if (!results.hasActive && results.hasResult) {
                await turnContext.sendActivity(`The result found is '${results.result}'.`);
            }
        });

        const convoState = new ConversationState(new MemoryStorage());
        adapter.use(convoState);

        const dialogState = convoState.createProperty('dialogState');
        const dialogs = new DialogSet(dialogState);
        const confirmPrompt = new ConfirmPrompt('prompt');
        confirmPrompt.style = ListStyle.none;
        dialogs.add(confirmPrompt);


        adapter.send('Hello')
        .assertReply('Please confirm. Yes or No')
        .send('what?')
        .assertReply(`Please reply with 'Yes' or 'No'.`)
        .send('no')
        .assertReply(`The result found is 'false'.`)
        done();
    });

    it('should send custom retryPrompt if validator does not reply.', function (done) {
        const adapter = new TestAdapter(async (turnContext) => {
            const dc = await dialogs.createContext(turnContext);

            const results = await dc.continue();
            if (!turnContext.responded && !results.hasActive && !results.hasResult) {
                await dc.prompt('prompt', {
                    prompt: 'Please confirm. Yes or No',
                    retryPrompt: `Please reply with 'Yes' or 'No'.`
                });
            } else if (!results.hasActive && results.hasResult) {
                await turnContext.sendActivity(`The result found is '${results.result}'.`);
            }
        });

        const convoState = new ConversationState(new MemoryStorage());
        adapter.use(convoState);

        const dialogState = convoState.createProperty('dialogState');
        const dialogs = new DialogSet(dialogState);
        const confirmPrompt = new ConfirmPrompt('prompt', async (context, prompt) => {
            assert(context, `TurnContext not found.`);
            assert(prompt, `PromptValidatorContext not found.`);
            if (prompt.recognized.value !== undefined) {
                prompt.end(prompt.recognized.value);
            }
        });
        confirmPrompt.style = ListStyle.none;
        dialogs.add(confirmPrompt);


        adapter.send('Hello')
        .assertReply('Please confirm. Yes or No')
        .send('what?')
        .assertReply(`Please reply with 'Yes' or 'No'.`)
        .send('no')
        .assertReply(`The result found is 'false'.`)
        done();
    });

    it('should ignore retryPrompt if validator replies.', function (done) {
        const adapter = new TestAdapter(async (turnContext) => {
            const dc = await dialogs.createContext(turnContext);

            const results = await dc.continue();
            if (!turnContext.responded && !results.hasActive && !results.hasResult) {
                await dc.prompt('prompt', {
                    prompt: 'Please confirm. Yes or No',
                    retryPrompt: `Please reply with 'Yes' or 'No'.`
                });
            } else if (!results.hasActive && results.hasResult) {
                await turnContext.sendActivity(`The result found is '${results.result}'.`);
            }
        });

        const convoState = new ConversationState(new MemoryStorage());
        adapter.use(convoState);

        const dialogState = convoState.createProperty('dialogState');
        const dialogs = new DialogSet(dialogState);
        const confirmPrompt = new ConfirmPrompt('prompt', async (context, prompt) => {
            assert(context, `TurnContext not found.`);
            assert(prompt, `PromptValidatorContext not found.`);
            if (prompt.recognized.value === undefined) {
                await context.sendActivity('The correct response is either yes or no. Please choose one.')
            } else {
                prompt.end(prompt.recognized.value);
            }
        });
        confirmPrompt.style = ListStyle.none;
        dialogs.add(confirmPrompt);


        adapter.send('Hello')
        .assertReply('Please confirm. Yes or No')
        .send('what?')
        .assertReply('The correct response is either yes or no. Please choose one.')
        .send('no')
        .assertReply(`The result found is 'false'.`)
        done();
    });

    it('should not send any retryPrompt if no prompt is specified.', function (done) {
        const adapter = new TestAdapter(async (turnContext) => {
            const dc = await dialogs.createContext(turnContext);

            const results = await dc.continue();
            if (!turnContext.responded && !results.hasActive && !results.hasResult) {
                await dc.begin('prompt');
            } else if (!results.hasActive && results.hasResult) {
                await turnContext.sendActivity(`The result found is '${results.result}'.`);
            }
        });

        const convoState = new ConversationState(new MemoryStorage());
        adapter.use(convoState);

        const dialogState = convoState.createProperty('dialogState');
        const dialogs = new DialogSet(dialogState);
        const confirmPrompt = new ConfirmPrompt('prompt');
        confirmPrompt.style = ListStyle.none;
        dialogs.add(confirmPrompt);


        adapter.send('Hello')
        .assertReply('')
        .send('what?')
        .assertReply('')
        .send('no')
        .assertReply(`The result found is 'false'.`)
        done();
    });
});
