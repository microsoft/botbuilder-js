const { ActivityTypes, ConversationState, MemoryStorage, TestAdapter } = require('botbuilder-core');
const { ChoicePrompt, DialogSet, ListStyle, DialogTurnStatus } = require('../');
const assert = require('assert');

const answerMessage = { text: `red`, type: 'message' };
const invalidMessage = { text: `purple`, type: 'message' };

const stringChoices = ['red', 'green', 'blue'];

describe('ChoicePrompt', function () {
    this.timeout(5000);

    it('should call ChoicePrompt using dc.prompt().', async function () {
        // Initialize TestAdapter.
        const adapter = new TestAdapter(async (turnContext) => {
            const dc = await dialogs.createContext(turnContext);

            const results = await dc.continueDialog();
            if (results.status === DialogTurnStatus.empty) {
                await dc.prompt('prompt', 'Please choose a color.', stringChoices);
            } else if (results.status === DialogTurnStatus.complete) {
                const selectedChoice = results.result;
                await turnContext.sendActivity(selectedChoice.value);
            }
            await convoState.saveChanges(turnContext);
        });
        // Create new ConversationState with MemoryStorage and register the state as middleware.
        const convoState = new ConversationState(new MemoryStorage());

        // Create a DialogState property, DialogSet and ChoicePrompt.
        const dialogState = convoState.createProperty('dialogState');
        const dialogs = new DialogSet(dialogState);
        const choicePrompt = new ChoicePrompt('prompt');
        // Change the ListStyle of the prompt to ListStyle.none.
        choicePrompt.style = ListStyle.none;

        dialogs.add(choicePrompt);

        await adapter.send('Hello')
            .assertReply('Please choose a color.')
            .send(answerMessage)
            .assertReply('red');
    });

    it('should send a prompt and choices if they are passed in via PromptOptions.', async function () {
        const adapter = new TestAdapter(async (turnContext) => {
            const dc = await dialogs.createContext(turnContext);

            const results = await dc.continueDialog();
            if (results.status === DialogTurnStatus.empty) {
                await dc.prompt('prompt', { prompt: 'Please choose a color.', choices: stringChoices });
            } else if (results.status === DialogTurnStatus.complete) {
                const selectedChoice = results.result;
                await turnContext.sendActivity(selectedChoice.value);
            }
            await convoState.saveChanges(turnContext);
        });
        const convoState = new ConversationState(new MemoryStorage());

        const dialogState = convoState.createProperty('dialogState');
        const dialogs = new DialogSet(dialogState);
        const choicePrompt = new ChoicePrompt('prompt');
        choicePrompt.style = ListStyle.none;

        dialogs.add(choicePrompt);

        await adapter.send('Hello')
            .assertReply('Please choose a color.')
            .send(answerMessage)
            .assertReply('red');
    });

    it('should call ChoicePrompt with custom validator.', async function () {
        const adapter = new TestAdapter(async (turnContext) => {
            const dc = await dialogs.createContext(turnContext);

            const results = await dc.continueDialog();
            if (results.status === DialogTurnStatus.empty) {
                await dc.prompt('prompt', 'Please choose a color.', stringChoices);
            } else if (results.status === DialogTurnStatus.complete) {
                const selectedChoice = results.result;
                await turnContext.sendActivity(selectedChoice.value);
            }
            await convoState.saveChanges(turnContext);
        });
        const convoState = new ConversationState(new MemoryStorage());

        const dialogState = convoState.createProperty('dialogState');
        const dialogs = new DialogSet(dialogState);
        const choicePrompt = new ChoicePrompt('prompt', async (prompt) => {
            assert(prompt);
            return prompt.recognized.succeeded;
        });
        choicePrompt.style = ListStyle.none;
        dialogs.add(choicePrompt);

        await adapter.send('Hello')
            .assertReply('Please choose a color.')
            .send(invalidMessage)
            .assertReply('Please choose a color.')
            .send(answerMessage)
            .assertReply('red');
    });

    it('should convert incomplete Choices with `action` when using ListStyle.suggestedAction styling.', async function () {
        const adapter = new TestAdapter(async (turnContext) => {
            const dc = await dialogs.createContext(turnContext);

            const results = await dc.continueDialog();
            if (results.status === DialogTurnStatus.empty) {
                await dc.prompt('prompt', 'Please choose a color.', stringChoices.map(choice => {
                    return { value: choice, action: {} }
                }));
            } else if (results.status === DialogTurnStatus.complete) {
                const selectedChoice = results.result;
                await turnContext.sendActivity(selectedChoice.value);
            }
            await convoState.saveChanges(turnContext);
        });
        const convoState = new ConversationState(new MemoryStorage());

        const dialogState = convoState.createProperty('dialogState');
        const dialogs = new DialogSet(dialogState);
        const choicePrompt = new ChoicePrompt('prompt', async (prompt) => {
            assert(prompt);
            return prompt.recognized.succeeded;
        });
        choicePrompt.style = ListStyle.suggestedAction;
        dialogs.add(choicePrompt);

        await adapter.send('Hello')
            .assertReply('Please choose a color.')
            .send(invalidMessage)
            .assertReply('Please choose a color.')
            .send(answerMessage)
            .assertReply('red');
    });

    it('should send custom retryPrompt.', async function () {
        const adapter = new TestAdapter(async (turnContext) => {
            const dc = await dialogs.createContext(turnContext);

            const results = await dc.continueDialog();
            if (results.status === DialogTurnStatus.empty) {
                await dc.prompt('prompt', { prompt: 'Please choose a color.', retryPrompt: 'Please choose red, blue, or green.', choices: stringChoices });
            } else if (results.status === DialogTurnStatus.complete) {
                const selectedChoice = results.result;
                await turnContext.sendActivity(selectedChoice.value);
            }
            await convoState.saveChanges(turnContext);
        });
        const convoState = new ConversationState(new MemoryStorage());

        const dialogState = convoState.createProperty('dialogState');
        const dialogs = new DialogSet(dialogState);
        const choicePrompt = new ChoicePrompt('prompt');
        choicePrompt.style = ListStyle.none;
        dialogs.add(choicePrompt);

        await adapter.send('Hello')
            .assertReply('Please choose a color.')
            .send(invalidMessage)
            .assertReply('Please choose red, blue, or green.')
            .send(answerMessage)
            .assertReply('red');
    });

    it('should send ignore retryPrompt if validator replies.', async function () {
        const adapter = new TestAdapter(async (turnContext) => {
            const dc = await dialogs.createContext(turnContext);

            const results = await dc.continueDialog();
            if (results.status === DialogTurnStatus.empty) {
                await dc.prompt('prompt', { prompt: 'Please choose a color.', retryPrompt: 'Please choose red, blue, or green.', choices: stringChoices });
            } else if (results.status === DialogTurnStatus.complete) {
                const selectedChoice = results.result;
                await turnContext.sendActivity(selectedChoice.value);
            }
            await convoState.saveChanges(turnContext);
        });
        const convoState = new ConversationState(new MemoryStorage());

        const dialogState = convoState.createProperty('dialogState');
        const dialogs = new DialogSet(dialogState);
        const choicePrompt = new ChoicePrompt('prompt', async (prompt) => {
            assert(prompt);
            if (!prompt.recognized.succeeded) {
                await prompt.context.sendActivity('bad input.');
            }
            return prompt.recognized.succeeded;
        });
        choicePrompt.style = ListStyle.none;
        dialogs.add(choicePrompt);

        await adapter.send('Hello')
            .assertReply('Please choose a color.')
            .send(invalidMessage)
            .assertReply('bad input.')
            .send(answerMessage)
            .assertReply('red');
    });

    it('should use defaultLocale when rendering choices', async function () {
        const adapter = new TestAdapter(async (turnContext) => {
            const dc = await dialogs.createContext(turnContext);

            const results = await dc.continueDialog();
            if (results.status === DialogTurnStatus.empty) {
                await dc.prompt('prompt', { prompt: 'Please choose a color.', choices: stringChoices });
            } else if (results.status === DialogTurnStatus.complete) {
                const selectedChoice = results.result;
                await turnContext.sendActivity(selectedChoice.value);
            }
            await convoState.saveChanges(turnContext);
        });
        const convoState = new ConversationState(new MemoryStorage());

        const dialogState = convoState.createProperty('dialogState');
        const dialogs = new DialogSet(dialogState);
        const choicePrompt = new ChoicePrompt('prompt', async (prompt) => {
            assert(prompt);
            if (!prompt.recognized.succeeded) {
                await prompt.context.sendActivity('bad input.');
            }
            return prompt.recognized.succeeded;
        }, 'es-es');
        dialogs.add(choicePrompt);

        await adapter.send({ text: 'Hello', type: ActivityTypes.Message })
            .assertReply('Please choose a color. (1) red, (2) green, o (3) blue')
            .send(invalidMessage)
            .assertReply('bad input.')
            .send({ text: 'red', type: ActivityTypes.Message })
            .assertReply('red');
    });

    it('should use context.activity.locale when rendering choices', async function () {
        const adapter = new TestAdapter(async (turnContext) => {
            const dc = await dialogs.createContext(turnContext);

            const results = await dc.continueDialog();
            if (results.status === DialogTurnStatus.empty) {
                await dc.prompt('prompt', { prompt: 'Please choose a color.', choices: stringChoices });
            } else if (results.status === DialogTurnStatus.complete) {
                const selectedChoice = results.result;
                await turnContext.sendActivity(selectedChoice.value);
            }
            await convoState.saveChanges(turnContext);
        });
        const convoState = new ConversationState(new MemoryStorage());

        const dialogState = convoState.createProperty('dialogState');
        const dialogs = new DialogSet(dialogState);
        const choicePrompt = new ChoicePrompt('prompt', async (prompt) => {
            assert(prompt);
            if (!prompt.recognized.succeeded) {
                await prompt.context.sendActivity('bad input.');
            }
            return prompt.recognized.succeeded;
        });
        dialogs.add(choicePrompt);

        await adapter.send({ text: 'Hello', type: ActivityTypes.Message, locale: 'es-es' })
            .assertReply('Please choose a color. (1) red, (2) green, o (3) blue')
            .send(answerMessage)
            .assertReply('red');
    });

    it('should use context.activity.locale over defaultLocale when rendering choices', async function () {
        const adapter = new TestAdapter(async (turnContext) => {
            const dc = await dialogs.createContext(turnContext);

            const results = await dc.continueDialog();
            if (results.status === DialogTurnStatus.empty) {
                await dc.prompt('prompt', { prompt: 'Please choose a color.', choices: stringChoices });
            } else if (results.status === DialogTurnStatus.complete) {
                const selectedChoice = results.result;
                await turnContext.sendActivity(selectedChoice.value);
            }
            await convoState.saveChanges(turnContext);
        });
        const convoState = new ConversationState(new MemoryStorage());

        const dialogState = convoState.createProperty('dialogState');
        const dialogs = new DialogSet(dialogState);
        const choicePrompt = new ChoicePrompt('prompt', async (prompt) => {
            assert(prompt);
            if (!prompt.recognized.succeeded) {
                await prompt.context.sendActivity('bad input.');
            }
            return prompt.recognized.succeeded;
        }, 'es-es');
        dialogs.add(choicePrompt);

        await adapter.send({ text: 'Hello', type: ActivityTypes.Message, locale: 'en-us' })
            .assertReply('Please choose a color. (1) red, (2) green, or (3) blue')
            .send(answerMessage)
            .assertReply('red');
    });

    it('should not render choices and not blow up if choices aren\'t passed in', async function () {
        const adapter = new TestAdapter(async (turnContext) => {
            const dc = await dialogs.createContext(turnContext);

            const results = await dc.continueDialog();
            if (results.status === DialogTurnStatus.empty) {
                await dc.prompt('prompt', { prompt: 'Please choose a color.', choices: undefined });
            } else if (results.status === DialogTurnStatus.complete) {
                const selectedChoice = results.result;
                await turnContext.sendActivity(selectedChoice.value);
            }
            await convoState.saveChanges(turnContext);
        });
        const convoState = new ConversationState(new MemoryStorage());

        const dialogState = convoState.createProperty('dialogState');
        const dialogs = new DialogSet(dialogState);
        const choicePrompt = new ChoicePrompt('prompt');
        choicePrompt.style = ListStyle.none;

        dialogs.add(choicePrompt);

        await adapter.send('Hello')
            .assertReply('Please choose a color.');
    });

    it('should not recognize if choices are not passed in.', async function () {
        const adapter = new TestAdapter(async (turnContext) => {
            const dc = await dialogs.createContext(turnContext);

            const results = await dc.continueDialog();
            if (results.status === DialogTurnStatus.empty) {
                await dc.prompt('prompt', { prompt: 'Please choose a color.', choices: undefined });
            } else if (results.status === DialogTurnStatus.complete) {
                const selectedChoice = results.result;
                await turnContext.sendActivity(selectedChoice.value);
            }
            await convoState.saveChanges(turnContext);
        });
        const convoState = new ConversationState(new MemoryStorage());

        const dialogState = convoState.createProperty('dialogState');
        const dialogs = new DialogSet(dialogState);
        const choicePrompt = new ChoicePrompt('prompt');
        choicePrompt.style = ListStyle.none;

        dialogs.add(choicePrompt);

        await adapter.send('Hello')
            .assertReply('Please choose a color.')
            .send('hello')
            .assertReply('Please choose a color.');
    });

    it('should use a Partial Activity when calculating message text during appendChoices.', async function () {
        const adapter = new TestAdapter(async (turnContext) => {
            const dc = await dialogs.createContext(turnContext);

            const results = await dc.continueDialog();
            if (results.status === DialogTurnStatus.empty) {
                await dc.prompt('prompt',
                    {
                        prompt: { text: 'Please choose a color.', type: ActivityTypes.Message },
                        choices: stringChoices
                    });
            } else if (results.status === DialogTurnStatus.complete) {
                const selectedChoice = results.result;
                await turnContext.sendActivity(selectedChoice.value);
            }
            await convoState.saveChanges(turnContext);
        });
        const convoState = new ConversationState(new MemoryStorage());

        const dialogState = convoState.createProperty('dialogState');
        const dialogs = new DialogSet(dialogState);
        const choicePrompt = new ChoicePrompt('prompt');
        choicePrompt.style = ListStyle.none;

        dialogs.add(choicePrompt);

        await adapter.send('Hello')
            .assertReply('Please choose a color.')
            .send(answerMessage)
            .assertReply('red');
    });

    it('should create prompt with inline choices when specified.', async function () {
        const adapter = new TestAdapter(async (turnContext) => {
            const dc = await dialogs.createContext(turnContext);

            const results = await dc.continueDialog();
            if (results.status === DialogTurnStatus.empty) {
                await dc.prompt('prompt',
                    {
                        prompt: { text: 'Please choose a color.', type: ActivityTypes.Message },
                        choices: stringChoices
                    });
            } else if (results.status === DialogTurnStatus.complete) {
                const selectedChoice = results.result;
                await turnContext.sendActivity(selectedChoice.value);
            }
            await convoState.saveChanges(turnContext);
        });
        const convoState = new ConversationState(new MemoryStorage());

        const dialogState = convoState.createProperty('dialogState');
        const dialogs = new DialogSet(dialogState);
        const choicePrompt = new ChoicePrompt('prompt');
        choicePrompt.style = ListStyle.inline;

        dialogs.add(choicePrompt);

        await adapter.send('Hello')
            .assertReply('Please choose a color. (1) red, (2) green, or (3) blue')
            .send(answerMessage)
            .assertReply('red');
    });

    it('should create prompt with list choices when specified.', async function () {
        const adapter = new TestAdapter(async (turnContext) => {
            const dc = await dialogs.createContext(turnContext);

            const results = await dc.continueDialog();
            if (results.status === DialogTurnStatus.empty) {
                await dc.prompt('prompt',
                    {
                        prompt: { text: 'Please choose a color.', type: ActivityTypes.Message },
                        choices: stringChoices
                    });
            } else if (results.status === DialogTurnStatus.complete) {
                const selectedChoice = results.result;
                await turnContext.sendActivity(selectedChoice.value);
            }
            await convoState.saveChanges(turnContext);
        });
        const convoState = new ConversationState(new MemoryStorage());

        const dialogState = convoState.createProperty('dialogState');
        const dialogs = new DialogSet(dialogState);
        const choicePrompt = new ChoicePrompt('prompt');
        choicePrompt.style = ListStyle.list;

        dialogs.add(choicePrompt);

        await adapter.send('Hello')
            .assertReply('Please choose a color.\n\n   1. red\n   2. green\n   3. blue')
            .send(answerMessage)
            .assertReply('red');
    });

    it('should recognize valid number choice.', async function () {
        const adapter = new TestAdapter(async (turnContext) => {
            const dc = await dialogs.createContext(turnContext);

            const results = await dc.continueDialog();
            if (results.status === DialogTurnStatus.empty) {
                await dc.prompt('prompt', 'Please choose a color.', stringChoices);
            } else if (results.status === DialogTurnStatus.complete) {
                const selectedChoice = results.result;
                await turnContext.sendActivity(selectedChoice.value);
            }
            await convoState.saveChanges(turnContext);
        });
        // Create new ConversationState with MemoryStorage and register the state as middleware.
        const convoState = new ConversationState(new MemoryStorage());

        // Create a DialogState property, DialogSet and ChoicePrompt.
        const dialogState = convoState.createProperty('dialogState');
        const dialogs = new DialogSet(dialogState);
        const choicePrompt = new ChoicePrompt('prompt');
        // Change the ListStyle of the prompt to ListStyle.none.
        choicePrompt.style = ListStyle.none;

        dialogs.add(choicePrompt);

        await adapter.send('Hello')
            .assertReply('Please choose a color.')
            .send('1')
            .assertReply('red');
    });

});
