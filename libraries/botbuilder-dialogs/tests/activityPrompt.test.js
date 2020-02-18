const { ActivityTypes, ConversationState, MemoryStorage, TestAdapter } = require('botbuilder-core');
const { ActivityPrompt, DialogReason, DialogSet, DialogTurnStatus } =  require('../');
const assert = require('assert');

class SimpleActivityPrompt extends ActivityPrompt {
    constructor(id, validator) {
        super(id);
        if (!validator) {
            throw new Error('validator is a required parameter');
        }
        this.validator = validator;
    }
}

describe('ActivityPrompt', function () {
    this.timeout(5000);

    it('should call ActivityPrompt using dc.prompt().', async function () {
        // Initialize TestAdapter.
        const adapter = new TestAdapter(async turnContext => {
            const dc = await dialogs.createContext(turnContext);

            const results = await dc.continueDialog();
            if (results.status === DialogTurnStatus.empty) {
                await dc.prompt('prompt', 'Please send an activity.');
            } else if (results.status === DialogTurnStatus.complete) {
                const reply = results.result.text;
                await turnContext.sendActivity(`You said ${reply}`);
            }
            await convoState.saveChanges(turnContext);
        });
        // Create new ConversationState with MemoryStorage and register the state as middleware.
        const convoState = new ConversationState(new MemoryStorage());

        // Create a DialogState property, DialogSet and TextPrompt.
        const dialogState = convoState.createProperty('dialogState');
        const dialogs = new DialogSet(dialogState);
        dialogs.add(new SimpleActivityPrompt('prompt', async prompt => {
            assert(prompt, `validator missing PromptValidatorContext.`);
            assert(typeof prompt.recognized.value === 'object', 'recognized.value was not an object.');
            return true;
        }));

        await adapter.send('Hello')
            .assertReply('Please send an activity.')
            .send('test')
            .assertReply('You said test');
    });

    it('should re-prompt with original prompt if validator returned false.', async function () {
        const adapter = new TestAdapter(async turnContext => {
            const dc = await dialogs.createContext(turnContext);

            const results = await dc.continueDialog();
            if (results.status === DialogTurnStatus.empty) {
                await dc.prompt('prompt', 'Please send an activity.');
            } else if (results.status === DialogTurnStatus.complete) {
                const reply = results.result.text;
                await turnContext.sendActivity(`You said ${reply}`);
            }
            await convoState.saveChanges(turnContext);
        });
        const convoState = new ConversationState(new MemoryStorage());

        const dialogState = convoState.createProperty('dialogState');
        const dialogs = new DialogSet(dialogState);
        dialogs.add(new SimpleActivityPrompt('prompt', async prompt => {
            assert(prompt, `validator missing PromptValidatorContext.`);
            assert(typeof prompt.recognized.value === 'object', 'recognized.value was not an object.');
            return false;
        }));

        await adapter.send('Hello')
            .assertReply('Please send an activity.')
            .send('test')
            .assertReply('Please send an activity.');
    });

    it('should re-prompt with custom retryPrompt if validator returned false.', async function () {
        const adapter = new TestAdapter(async turnContext => {
            const dc = await dialogs.createContext(turnContext);

            const results = await dc.continueDialog();
            if (results.status === DialogTurnStatus.empty) {
                await dc.prompt('prompt', { prompt: 'Please send activity.', retryPrompt: 'Activity not received.' });
            } else if (results.status === DialogTurnStatus.complete) {
                const reply = results.result.text;
                await turnContext.sendActivity(`You said ${reply}`);
            }
            await convoState.saveChanges(turnContext);
        });
        const convoState = new ConversationState(new MemoryStorage());

        const dialogState = convoState.createProperty('dialogState');
        const dialogs = new DialogSet(dialogState);
        dialogs.add(new SimpleActivityPrompt('prompt', async prompt => {
            assert(prompt, `validator missing PromptValidatorContext.`);
            assert(typeof prompt.recognized.value === 'object', 'recognized.value was not an object.');
            return false;
        }));

        await adapter.send('Hello')
            .assertReply('Please send activity.')
            .send('test')
            .assertReply('Activity not received.');
    });

    it('should see attemptCount increment.', async function() {
        const convoState = new ConversationState(new MemoryStorage());
        
        const dialogState = convoState.createProperty('dialogState');
        const dialogs = new DialogSet(dialogState);
        
        dialogs.add(new SimpleActivityPrompt('prompt', async prompt => {
            assert(prompt, `validator missing PromptValidatorContext.`);
            assert(typeof prompt.recognized.value === 'object', 'recognized.value was not an object.');
            if (prompt.recognized.value.type !== ActivityTypes.Event) {
                prompt.context.sendActivity(`attemptCount ${ prompt.attemptCount }`);
                return false;
            }
            return true;
        }));
        
        const adapter = new TestAdapter(async turnContext => {
            const dc = await dialogs.createContext(turnContext);

            const results = await dc.continueDialog();
            if (results.status === DialogTurnStatus.empty) {
                await dc.prompt('prompt', { prompt: 'Please send activity.', retryPrompt: 'Activity not received.' });
            } else if (results.status === DialogTurnStatus.complete) {
                const reply = results.result.type;
                await turnContext.sendActivity(`You sent a(n) ${ reply }`);
            }
            await convoState.saveChanges(turnContext);
        });
        
        await adapter.send('Hello')
            .assertReply('Please send activity.')
            .send('100')
            .assertReply('attemptCount 1')
            .send('200')
            .assertReply('attemptCount 2')
            .send('300')
            .assertReply('attemptCount 3')
            .send({ type: ActivityTypes.Event })
            .assertReply(`You sent a(n) ${ ActivityTypes.Event }`)
            .send('Another!')
            .assertReply('Please send activity.')
            .send('100')
            .assertReply('attemptCount 1')
            .send('200')
            .assertReply('attemptCount 2')
            .send('300')
            .assertReply('attemptCount 3')
            .send({ type: ActivityTypes.Event })
            .assertReply(`You sent a(n) ${ ActivityTypes.Event }`);
    });

    it('should have resumeDialog() prompt user and return Dialog.EndOfTurn.', async function () {
        const adapter = new TestAdapter(async turnContext => {
            const dc = await dialogs.createContext(turnContext);

            const results = await dc.continueDialog();
            if (results.status === DialogTurnStatus.empty) {
                await dc.prompt('prompt', 'Please send an activity.');
            }

            const secondResults = await prompt.resumeDialog(dc, DialogReason.nextCalled);
            assert(secondResults.status === DialogTurnStatus.waiting, 'resumeDialog() did not return a correct Dialog.EndOfTurn.');
            assert(secondResults.result === undefined, 'resumeDialog() did not return a correct Dialog.EndOfTurn.');
            await convoState.saveChanges(turnContext);
        });
        const convoState = new ConversationState(new MemoryStorage());

        const dialogState = convoState.createProperty('dialogState');
        const dialogs = new DialogSet(dialogState);
        const prompt = new SimpleActivityPrompt('prompt', async prompt => {
            assert(prompt, `validator missing PromptValidatorContext.`);
            assert(typeof prompt.recognized.value === 'object', 'recognized.value was not an object.');
            return false;
        })
        dialogs.add(prompt);

        await adapter.send('Hello')
            .assertReply('Please send an activity.')
            .assertReply('Please send an activity.');

    });
});
