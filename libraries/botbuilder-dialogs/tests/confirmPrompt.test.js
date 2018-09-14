const { ActivityTypes, ConversationState, MemoryStorage, TestAdapter } = require('botbuilder-core');
const { ConfirmPrompt, DialogSet, DialogTurnStatus, ListStyle } = require('../');
const assert = require('assert');

const beginMessage = { text: `begin`, type: 'message' };
const answerMessage = { text: `yes`, type: 'message' };
const invalidMessage = { text: `what?`, type: 'message' };

describe('ConfirmPrompt', function () {
    this.timeout(5000);

    it('should call ConfirmPrompt using dc.prompt().', async function () {
        // Initialize TestAdapter.
        const adapter = new TestAdapter(async (turnContext) => {
            const dc = await dialogs.createContext(turnContext);

            const results = await dc.continueDialog();
            if (results.status === DialogTurnStatus.empty) {
                await dc.prompt('prompt', { prompt: 'Please confirm.' });
            } else if (results.status === DialogTurnStatus.complete) {
                await turnContext.sendActivity(`The result found is '${results.result}'.`);
            }
            await convoState.saveChanges(turnContext);
        });

        // Create new ConversationState with MemoryStorage and register the state as middleware.
        const convoState = new ConversationState(new MemoryStorage());

        // Create a DialogState property, DialogSet and AttachmentPrompt.
        const dialogState = convoState.createProperty('dialogState');
        const dialogs = new DialogSet(dialogState);
        dialogs.add(new ConfirmPrompt('prompt'));

        await adapter.send('Hello')
            .assertReply('Please confirm. (1) Yes or (2) No')
            .send('yes')
            .assertReply(`The result found is 'true'.`);
    });

    it('should call ConfirmPrompt with custom validator.', async function () {
        const adapter = new TestAdapter(async (turnContext) => {
            const dc = await dialogs.createContext(turnContext);

            const results = await dc.continueDialog();
            if (results.status === DialogTurnStatus.empty) {
                await dc.prompt('prompt', { prompt: 'Please confirm. Yes or No' });
            } else if (results.status === DialogTurnStatus.complete) {
                await turnContext.sendActivity(`The result found is '${results.result}'.`);
            }
            await convoState.saveChanges(turnContext);
        });

        const convoState = new ConversationState(new MemoryStorage());

        const dialogState = convoState.createProperty('dialogState');
        const dialogs = new DialogSet(dialogState);
        const confirmPrompt = new ConfirmPrompt('prompt', async (prompt) => {
            assert(prompt, `PromptValidatorContext not found.`);
            return prompt.recognized.succeeded;
        });
        confirmPrompt.style = ListStyle.none;
        dialogs.add(confirmPrompt);

        await adapter.send('Hello')
            .assertReply('Please confirm. Yes or No')
            .send('no')
            .assertReply(`The result found is 'false'.`)
    });

    it('should send custom retryPrompt.', async function () {
        const adapter = new TestAdapter(async (turnContext) => {
            const dc = await dialogs.createContext(turnContext);

            const results = await dc.continueDialog();
            if (results.status === DialogTurnStatus.empty) {
                await dc.prompt('prompt', {
                    prompt: 'Please confirm. Yes or No',
                    retryPrompt: `Please reply with 'Yes' or 'No'.`
                });
            } else if (results.status === DialogTurnStatus.complete) {
                await turnContext.sendActivity(`The result found is '${results.result}'.`);
            }
            await convoState.saveChanges(turnContext);
        });

        const convoState = new ConversationState(new MemoryStorage());

        const dialogState = convoState.createProperty('dialogState');
        const dialogs = new DialogSet(dialogState);
        const confirmPrompt = new ConfirmPrompt('prompt');
        confirmPrompt.style = ListStyle.none;
        dialogs.add(confirmPrompt);


        await adapter.send('Hello')
            .assertReply('Please confirm. Yes or No')
            .send('what?')
            .assertReply(`Please reply with 'Yes' or 'No'.`)
            .send('no')
            .assertReply(`The result found is 'false'.`)
    });

    it('should send custom retryPrompt if validator does not reply.', async function () {
        const adapter = new TestAdapter(async (turnContext) => {
            const dc = await dialogs.createContext(turnContext);

            const results = await dc.continueDialog();
            if (results.status === DialogTurnStatus.empty) {
                await dc.prompt('prompt', {
                    prompt: 'Please confirm. Yes or No',
                    retryPrompt: `Please reply with 'Yes' or 'No'.`
                });
            } else if (results.status === DialogTurnStatus.complete) {
                await turnContext.sendActivity(`The result found is '${results.result}'.`);
            }
            await convoState.saveChanges(turnContext);
        });

        const convoState = new ConversationState(new MemoryStorage());

        const dialogState = convoState.createProperty('dialogState');
        const dialogs = new DialogSet(dialogState);
        const confirmPrompt = new ConfirmPrompt('prompt', async (prompt) => {
            assert(prompt, `PromptValidatorContext not found.`);
            return prompt.recognized.succeeded;
        });
        confirmPrompt.style = ListStyle.none;
        dialogs.add(confirmPrompt);

        await adapter.send('Hello')
            .assertReply('Please confirm. Yes or No')
            .send('what?')
            .assertReply(`Please reply with 'Yes' or 'No'.`)
            .send('no')
            .assertReply(`The result found is 'false'.`)
    });

    it('should ignore retryPrompt if validator replies.', async function () {
        const adapter = new TestAdapter(async (turnContext) => {
            const dc = await dialogs.createContext(turnContext);

            const results = await dc.continueDialog();
            if (results.status === DialogTurnStatus.empty) {
                await dc.prompt('prompt', {
                    prompt: 'Please confirm. Yes or No',
                    retryPrompt: `Please reply with 'Yes' or 'No'.`
                });
            } else if (results.status === DialogTurnStatus.complete) {
                await turnContext.sendActivity(`The result found is '${results.result}'.`);
            }
            await convoState.saveChanges(turnContext);
        });

        const convoState = new ConversationState(new MemoryStorage());

        const dialogState = convoState.createProperty('dialogState');
        const dialogs = new DialogSet(dialogState);
        const confirmPrompt = new ConfirmPrompt('prompt', async (prompt) => {
            assert(prompt, `PromptValidatorContext not found.`);
            if (!prompt.recognized.succeeded) {
                await prompt.context.sendActivity('The correct response is either yes or no. Please choose one.')
            }
            return prompt.recognized.succeeded;
        });
        confirmPrompt.style = ListStyle.none;
        dialogs.add(confirmPrompt);


        await adapter.send('Hello')
            .assertReply('Please confirm. Yes or No')
            .send('what?')
            .assertReply('The correct response is either yes or no. Please choose one.')
            .send('no')
            .assertReply(`The result found is 'false'.`)
    });

    it('should not send any retryPrompt if no prompt is specified.', async function () {
        const adapter = new TestAdapter(async (turnContext) => {
            const dc = await dialogs.createContext(turnContext);

            const results = await dc.continueDialog();
            if (results.status === DialogTurnStatus.empty) {
                await dc.beginDialog('prompt');
            } else if (results.status === DialogTurnStatus.complete) {
                await turnContext.sendActivity(`The result found is '${results.result}'.`);
            }
            await convoState.saveChanges(turnContext);
        });

        const convoState = new ConversationState(new MemoryStorage());

        const dialogState = convoState.createProperty('dialogState');
        const dialogs = new DialogSet(dialogState);
        const confirmPrompt = new ConfirmPrompt('prompt');
        confirmPrompt.style = ListStyle.none;
        dialogs.add(confirmPrompt);


        await adapter.send('Hello')
            .assertReply('')
            .send('what?')
            .assertReply('')
            .send('no')
            .assertReply(`The result found is 'false'.`)
    });

    it('should use defaultLocale when rendering choices', async function () {
        const adapter = new TestAdapter(async (turnContext) => {
            const dc = await dialogs.createContext(turnContext);

            const results = await dc.continueDialog();
            if (results.status === DialogTurnStatus.empty) {
                await dc.prompt('prompt', { prompt: 'Please confirm.' });
            } else if (results.status === DialogTurnStatus.complete) {
                const confirmed = results.result;
                if (confirmed) {
                    await turnContext.sendActivity('true');
                } else {
                    await turnContext.sendActivity('false');
                }
            }
            await convoState.saveChanges(turnContext);
        });
        const convoState = new ConversationState(new MemoryStorage());

        const dialogState = convoState.createProperty('dialogState');
        const dialogs = new DialogSet(dialogState);
        const choicePrompt = new ConfirmPrompt('prompt', async (prompt) => {
            assert(prompt);
            if (!prompt.recognized.succeeded) {
                await prompt.context.sendActivity('bad input.');
            }
            return prompt.recognized.succeeded;
        }, 'ja-jp');
        dialogs.add(choicePrompt);

        await adapter.send({ text: 'Hello', type: ActivityTypes.Message })
            .assertReply('Please confirm. (1) はい または (2) いいえ')
            .send(invalidMessage)
            .assertReply('bad input.')
            .send({ text: 'はい', type: ActivityTypes.Message })
            .assertReply('true');
    });

    it('should use context.activity.locale when rendering choices', async function () {
        const adapter = new TestAdapter(async (turnContext) => {
            const dc = await dialogs.createContext(turnContext);

            const results = await dc.continueDialog();
            if (results.status === DialogTurnStatus.empty) {
                await dc.prompt('prompt', { prompt: 'Please confirm.' });
            } else if (results.status === DialogTurnStatus.complete) {
                const confirmed = results.result;
                if (confirmed) {
                    await turnContext.sendActivity('true');
                } else {
                    await turnContext.sendActivity('false');
                }
            }
            await convoState.saveChanges(turnContext);
        });
        const convoState = new ConversationState(new MemoryStorage());

        const dialogState = convoState.createProperty('dialogState');
        const dialogs = new DialogSet(dialogState);
        const choicePrompt = new ConfirmPrompt('prompt', async (prompt) => {
            assert(prompt);
            if (!prompt.recognized.succeeded) {
                await prompt.context.sendActivity('bad input.');
            }
            return prompt.recognized.succeeded;
        });
        dialogs.add(choicePrompt);

        await adapter.send({ text: 'Hello', type: ActivityTypes.Message, locale: 'ja-jp' })
            .assertReply('Please confirm. (1) はい または (2) いいえ')
            .send({ text: 'いいえ', type: ActivityTypes.Message, locale: 'ja-jp' })
            .assertReply('false');
    });

    it('should use context.activity.locale over defaultLocale when rendering choices', async function () {
        const adapter = new TestAdapter(async (turnContext) => {
            const dc = await dialogs.createContext(turnContext);

            const results = await dc.continueDialog();
            if (results.status === DialogTurnStatus.empty) {
                await dc.prompt('prompt', { prompt: 'Please confirm.' });
            } else if (results.status === DialogTurnStatus.complete) {
                const confirmed = results.result;
                if (confirmed) {
                    await turnContext.sendActivity('true');
                } else {
                    await turnContext.sendActivity('false');
                }
            }
            await convoState.saveChanges(turnContext);
        });
        const convoState = new ConversationState(new MemoryStorage());

        const dialogState = convoState.createProperty('dialogState');
        const dialogs = new DialogSet(dialogState);
        const choicePrompt = new ConfirmPrompt('prompt', async (prompt) => {
            assert(prompt);
            if (!prompt.recognized.succeeded) {
                await prompt.context.sendActivity('bad input.');
            }
            return prompt.recognized.succeeded;
        }, 'es-es');
        dialogs.add(choicePrompt);

        await adapter.send({ text: 'Hello', type: ActivityTypes.Message, locale: 'ja-jp' })
            .assertReply('Please confirm. (1) はい または (2) いいえ')
            .send({ text: 'いいえ', type: ActivityTypes.Message, locale: 'ja-jp' })
            .assertReply('false');
    });
});
