const { ConversationState, MemoryStorage, TestAdapter } = require('botbuilder-core');
const { AdaptiveCardPrompt, AdaptiveCardPromptErrors, DialogSet, DialogTurnStatus } =  require('../');
const { CardFactory } = require('botbuilder');
const assert = require('assert');

const CUSTOM_PROMPT_ID = 'custom';
const assertActivityHasCard = (activity) => {
    assert.strictEqual(activity.attachments[0].contentType, 'application/vnd.microsoft.card.adaptive');
};

describe('AdaptiveCardPrompt - Constructor and Settings', function() {
    this.timeout(5000);

    it('should throw if no attachment passed in through AdaptiveCardPromptSettings', async function() {
        assert.throws(() => new AdaptiveCardPrompt('prompt'), new Error('AdaptiveCardPrompt requires a card in `AdaptiveCardPromptSettings.card`'));
        assert.throws(() => new AdaptiveCardPrompt('prompt', { }), new Error('AdaptiveCardPrompt requires a card in `AdaptiveCardPromptSettings.card`'));
    });

    it('should throw if card is not a valid adaptive card', async function() {
        assert.throws(() => new AdaptiveCardPrompt('prompt', { card: '' }),
            'No Adaptive Card provided. Include in the constructor or PromptOptions.prompt.attachments');
        assert.throws(() => new AdaptiveCardPrompt('prompt', { card: { content: cardJson, contentType: 'invalidCard' } }),
            `Attachment is not a valid Adaptive Card.\n`+
            `Ensure card.contentType is application/vnd.microsoft.card.adaptive\n`+
            `and card.content contains the card json`);
    });

    it('should throw if promptId is defined but falsy', async function() {
        const cardJson = JSON.parse(JSON.stringify(require('./adaptiveCard.json')));
        const card = CardFactory.adaptiveCard(cardJson);
        assert.throws(() => new AdaptiveCardPrompt('prompt', { card, promptId: '' }), new Error('AdaptiveCardPromptSettings.promptId cannot be a falsy string'));
        assert.doesNotThrow(() => new AdaptiveCardPrompt('prompt', { card, promptId: 'notFalsy' }));
    });
});
    
describe('AdaptiveCardPrompt - Common User Error Detection', function() {
    let cardJson;
    let card;

    let simulatedInput;

    this.beforeEach(() => {
        // Must be JSON deep-cloned or it changes persist between tests
        cardJson = JSON.parse(JSON.stringify(require('./adaptiveCard.json')));
        card = CardFactory.adaptiveCard(cardJson);

        simulatedInput = {
            type: 'message',
            value: {
                FoodChoice: 'Steak',
                SteakOther: 'some details',
                SteakTemp: 'rare',
            }
        };
    });

    it('should successfully recognize input while using custom promptId when input contains correct promptId', async function() {
        let usedValidator = false;
        const prompt = new AdaptiveCardPrompt('prompt', {
            promptId: CUSTOM_PROMPT_ID,
            card
        }, (context) => {
            assert.strictEqual(context.recognized.succeeded, true);
            assert.strictEqual(context.recognized.value.error, undefined);
            usedValidator = true;
            return context.recognized.succeeded;
        });

        const adapter = new TestAdapter(async turnContext => {
            const dc = await dialogs.createContext(turnContext);

            const results = await dc.continueDialog();
            if (results.status === DialogTurnStatus.empty) {
                await dc.prompt('prompt');
            } else if (results.status === DialogTurnStatus.complete) {
                const reply = results.result.data;
                await turnContext.sendActivity(`You said ${ JSON.stringify(reply) }`);
            }
            await convoState.saveChanges(turnContext);
        });
        // Create new ConversationState with MemoryStorage and register the state as middleware.
        const convoState = new ConversationState(new MemoryStorage());

        // Create a DialogState property, DialogSet and TextPrompt.
        const dialogState = convoState.createProperty('dialogState');
        const dialogs = new DialogSet(dialogState);
        dialogs.add(prompt);

        simulatedInput.value.promptId = CUSTOM_PROMPT_ID;

        await adapter.send('Hello')
            .assertReply((activity) => assert.strictEqual(activity.attachments[0].content.selectAction.data.promptId, CUSTOM_PROMPT_ID))
            .send(simulatedInput);
        assert.strictEqual(usedValidator, true);
    });

    it('should present promptId error while using custom promptId when input contains incorrect promptId', async function() {
        let usedValidator = false;
        const prompt = new AdaptiveCardPrompt('prompt', {
            promptId: CUSTOM_PROMPT_ID,
            card
        }, (context) => {
            assert.strictEqual(context.recognized.succeeded, false);
            assert.strictEqual(context.recognized.value.error, AdaptiveCardPromptErrors.userInputDoesNotMatchCardId);
            usedValidator = true;
            return context.recognized.succeeded;
        });

        const adapter = new TestAdapter(async turnContext => {
            const dc = await dialogs.createContext(turnContext);

            const results = await dc.continueDialog();
            if (results.status === DialogTurnStatus.empty) {
                await dc.prompt('prompt');
            } else if (results.status === DialogTurnStatus.complete) {
                const reply = results.result.data;
                await turnContext.sendActivity(`You said ${ JSON.stringify(reply) }`);
            }
            await convoState.saveChanges(turnContext);
        });
        // Create new ConversationState with MemoryStorage and register the state as middleware.
        const convoState = new ConversationState(new MemoryStorage());

        // Create a DialogState property, DialogSet and TextPrompt.
        const dialogState = convoState.createProperty('dialogState');
        const dialogs = new DialogSet(dialogState);
        dialogs.add(prompt);

        simulatedInput.value.promptId = 'not a valid id';

        await adapter.send('Hello')
            .assertReply((activity) => assert.strictEqual(activity.attachments[0].content.selectAction.data.promptId, CUSTOM_PROMPT_ID))
            .send(simulatedInput)
            .assertReply((activity) => assert.strictEqual(activity.attachments[0].content.selectAction.data.promptId, CUSTOM_PROMPT_ID))
        assert.strictEqual(usedValidator, true);
    });

    it('should successfully recognize if all required ids supplied', async function() {
        let usedValidator;
        const prompt = new AdaptiveCardPrompt('prompt', {
            requiredInputIds: Object.keys(simulatedInput.value),
            card
        }, async (context) => {
            assert(context.recognized && context.recognized.succeeded);
            usedValidator = true;
            return context.recognized.succeeded;
        });

        const adapter = new TestAdapter(async turnContext => {
            const dc = await dialogs.createContext(turnContext);

            const results = await dc.continueDialog();
            if (results.status === DialogTurnStatus.empty) {
                await dc.prompt('prompt');
            } else if (results.status === DialogTurnStatus.complete) {
                const reply = results.result.data;
                await turnContext.sendActivity(`You said ${ JSON.stringify(reply) }`);
            }
            await convoState.saveChanges(turnContext);
        });
        // Create new ConversationState with MemoryStorage and register the state as middleware.
        const convoState = new ConversationState(new MemoryStorage());

        // Create a DialogState property, DialogSet and TextPrompt.
        const dialogState = convoState.createProperty('dialogState');
        const dialogs = new DialogSet(dialogState);
        dialogs.add(prompt);

        await adapter.send('Hello')
            .assertReply((activity) => {
                assertActivityHasCard(activity);
            })
            .send(simulatedInput)
            .assertReply(`You said ${ JSON.stringify(simulatedInput.value) }`);
        assert.strictEqual(usedValidator, true);
    });

    it('should present missingIds error when input does not contain all required input ids', async function() {
        let usedValidator = false;
        const prompt = new AdaptiveCardPrompt('prompt', {
            requiredInputIds: ['test1', 'test2', 'test3'],
            card
        }, async (context) => {
            assert.strictEqual(context.recognized.succeeded, false);
            assert.strictEqual(context.recognized.value.error, AdaptiveCardPromptErrors.missingRequiredIds);
            await context.context.sendActivity(`test inputs missing: ${ context.recognized.value.missingIds.join(', ') }`);
            usedValidator = true;
            return false;
        });

        const adapter = new TestAdapter(async turnContext => {
            const dc = await dialogs.createContext(turnContext);

            const results = await dc.continueDialog();
            if (results.status === DialogTurnStatus.empty) {
                await dc.prompt('prompt');
            }
            await convoState.saveChanges(turnContext);
        });
        // Create new ConversationState with MemoryStorage and register the state as middleware.
        const convoState = new ConversationState(new MemoryStorage());

        // Create a DialogState property, DialogSet and TextPrompt.
        const dialogState = convoState.createProperty('dialogState');
        const dialogs = new DialogSet(dialogState);
        dialogs.add(prompt);

        await adapter.send('Hello')
            .assertReply((activity) => { assertActivityHasCard(activity); })
            .send(simulatedInput)
            .assertReply('test inputs missing: test1, test2, test3');
        assert.strictEqual(usedValidator, true);
    });

    it('should recognize valid card input', async function() {
        let usedValidator = false;
        const prompt = new AdaptiveCardPrompt('prompt', { card }, async (context) => {
            assert.strictEqual(context.recognized.succeeded, true);
            usedValidator = true;
            return true;
        });

        const adapter = new TestAdapter(async turnContext => {
            const dc = await dialogs.createContext(turnContext);

            const results = await dc.continueDialog();
            if (results.status === DialogTurnStatus.empty) {
                await dc.prompt('prompt');
            } else if (results.status === DialogTurnStatus.complete) {
                const reply = results.result.data;
                await turnContext.sendActivity(`You said ${ JSON.stringify(reply) }`);
            }
            await convoState.saveChanges(turnContext);
        });
        // Create new ConversationState with MemoryStorage and register the state as middleware.
        const convoState = new ConversationState(new MemoryStorage());

        // Create a DialogState property, DialogSet and TextPrompt.
        const dialogState = convoState.createProperty('dialogState');
        const dialogs = new DialogSet(dialogState);
        dialogs.add(prompt);

        assert(simulatedInput.value && !simulatedInput.text);

        await adapter.send('Hello')
            .assertReply((activity) => { assertActivityHasCard(activity); })
            .send(simulatedInput)
            .assertReply(`You said ${ JSON.stringify(simulatedInput.value) }`);
        assert.strictEqual(usedValidator, true);
    });

    it('should present text input error when invalid text input while waiting for card input', async function() {
        let usedValidator = false;
        const prompt = new AdaptiveCardPrompt('prompt', { card }, async (context) => {
            assert.strictEqual(context.recognized.succeeded, false);
            assert.strictEqual(context.recognized.value.error, AdaptiveCardPromptErrors.userUsedTextInput);
            usedValidator = true;
            return false;
        });

        const adapter = new TestAdapter(async turnContext => {
            const dc = await dialogs.createContext(turnContext);

            const results = await dc.continueDialog();
            if (results.status === DialogTurnStatus.empty) {
                await dc.prompt('prompt');
            } else if (results.status === DialogTurnStatus.complete) {
                const reply = results.result.data;
                await turnContext.sendActivity(`You said ${ JSON.stringify(reply) }`);
            }
            await convoState.saveChanges(turnContext);
        });
        // Create new ConversationState with MemoryStorage and register the state as middleware.
        const convoState = new ConversationState(new MemoryStorage());

        // Create a DialogState property, DialogSet and TextPrompt.
        const dialogState = convoState.createProperty('dialogState');
        const dialogs = new DialogSet(dialogState);
        dialogs.add(prompt);

        assert(simulatedInput.value && !simulatedInput.text);

        await adapter.send('Hello')
            .assertReply((activity) => { assertActivityHasCard(activity); })
            .send('this is not valid card input')
            .assertReply((activity) => { assertActivityHasCard(activity); });
        assert.strictEqual(usedValidator, true);
    });
});

describe('AdaptiveCardPrompt - Prompt Behavior', function() {
    let cardJson;
    let card;

    let simulatedInput;

    this.beforeEach(() => {
        // Must be JSON deep-cloned or it changes persist between tests
        cardJson = JSON.parse(JSON.stringify(require('./adaptiveCard.json')));
        card = CardFactory.adaptiveCard(cardJson);

        simulatedInput = {
            type: 'message',
            value: {
                FoodChoice: 'Steak',
                SteakOther: 'some details',
                SteakTemp: 'rare',
            }
        };
    });

    it('should call AdaptiveCardPrompt using dc.beginDialog()', async function() {
        const prompt = new AdaptiveCardPrompt('prompt', { card });

        const adapter = new TestAdapter(async turnContext => {
            const dc = await dialogs.createContext(turnContext);

            const results = await dc.continueDialog();
            if (results.status === DialogTurnStatus.empty) {
                await dc.beginDialog('prompt');
            } else if (results.status === DialogTurnStatus.complete) {
                const reply = results.result.data;
                await turnContext.sendActivity(`You said ${ JSON.stringify(reply) }`);
            }
            await convoState.saveChanges(turnContext);
        });
        // Create new ConversationState with MemoryStorage and register the state as middleware.
        const convoState = new ConversationState(new MemoryStorage());

        // Create a DialogState property, DialogSet and TextPrompt.
        const dialogState = convoState.createProperty('dialogState');
        const dialogs = new DialogSet(dialogState);
        dialogs.add(prompt);

        await adapter.send('Hello')
            .assertReply((activity) => { assertActivityHasCard(activity); })
            .send(simulatedInput)
            .assertReply(`You said ${ JSON.stringify(simulatedInput.value) }`);
    });

    it('should call AdaptiveCardPrompt using dc.prompt()', async function() {
        const prompt = new AdaptiveCardPrompt('prompt', { card });

        const adapter = new TestAdapter(async turnContext => {
            const dc = await dialogs.createContext(turnContext);

            const results = await dc.continueDialog();
            if (results.status === DialogTurnStatus.empty) {
                await dc.prompt('prompt');
            } else if (results.status === DialogTurnStatus.complete) {
                const reply = results.result.data;
                await turnContext.sendActivity(`You said ${ JSON.stringify(reply) }`);
            }
            await convoState.saveChanges(turnContext);
        });
        // Create new ConversationState with MemoryStorage and register the state as middleware.
        const convoState = new ConversationState(new MemoryStorage());

        // Create a DialogState property, DialogSet and TextPrompt.
        const dialogState = convoState.createProperty('dialogState');
        const dialogs = new DialogSet(dialogState);
        dialogs.add(prompt);

        await adapter.send('Hello')
            .assertReply((activity) => { assertActivityHasCard(activity); })
            .send(simulatedInput)
            .assertReply(`You said ${ JSON.stringify(simulatedInput.value) }`);
    });

    it('should use retryPrompt on retries, if given', async function() {
        const prompt = new AdaptiveCardPrompt('prompt', { card });

        const adapter = new TestAdapter(async turnContext => {
            const dc = await dialogs.createContext(turnContext);

            const results = await dc.continueDialog();
            if (results.status === DialogTurnStatus.empty) {
                await dc.prompt('prompt', { retryPrompt: { text: 'RETRY' } });
            }
            await convoState.saveChanges(turnContext);
        });
        // Create new ConversationState with MemoryStorage and register the state as middleware.
        const convoState = new ConversationState(new MemoryStorage());

        // Create a DialogState property, DialogSet and TextPrompt.
        const dialogState = convoState.createProperty('dialogState');
        const dialogs = new DialogSet(dialogState);
        dialogs.add(prompt);

        await adapter.send('Hello')
            .assertReply((activity) => {
                assertActivityHasCard(activity);
            })
            .send('i am sending an invalid response to an adaptive card')
            .assertReply('RETRY');
    });

    it('should not overwrite developer-provided attachments and should add card to end of existing attachments array', async function() {
        const prompt = new AdaptiveCardPrompt('prompt', { card });

        const adapter = new TestAdapter(async turnContext => {
            const dc = await dialogs.createContext(turnContext);

            const results = await dc.continueDialog();
            if (results.status === DialogTurnStatus.empty) {
                await dc.prompt('prompt', {
                    attachments: [
                        { content: 'a' },
                        { content: 'b' },
                        { content: 'c' },
                    ]
                });
            } else if (results.status === DialogTurnStatus.complete) {
                const reply = results.result.data;
                await turnContext.sendActivity(`You said ${ JSON.stringify(reply) }`);
            }
            await convoState.saveChanges(turnContext);
        });
        // Create new ConversationState with MemoryStorage and register the state as middleware.
        const convoState = new ConversationState(new MemoryStorage());

        // Create a DialogState property, DialogSet and TextPrompt.
        const dialogState = convoState.createProperty('dialogState');
        const dialogs = new DialogSet(dialogState);
        dialogs.add(prompt);

        await adapter.send('Hello')
            .assertReply((activity) => { 
                assert.strictEqual(activity.attachments[0].content, 'a');
                assert.strictEqual(activity.attachments[1].content, 'b');
                assert.strictEqual(activity.attachments[2].content, 'c');
                assert.strictEqual(activity.attachments[3].contentType, 'application/vnd.microsoft.card.adaptive');

            })
            .send(simulatedInput)
            .assertReply(`You said ${ JSON.stringify(simulatedInput.value) }`);
    });

    it('should track the number of attempts', async function() {
        let attempts = 0;
        const prompt = new AdaptiveCardPrompt('prompt', { card }, async (context) => {
            attempts = context.state['attemptCount'];
            return false;
        });

        const adapter = new TestAdapter(async turnContext => {
            const dc = await dialogs.createContext(turnContext);

            const results = await dc.continueDialog();
            if (results.status === DialogTurnStatus.empty) {
                await dc.prompt('prompt');
            } else if (results.status === DialogTurnStatus.waiting) {
                await turnContext.sendActivity(`Invalid Response`);
            }
            await convoState.saveChanges(turnContext);
        });
        // Create new ConversationState with MemoryStorage and register the state as middleware.
        const convoState = new ConversationState(new MemoryStorage());

        // Create a DialogState property, DialogSet and TextPrompt.
        const dialogState = convoState.createProperty('dialogState');
        const dialogs = new DialogSet(dialogState);
        dialogs.add(prompt);

        await adapter.send('Hello')
            .assertReply((activity) => {
                assertActivityHasCard(activity);
                simulatedInput.value.promptId = prompt.promptId;
            })
            .send(simulatedInput)
            .assertReply(() => assert.strictEqual(attempts, 1))
            .send(simulatedInput)
            .assertReply(() => assert.strictEqual(attempts, 2))
            .send(simulatedInput)
            .assertReply(() => assert.strictEqual(attempts, 3));
        assert.strictEqual(attempts, 3);
    });

    it('should accept a custom validator and call it if recognized.succeeded', async function() {
        let usedValidator = false;
        const prompt = new AdaptiveCardPrompt('prompt', { card }, async (context) => {
            assert(context.recognized && context.recognized.succeeded);
            usedValidator = true;
            return true;
        });

        const adapter = new TestAdapter(async turnContext => {
            const dc = await dialogs.createContext(turnContext);

            const results = await dc.continueDialog();
            if (results.status === DialogTurnStatus.empty) {
                await dc.prompt('prompt');
            } else if (results.status === DialogTurnStatus.complete) {
                const reply = results.result.data;
                await turnContext.sendActivity(`You said ${ JSON.stringify(reply) }`);
            }
            await convoState.saveChanges(turnContext);
        });
        // Create new ConversationState with MemoryStorage and register the state as middleware.
        const convoState = new ConversationState(new MemoryStorage());

        // Create a DialogState property, DialogSet and TextPrompt.
        const dialogState = convoState.createProperty('dialogState');
        const dialogs = new DialogSet(dialogState);
        dialogs.add(prompt);

        await adapter.send('Hello')
            .assertReply((activity) => { assertActivityHasCard(activity); })
            .send(simulatedInput);
        assert.strictEqual(usedValidator, true);
    });

    it('should accept a custom validator and call it if not recognized.succeeded', async function() {
        let usedValidator = false;
        const prompt = new AdaptiveCardPrompt('prompt', { card }, async (context) => {
            assert(context.recognized && !context.recognized.succeeded);
            usedValidator = true;
            return true;
        });

        const adapter = new TestAdapter(async turnContext => {
            const dc = await dialogs.createContext(turnContext);

            const results = await dc.continueDialog();
            if (results.status === DialogTurnStatus.empty) {
                await dc.prompt('prompt');
            } else if (results.status === DialogTurnStatus.complete) {
                const reply = results.result.data;
                await turnContext.sendActivity(`You said ${ JSON.stringify(reply) }`);
            }
            await convoState.saveChanges(turnContext);
        });
        // Create new ConversationState with MemoryStorage and register the state as middleware.
        const convoState = new ConversationState(new MemoryStorage());

        // Create a DialogState property, DialogSet and TextPrompt.
        const dialogState = convoState.createProperty('dialogState');
        const dialogs = new DialogSet(dialogState);
        dialogs.add(prompt);

        await adapter.send('Hello')
            .assertReply((activity) => { assertActivityHasCard(activity); })
            .send('this is not valid input');
        assert.strictEqual(usedValidator, true);
    });

    it('should not reprompt if not recognized.succeeded, but validator returns true', async function() {
        let usedValidator = false;
        const prompt = new AdaptiveCardPrompt('prompt', { card }, async (context) => {
            assert(context.recognized && !context.recognized.succeeded);
            usedValidator = true;
            return true;
        });

        const adapter = new TestAdapter(async turnContext => {
            const dc = await dialogs.createContext(turnContext);

            const results = await dc.continueDialog();
            if (results.status === DialogTurnStatus.empty) {
                await dc.prompt('prompt');
            } else if (results.status === DialogTurnStatus.complete) {
                const reply = results.result.data;
                await turnContext.sendActivity('Validator passed');
            }
            await convoState.saveChanges(turnContext);
        });
        // Create new ConversationState with MemoryStorage and register the state as middleware.
        const convoState = new ConversationState(new MemoryStorage());

        // Create a DialogState property, DialogSet and TextPrompt.
        const dialogState = convoState.createProperty('dialogState');
        const dialogs = new DialogSet(dialogState);
        dialogs.add(prompt);

        await adapter.send('Hello')
            .assertReply((activity) => { assertActivityHasCard(activity); })
            .send('this is invalid card input')
            .assertReply('Validator passed');
        assert.strictEqual(usedValidator, true);
    });
});
