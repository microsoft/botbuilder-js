const { ConversationState, MemoryStorage, TestAdapter } = require('botbuilder-core');
const { DialogSet, NumberPrompt, DialogTurnStatus } = require('../');
const assert = require('assert');

describe('NumberPrompt', function () {
    this.timeout(5000);
    it('should call NumberPrompt using dc.prompt().', async function () {
        // Initialize Testawait adapter.
        const adapter = new TestAdapter(async (turnContext) => {
            const dc = await dialogs.createContext(turnContext);

            const results = await dc.continueDialog();
            if (results.status === DialogTurnStatus.empty) {
                await dc.prompt('prompt', 'Please send a number.');
            } else if (results.status === DialogTurnStatus.complete) {
                const reply = results.result.toString();
                await turnContext.sendActivity(reply);
            }
            await convoState.saveChanges(turnContext);
        });
        // Create new ConversationState with MemoryStorage and register the state as middleware.
        const convoState = new ConversationState(new MemoryStorage());

        // Create a DialogState property, DialogSet and NumberPrompt.
        const dialogState = convoState.createProperty('dialogState');
        const dialogs = new DialogSet(dialogState);
        dialogs.add(new NumberPrompt('prompt'));

        await adapter.send('Hello')
            .assertReply('Please send a number.')
            .send('35')
            .assertReply('35');

    });

    it('should call NumberPrompt with custom validator.', async function () {
        const adapter = new TestAdapter(async (turnContext) => {
            const dc = await dialogs.createContext(turnContext);

            const results = await dc.continueDialog();
            if (results.status === DialogTurnStatus.empty) {
                await dc.prompt('prompt', 'Please send a number.');
            } else if (results.status === DialogTurnStatus.complete) {
                const reply = results.result.toString();
                await turnContext.sendActivity(reply);
            }
            await convoState.saveChanges(turnContext);
        });

        const convoState = new ConversationState(new MemoryStorage());

        const dialogState = convoState.createProperty('dialogState');
        const dialogs = new DialogSet(dialogState);
        dialogs.add(new NumberPrompt('prompt', async (prompt) => {
            assert(prompt);
            let value = prompt.recognized.value;
            return value !== undefined && value >= 1 && value <= 100;
        }));

        await adapter.send('Hello')
            .assertReply('Please send a number.')
            .send('0')
            .assertReply('Please send a number.')
            .send('25')
            .assertReply('25');

    });

    it('should send custom retryPrompt.', async function () {
        const adapter = new TestAdapter(async (turnContext) => {
            const dc = await dialogs.createContext(turnContext);

            const results = await dc.continueDialog();
            if (results.status === DialogTurnStatus.empty) {
                await dc.prompt('prompt', { prompt: 'Please send a number.', retryPrompt: 'Please send a number between 1 and 100.' });
            } else if (results.status === DialogTurnStatus.complete) {
                const reply = results.result.toString();
                await turnContext.sendActivity(reply);
            }
            await convoState.saveChanges(turnContext);
        });

        const convoState = new ConversationState(new MemoryStorage());

        const dialogState = convoState.createProperty('dialogState');
        const dialogs = new DialogSet(dialogState);
        dialogs.add(new NumberPrompt('prompt', async (prompt) => {
            assert(prompt);
            let value = prompt.recognized.value;
            return value !== undefined && value >= 1 && value <= 100;
        }));

        await adapter.send('Hello')
            .assertReply('Please send a number.')
            .send('0')
            .assertReply('Please send a number between 1 and 100.')
            .send('42')
            .assertReply('42')

    });

    it('should send ignore retryPrompt if validator replies.', async function () {
        const adapter = new TestAdapter(async (turnContext) => {
            const dc = await dialogs.createContext(turnContext);

            const results = await dc.continueDialog();
            if (results.status === DialogTurnStatus.empty) {
                await dc.prompt('prompt', { prompt: 'Please send a number.', retryPrompt: 'Please send a number between 1 and 100.' });
            } else if (results.status === DialogTurnStatus.complete) {
                const reply = results.result.toString();
                await turnContext.sendActivity(reply);
            }
            await convoState.saveChanges(turnContext);
        });

        const convoState = new ConversationState(new MemoryStorage());

        const dialogState = convoState.createProperty('dialogState');
        const dialogs = new DialogSet(dialogState);
        dialogs.add(new NumberPrompt('prompt', async (prompt) => {
            assert(prompt);
            let value = prompt.recognized.value;
            const valid = value !== undefined && value >= 1 && value <= 100;
            if (!valid) {
                await prompt.context.sendActivity('out of range');
            }
            return valid;
        }));

        await adapter.send('Hello')
            .assertReply('Please send a number.')
            .send('-1')
            .assertReply('out of range')
            .send('67')
            .assertReply('67')

    });

    it('should not send any retryPrompt no prompt specified.', async function () {
        const adapter = new TestAdapter(async (turnContext) => {
            const dc = await dialogs.createContext(turnContext);

            const results = await dc.continueDialog();
            if (results.status === DialogTurnStatus.empty) {
                await dc.beginDialog('prompt');
            } else if (results.status === DialogTurnStatus.complete) {
                const reply = results.result.toString();
                await turnContext.sendActivity(reply);
            }
            await convoState.saveChanges(turnContext);
        });

        const convoState = new ConversationState(new MemoryStorage());

        const dialogState = convoState.createProperty('dialogState');
        const dialogs = new DialogSet(dialogState);
        dialogs.add(new NumberPrompt('prompt', async (prompt) => {
            assert(prompt);
            let value = prompt.recognized.value;
            return value !== undefined && value >= 1 && value <= 100;
        }));

        await adapter.send('Hello')
            .send('0')
            .send('25')
            .assertReply('25')

    });

    it ('should recognize 0 and zero as valid values', async function() {
        const adapter = new TestAdapter(async (turnContext) => {
            const dc = await dialogs.createContext(turnContext);

            const results = await dc.continueDialog();
            if (results.status === DialogTurnStatus.empty) {
                await dc.prompt('prompt',{prompt: 'Send me a zero', retryPrompt: 'Send 0 or zero'});
            } else if (results.status === DialogTurnStatus.complete) {
                const reply = results.result.toString();
                await turnContext.sendActivity(reply);
            }
            await convoState.saveChanges(turnContext);
        });

        const convoState = new ConversationState(new MemoryStorage());

        const dialogState = convoState.createProperty('dialogState');
        const dialogs = new DialogSet(dialogState);
        dialogs.add(new NumberPrompt('prompt', async (prompt) => {
            assert(prompt);
            console.log('recognized value:', prompt.recognized.value);
            return prompt.recognized.value === 0;
        }));

        await adapter.send('Hello')
            .assertReply('Send me a zero')
            .send('100')
            .assertReply('Send 0 or zero')
            .send('0')
            .assertReply('0')
            .send('Another!')
            .assertReply('Send me a zero')
            .send('zero')
            .assertReply('0')
    });
});
