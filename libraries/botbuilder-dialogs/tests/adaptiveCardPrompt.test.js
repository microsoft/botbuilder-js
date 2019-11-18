const { ConversationState, MemoryStorage, TestAdapter } = require('botbuilder-core');
const { AdaptiveCardPrompt, DialogSet, DialogTurnStatus } =  require('../');
const { CardFactory } = require('botbuilder');
const assert = require('assert');

const assertActivityHasCard = (activity) => {
    assert.equal(activity.attachments[0].contentType, 'application/vnd.microsoft.card.adaptive');
};

describe('AdaptiveCardPrompt', function() {
    this.timeout(5000);

    let simulatedInput = {
        type: 'message',
        value: {
            FoodChoice: 'Steak',
            SteakOther: 'some details',
            SteakTemp: 'rare',
        }
    };

    let cardJson;
    let card;

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

    it('should call AdaptiveCardPrompt using dc.prompt().', async function() {
        // Initialize TestAdapter.
        const prompt = new AdaptiveCardPrompt('prompt');

        const adapter = new TestAdapter(async turnContext => {
            const dc = await dialogs.createContext(turnContext);

            const results = await dc.continueDialog();
            if (results.status === DialogTurnStatus.empty) {
                await dc.prompt('prompt', { prompt: { attachments: [card] } });
            } else if (results.status === DialogTurnStatus.complete) {
                const reply = results.result;
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
                simulatedInput.value.promptId = prompt.promptId;
            })
            .send(simulatedInput)
            // Must be lambda due to updating simulatedInput.value.promptId in async test flow
            .assertReply(() => `You said ${ JSON.stringify(simulatedInput.value) }`);
    });

    it('should call AdaptiveCardPrompt using dc.beginDialog().', async function() {
        // Initialize TestAdapter.
        const prompt = new AdaptiveCardPrompt('prompt');

        const adapter = new TestAdapter(async turnContext => {
            const dc = await dialogs.createContext(turnContext);

            const results = await dc.continueDialog();
            if (results.status === DialogTurnStatus.empty) {
                await dc.beginDialog('prompt', { prompt: { attachments: [card] } });
            } else if (results.status === DialogTurnStatus.complete) {
                const reply = results.result;
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
                simulatedInput.value.promptId = prompt.promptId;
            })
            .send(simulatedInput)
            // Must be lambda due to updating simulatedInput.value.promptId in async test flow
            .assertReply(() => `You said ${ JSON.stringify(simulatedInput.value) }`);
    });

    it('should create a new promptId for each onPrompt() call.', async function() {
        // Initialize TestAdapter.
        const prompt = new AdaptiveCardPrompt('prompt');

        const adapter = new TestAdapter(async turnContext => {
            const dc = await dialogs.createContext(turnContext);

            const results = await dc.continueDialog();
            if (results.status === DialogTurnStatus.empty) {
                await dc.prompt('prompt', { prompt: { attachments: [card] } });
            } else if (results.status === DialogTurnStatus.complete) {
                const reply = results.result;
                await turnContext.sendActivity(reply['promptId']);
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
            // Must be lambda due to updating simulatedInput.value.promptId in async test flow
            .assertReply(() => simulatedInput.value.promptId);
        await adapter.send('Hello')
            .assertReply((activity) => {
                assertActivityHasCard(activity);
                simulatedInput.value.promptId = prompt.promptId;
            })
            .send(simulatedInput)
            // Must be lambda due to updating simulatedInput.value.promptId in async test flow
            .assertReply(() => simulatedInput.value.promptId);
    });

    it('should use retryPrompt on retries, if given, and attemptsBeforeCardRedisplayed allows for it', async function() {
        // Initialize TestAdapter.
        const prompt = new AdaptiveCardPrompt('prompt', null, { attemptsBeforeCardRedisplayed: 1 });

        const adapter = new TestAdapter(async turnContext => {
            const dc = await dialogs.createContext(turnContext);

            const results = await dc.continueDialog();
            if (results.status === DialogTurnStatus.empty) {
                await dc.prompt('prompt', { prompt: { attachments: [card] }, retryPrompt: { text: 'RETRY', attachments: [card] } });
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
            .send('abc')
            .assertReply('Please fill out the Adaptive Card')
            .assertReply('RETRY');
    });

    it('should allow for custom promptId that doesn\'t change on reprompt', async function() {
        // Note: This will fail simply because promptIds don't match the stubbed Math.random()
        // Initialize TestAdapter.
        const customId = 'custom';
        const prompt = new AdaptiveCardPrompt('prompt', null, {
            promptId: customId,
            attemptsBeforeCardRedisplayed: 1
        });

        const adapter = new TestAdapter(async turnContext => {
            const dc = await dialogs.createContext(turnContext);

            const results = await dc.continueDialog();
            if (results.status === DialogTurnStatus.empty) {
                await dc.prompt('prompt', { prompt: { attachments: [card] } });
            } else if (results.status === DialogTurnStatus.complete) {
                const reply = results.result;
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
            .assertReply((activity) => assert.equal(activity.attachments[0].content.selectAction.data.promptId, customId))
            .send(simulatedInput)
            .assertReply((activity) => assert.equal(activity.attachments[0].content.selectAction.data.promptId, customId));
    });

    it('prompt can be string if card passed in constructor', async function() {
        // Initialize TestAdapter.
        const prompt = new AdaptiveCardPrompt('prompt', null, { card: card });

        const adapter = new TestAdapter(async turnContext => {
            const dc = await dialogs.createContext(turnContext);

            const results = await dc.continueDialog();
            if (results.status === DialogTurnStatus.empty) {
                await dc.prompt('prompt', { prompt: 'STRING' });
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
            .assertReply('STRING');
    });

    it('should throw if no attachment passed in constructor or set', async function() {
        // Initialize TestAdapter.
        const prompt = new AdaptiveCardPrompt('prompt', null, { });

        const adapter = new TestAdapter(async turnContext => {
            const dc = await dialogs.createContext(turnContext);

            const results = await dc.continueDialog();
            if (results.status === DialogTurnStatus.empty) {
                try {
                    await dc.prompt('prompt', {});
                } catch (err) {
                    await dc.context.sendActivity(err.message);
                }
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
            .assertReply('No Adaptive Card provided. Include in the constructor or PromptOptions.prompt.attachments[0]');
    });

    it('should throw if card is not a valid adaptive card', async function() {
        // Initialize TestAdapter.
        const prompt = new AdaptiveCardPrompt('prompt', null, { card: { content: cardJson, contentType: 'invalidCard' } });

        const adapter = new TestAdapter(async turnContext => {
            const dc = await dialogs.createContext(turnContext);

            const results = await dc.continueDialog();
            if (results.status === DialogTurnStatus.empty) {
                try {
                    await dc.prompt('prompt', {});
                } catch (err) {
                    await dc.context.sendActivity(err.message);
                }
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
            .assertReply(`Attachment is not a valid Adaptive Card.\n`+
            `Ensure card.contentType is 'application/vnd.microsoft.card.adaptive'\n`+
            `and card.content contains the card json`);
    });

    it('should accept a custom validator that handles valid context', async function() {
        // Initialize TestAdapter.
        let usedValidator = false;
        const prompt = new AdaptiveCardPrompt('prompt', async () => {
            usedValidator = true;
            return true;
        });

        const adapter = new TestAdapter(async turnContext => {
            const dc = await dialogs.createContext(turnContext);

            const results = await dc.continueDialog();
            if (results.status === DialogTurnStatus.empty) {
                await dc.prompt('prompt', { prompt: { attachments: [card] } });
            } else if (results.status === DialogTurnStatus.complete) {
                const reply = results.result;
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
                simulatedInput.value.promptId = prompt.promptId;
            })
            .send(simulatedInput)
            // Must be lambda due to updating simulatedInput.value.promptId in async test flow
            .assertReply(() => `You said ${ JSON.stringify(simulatedInput.value) }`);
        assert.equal(usedValidator, true);
    });

    it('should accept a custom validator that handles invalid context', async function() {
        // Initialize TestAdapter.
        let usedValidator = false;
        const prompt = new AdaptiveCardPrompt('prompt', async (context) => {
            usedValidator = true;
            await context.context.sendActivity('FAILED');
            return false;
        });

        const adapter = new TestAdapter(async turnContext => {
            const dc = await dialogs.createContext(turnContext);

            const results = await dc.continueDialog();
            if (results.status === DialogTurnStatus.empty) {
                await dc.prompt('prompt', { prompt: { attachments: [card] } });
            } else if (results.status === DialogTurnStatus.complete) {
                const reply = results.result;
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
                simulatedInput.value.promptId = prompt.promptId;
            })
            .send(simulatedInput)
            .assertReply('FAILED');
        assert.equal(usedValidator, true);
    });

    it('should track the number of attempts', async function() {
        // Initialize TestAdapter.
        let attempts = 0;
        const prompt = new AdaptiveCardPrompt('prompt', async (context) => {
            attempts = context.state['attemptCount'];
            return false;
        }, { attemptsBeforeCardRedisplayed: 99 });

        const adapter = new TestAdapter(async turnContext => {
            const dc = await dialogs.createContext(turnContext);

            const results = await dc.continueDialog();
            if (results.status === DialogTurnStatus.empty) {
                await dc.prompt('prompt', { prompt: { attachments: [card] } });
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
            .assertReply('Invalid Response')
            .send(simulatedInput)
            .assertReply('Invalid Response')
            .send(simulatedInput)
            .assertReply('Invalid Response');
        assert.equal(attempts, 3);
    });

    it('should recognize card input', async function() {
        // Initialize TestAdapter.
        let usedValidator = false;
        const prompt = new AdaptiveCardPrompt('prompt', async (context) => {
            assert.equal(context.recognized.succeeded, true);
            usedValidator = true;
            return true;
        });

        const adapter = new TestAdapter(async turnContext => {
            const dc = await dialogs.createContext(turnContext);

            const results = await dc.continueDialog();
            if (results.status === DialogTurnStatus.empty) {
                await dc.prompt('prompt', { prompt: { attachments: [card] } });
            } else if (results.status === DialogTurnStatus.complete) {
                const reply = results.result;
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
            .assertReply((activity) => {
                assertActivityHasCard(activity);
                simulatedInput.value.promptId = prompt.promptId;
            })
            .send(simulatedInput)
            // Must be lambda due to updating simulatedInput.value.promptId in async test flow
            .assertReply(() => `You said ${ JSON.stringify(simulatedInput.value) }`);
        assert.equal(usedValidator, true);
    });

    it('should not recognize text input and should display custom input fail message', async function() {
        // Initialize TestAdapter.
        simulatedInput.value = undefined;
        simulatedInput.text = 'Should fail';
        const failMessage = 'Test input fail message';
        const prompt = new AdaptiveCardPrompt('prompt', null, {
            inputFailMessage: failMessage
        });

        const adapter = new TestAdapter(async turnContext => {
            const dc = await dialogs.createContext(turnContext);

            const results = await dc.continueDialog();
            if (results.status === DialogTurnStatus.empty) {
                await dc.prompt('prompt', { prompt: { attachments: [card] } });
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
            .assertReply((activity) => assert.equal(activity.attachments[0].contentType, 'application/vnd.microsoft.card.adaptive'))
            .send(simulatedInput)
            // Must be lambda due to updating simulatedInput.value.promptId in async test flow
            .assertReply(() => failMessage);
    });

    it('should not successfully recognize if input comes from card with wrong id', async function() {
        // Initialize TestAdapter.
        simulatedInput.value.promptId = 'wrongId';
        const prompt = new AdaptiveCardPrompt('prompt');

        const adapter = new TestAdapter(async turnContext => {
            const dc = await dialogs.createContext(turnContext);

            const results = await dc.continueDialog();
            if (results.status === DialogTurnStatus.empty) {
                await dc.prompt('prompt', { prompt: { attachments: [card] } });
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
            .assertReply((activity) => assert.equal(activity.attachments[0].contentType, 'application/vnd.microsoft.card.adaptive'))
            .send(simulatedInput)
            .assertReply(`Invalid Response`);
    });

    it('should not successfully recognize with missing required ids and should use custom missing ids message', async function() {
        // Initialize TestAdapter.
        const prompt = new AdaptiveCardPrompt('prompt', null, {
            requiredInputIds: ['test1', 'test2', 'test3'],
            missingRequiredInputsMessage: 'test inputs missing'
        });

        const adapter = new TestAdapter(async turnContext => {
            const dc = await dialogs.createContext(turnContext);

            const results = await dc.continueDialog();
            if (results.status === DialogTurnStatus.empty) {
                await dc.prompt('prompt', { prompt: { attachments: [card] } });
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
            .assertReply('test inputs missing: test1, test2, test3');
    });

    it('should successfully recognize if all required ids supplied', async function() {
        // Initialize TestAdapter.
        const prompt = new AdaptiveCardPrompt('prompt', null, {
            requiredInputIds: Object.keys(simulatedInput.value),
            missingRequiredInputsMessage: 'test inputs missing'
        });

        const adapter = new TestAdapter(async turnContext => {
            const dc = await dialogs.createContext(turnContext);

            const results = await dc.continueDialog();
            if (results.status === DialogTurnStatus.empty) {
                await dc.prompt('prompt', { prompt: { attachments: [card] } });
            } else if (results.status === DialogTurnStatus.complete) {
                const reply = results.result;
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
                simulatedInput.value.promptId = prompt.promptId;
            })
            .send(simulatedInput)
            // Must be lambda due to updating simulatedInput.value.promptId in async test flow
            .assertReply(() => `You said ${ JSON.stringify(simulatedInput.value) }`);
    });

    it('should re-display the card only when attempt count divisible by attemptsBeforeCardRedisplayed', async function() {
        // Initialize TestAdapter.
        const prompt = new AdaptiveCardPrompt('prompt', null, { attemptsBeforeCardRedisplayed: 5 });

        const adapter = new TestAdapter(async turnContext => {
            const dc = await dialogs.createContext(turnContext);

            const results = await dc.continueDialog();
            if (results.status === DialogTurnStatus.empty) {
                await dc.prompt('prompt', { prompt: { attachments: [card] } });
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
            })
            .send(simulatedInput)
            .assertReply('Invalid Response')
            .send(simulatedInput)
            .assertReply('Invalid Response')
            .send(simulatedInput)
            .assertReply('Invalid Response')
            .send(simulatedInput)
            .assertReply('Invalid Response')
            .send(simulatedInput)
            .assertReply((activity) => assert.equal(activity.attachments[0].contentType, 'application/vnd.microsoft.card.adaptive'));
    });

    it('should appropriately add promptId to card in all nested json occurrences', async function() {
        // Assert card doesn't already have promptIds
        const cardBefore = cardJson;
        assert(!cardBefore.selectAction.data || !cardBefore.selectAction.data.promptId);
        assert(!cardBefore.actions[0].data || !cardBefore.actions[0].data.promptId);
        assert(!cardBefore.actions[1].card.actions[0].data || !cardBefore.actions[1].card.actions[0].data.promptId);
        assert(!cardBefore.actions[2].card.actions[0].data || !cardBefore.actions[2].card.actions[0].data.promptId);
        assert(!cardBefore.actions[3].card.actions[0].data || !cardBefore.actions[3].card.actions[0].data.promptId);
        
        // Initialize TestAdapter.
        const prompt = new AdaptiveCardPrompt('prompt');

        const adapter = new TestAdapter(async turnContext => {
            const dc = await dialogs.createContext(turnContext);

            const results = await dc.continueDialog();
            if (results.status === DialogTurnStatus.empty) {
                await dc.prompt('prompt', { prompt: { attachments: [card] } });
            } else if (results.status === DialogTurnStatus.complete) {
                const reply = results.result;
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
                const cardAfter = activity.attachments[0].content;
                assert.equal(cardAfter.selectAction.data.promptId, prompt.promptId);
                assert.equal(cardAfter.actions[0].data.promptId, prompt.promptId);
                assert.equal(cardAfter.actions[1].card.actions[0].data.promptId, prompt.promptId);
                assert.equal(cardAfter.actions[2].card.actions[0].data.promptId, prompt.promptId);
                assert.equal(cardAfter.actions[3].card.actions[0].data.promptId, prompt.promptId);
            });
    });
});
