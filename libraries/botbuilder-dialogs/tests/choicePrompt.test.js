const { ActivityTypes, ConversationState, MemoryStorage, TestAdapter } = require('botbuilder-core');
const { ChoicePrompt, DialogSet,ListStyle, DialogTurnStatus } =  require('../');
const assert = require('assert');

const answerMessage = { text: `red`, type: 'message' };
const invalidMessage = { text: `purple`, type: 'message' };

const stringChoices = ['red', 'green', 'blue'];

describe('ChoicePrompt', function() {
    this.timeout(5000);

    it('should call ChoicePrompt using dc.prompt().', function (done) {
        // Initialize TestAdapter.
        const adapter = new TestAdapter(async (turnContext) => {
            const dc = await dialogs.createContext(turnContext);

            const results = await dc.continue();
            if (results.status === DialogTurnStatus.empty) {
                await dc.prompt('prompt', 'Please choose a color.', stringChoices);
            } else if (results.status === DialogTurnStatus.complete) {
                const selectedChoice = results.result;
                await turnContext.sendActivity(selectedChoice.value);
            }
        });
        // Create new ConversationState with MemoryStorage and register the state as middleware.
        const convoState = new ConversationState(new MemoryStorage());
        adapter.use(convoState);

        // Create a DialogState property, DialogSet and ChoicePrompt.
        const dialogState = convoState.createProperty('dialogState');
        const dialogs = new DialogSet(dialogState);
        const choicePrompt = new ChoicePrompt('prompt');
        // Change the ListStyle of the prompt to ListStyle.none.
        choicePrompt.style = ListStyle.none;

        dialogs.add(choicePrompt);

        adapter.send('Hello')
        .assertReply('Please choose a color.')
        .send(answerMessage)
        .assertReply('red');
        done();
    });

    it('should send a prompt and choices if they are passed in via PromptOptions.', function (done) {
        const adapter = new TestAdapter(async (turnContext) => {
            const dc = await dialogs.createContext(turnContext);

            const results = await dc.continue();
            if (results.status === DialogTurnStatus.empty) {
                await dc.prompt('prompt', { prompt: 'Please choose a color.', choices: stringChoices });
            } else if (results.status === DialogTurnStatus.complete) {
                const selectedChoice = results.result;
                await turnContext.sendActivity(selectedChoice.value);
            }
        });
        const convoState = new ConversationState(new MemoryStorage());
        adapter.use(convoState);

        const dialogState = convoState.createProperty('dialogState');
        const dialogs = new DialogSet(dialogState);
        const choicePrompt = new ChoicePrompt('prompt');
        choicePrompt.style = ListStyle.none;

        dialogs.add(choicePrompt);

        adapter.send('Hello')
        .assertReply('Please choose a color.')
        .send(answerMessage)
        .assertReply('red');
        done();
    });

    it('should call ChoicePrompt with custom validator.', function (done) {
        const adapter = new TestAdapter(async (turnContext) => {
            const dc = await dialogs.createContext(turnContext);

            const results = await dc.continue();
            if (results.status === DialogTurnStatus.empty) {
                await dc.prompt('prompt', 'Please choose a color.', stringChoices);
            } else if (results.status === DialogTurnStatus.complete) {
                const selectedChoice = results.result;
                await turnContext.sendActivity(selectedChoice.value);
            }
        });
        const convoState = new ConversationState(new MemoryStorage());
        adapter.use(convoState);

        const dialogState = convoState.createProperty('dialogState');
        const dialogs = new DialogSet(dialogState);
        const choicePrompt = new ChoicePrompt('prompt', async (context, prompt) => {
            assert(context);
            assert(prompt);
            if (prompt.recognized.succeeded) {
                prompt.end(prompt.recognized.value);
            }
        });
        choicePrompt.style = ListStyle.none;
        dialogs.add(choicePrompt);

        adapter.send('Hello')
        .assertReply('Please choose a color.')
        .send(invalidMessage)
        .assertReply('Please choose a color.')
        .send(answerMessage)
        .assertReply('red');
        done();
    });

    it('should send custom retryPrompt.', function (done) {
        const adapter = new TestAdapter(async (turnContext) => {
            const dc = await dialogs.createContext(turnContext);

            const results = await dc.continue();
            if (results.status === DialogTurnStatus.empty) {
                await dc.prompt('prompt', { prompt: 'Please choose a color.', retryPrompt: 'Please choose red, blue, or green.', choices: stringChoices });
            } else if (results.status === DialogTurnStatus.complete) {
                const selectedChoice = results.result;
                await turnContext.sendActivity(selectedChoice.value);
            }
        });
        const convoState = new ConversationState(new MemoryStorage());
        adapter.use(convoState);

        const dialogState = convoState.createProperty('dialogState');
        const dialogs = new DialogSet(dialogState);
        const choicePrompt = new ChoicePrompt('prompt');
        choicePrompt.style = ListStyle.none;
        dialogs.add(choicePrompt);

        adapter.send('Hello')
        .assertReply('Please choose a color.')
        .send(invalidMessage)
        .assertReply('Please choose red, blue, or green.')
        .send(answerMessage)
        .assertReply('red');
        done();
    });

    it('should send ignore retryPrompt if validator replies.', function (done) {
        const adapter = new TestAdapter(async (turnContext) => {
            const dc = await dialogs.createContext(turnContext);

            const results = await dc.continue();
            if (results.status === DialogTurnStatus.empty) {
                await dc.prompt('prompt', { prompt: 'Please choose a color.', retryPrompt: 'Please choose red, blue, or green.', choices: stringChoices });
            } else if (results.status === DialogTurnStatus.complete) {
                const selectedChoice = results.result;
                await turnContext.sendActivity(selectedChoice.value);
            }
        });
        const convoState = new ConversationState(new MemoryStorage());
        adapter.use(convoState);

        const dialogState = convoState.createProperty('dialogState');
        const dialogs = new DialogSet(dialogState);
        const choicePrompt = new ChoicePrompt('prompt', async (context, prompt) => {
            assert(context);
            assert(prompt);
            if (prompt.recognized.succeeded) {
                prompt.end(prompt.recognized.value);
            } else {
                await context.sendActivity('bad input.');
            }
        });
        choicePrompt.style = ListStyle.none;
        dialogs.add(choicePrompt);

        adapter.send('Hello')
        .assertReply('Please choose a color.')
        .send(invalidMessage)
        .assertReply('bad input.')
        .send(answerMessage)
        .assertReply('red');
        done();
    });

    it('should use defaultLocale when rendering choices', function (done) {
        const adapter = new TestAdapter(async (turnContext) => {
            const dc = await dialogs.createContext(turnContext);

            const results = await dc.continue();
            if (results.status === DialogTurnStatus.empty) {
                await dc.prompt('prompt', { prompt: 'Please choose a color.', choices: stringChoices });
            } else if (results.status === DialogTurnStatus.complete) {
                const selectedChoice = results.result;
                await turnContext.sendActivity(selectedChoice.value);
            }
        });
        const convoState = new ConversationState(new MemoryStorage());
        adapter.use(convoState);

        const dialogState = convoState.createProperty('dialogState');
        const dialogs = new DialogSet(dialogState);
        const choicePrompt = new ChoicePrompt('prompt', async (context, prompt) => {
            assert(context);
            assert(prompt);
            if (prompt.recognized.succeeded) {
                prompt.end(prompt.recognized.value);
            } else {
                await context.sendActivity('bad input.');
            }
        }, 'es-es');
        dialogs.add(choicePrompt);

        adapter.send({ text: 'Hello', type: ActivityTypes.Message })
        .assertReply('Please choose a color. (1) red, (2) green, o (3) blue')
        .send(invalidMessage)
        .assertReply('bad input.')
        .send({ text: 'red', type: ActivityTypes.Message })
        .assertReply('red');
        done();
    });

    it('should use context.activity.locale when rendering choices', function (done) {
        const adapter = new TestAdapter(async (turnContext) => {
            const dc = await dialogs.createContext(turnContext);

            const results = await dc.continue();
            if (results.status === DialogTurnStatus.empty) {
                await dc.prompt('prompt', { prompt: 'Please choose a color.', choices: stringChoices });
            } else if (results.status === DialogTurnStatus.complete) {
                const selectedChoice = results.result;
                await turnContext.sendActivity(selectedChoice.value);
            }
        });
        const convoState = new ConversationState(new MemoryStorage());
        adapter.use(convoState);

        const dialogState = convoState.createProperty('dialogState');
        const dialogs = new DialogSet(dialogState);
        const choicePrompt = new ChoicePrompt('prompt', async (context, prompt) => {
            assert(context);
            assert(prompt);
            if (prompt.recognized.succeeded) {
                prompt.end(prompt.recognized.value);
            } else {
                await context.sendActivity('bad input.');
            }
        });
        dialogs.add(choicePrompt);

        adapter.send({ text: 'Hello', type: ActivityTypes.Message, locale: 'es-es' })
        .assertReply('Please choose a color. (1) red, (2) green, o (3) blue')
        .send(answerMessage)
        .assertReply('red');
        done();
    });

    it('should use context.activity.locale over defaultLocale when rendering choices', function (done) {
        const adapter = new TestAdapter(async (turnContext) => {
            const dc = await dialogs.createContext(turnContext);

            const results = await dc.continue();
            if (results.status === DialogTurnStatus.empty) {
                await dc.prompt('prompt', { prompt: 'Please choose a color.', choices: stringChoices });
            } else if (results.status === DialogTurnStatus.complete) {
                const selectedChoice = results.result;
                await turnContext.sendActivity(selectedChoice.value);
            }
        });
        const convoState = new ConversationState(new MemoryStorage());
        adapter.use(convoState);

        const dialogState = convoState.createProperty('dialogState');
        const dialogs = new DialogSet(dialogState);
        const choicePrompt = new ChoicePrompt('prompt', async (context, prompt) => {
            assert(context);
            assert(prompt);
            if (prompt.recognized.succeeded) {
                prompt.end(prompt.recognized.value);
            } else {
                await context.sendActivity('bad input.');
            }
        }, 'es-es');
        dialogs.add(choicePrompt);

        adapter.send({ text: 'Hello', type: ActivityTypes.Message, locale: 'en-us' })
        .assertReply('Please choose a color. (1) red, (2) green, or (3) blue')
        .send(answerMessage)
        .assertReply('red');
        done();
    });
});
