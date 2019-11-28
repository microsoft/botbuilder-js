const { ActivityTypes, CardFactory, ConversationState, InputHints, MemoryStorage, TestAdapter, TurnContext } = require('botbuilder-core');
const { OAuthPrompt, OAuthPromptSettings, DialogSet, DialogTurnStatus, ListStyle } = require('../');
const assert = require('assert');

const beginMessage = { text: `begin`, type: 'message' };
const answerMessage = { text: `yes`, type: 'message' };
const invalidMessage = { text: `what?`, type: 'message' };

describe('OAuthPrompt', function () {
    this.timeout(5000);

    it('should call OAuthPrompt', async function () {
        var connectionName = "myConnection";
        var token = "abc123";

        // Initialize TestAdapter.
        const adapter = new TestAdapter(async (turnContext) => {
            const dc = await dialogs.createContext(turnContext);

            const results = await dc.continueDialog();
            if (results.status === DialogTurnStatus.empty) {
                await dc.prompt('prompt', { });
            } else if (results.status === DialogTurnStatus.complete) {
                if (results.result.token) {
                    await turnContext.sendActivity(`Logged in.`);
                }
                else {
                    await turnContext.sendActivity(`Failed`);
                }
            }
            await convoState.saveChanges(turnContext);
        });

        // Create new ConversationState with MemoryStorage
        const convoState = new ConversationState(new MemoryStorage());

        // Create a DialogState property, DialogSet and OAuthPrompt
        const dialogState = convoState.createProperty('dialogState');
        const dialogs = new DialogSet(dialogState);
        dialogs.add(new OAuthPrompt('prompt', {
                connectionName,
                title: 'Login',
                timeout: 300000
            }));

        await adapter.send('Hello')
            .assertReply(activity  => {
                assert(activity.attachments.length === 1);
                assert(activity.attachments[0].contentType === CardFactory.contentTypes.oauthCard);
                assert(activity.inputHint === InputHints.AcceptingInput);
                assert(!activity.attachments[0].content.buttons[0].value);

                // send a mock EventActivity back to the bot with the token
                adapter.addUserToken(connectionName, activity.channelId, activity.recipient.id, token);

                var eventActivity = createReply(activity);
                eventActivity.type = ActivityTypes.Event;
                var from = eventActivity.from;
                eventActivity.from = eventActivity.recipient;
                eventActivity.recipient = from;
                eventActivity.name = "tokens/response";
                eventActivity.value = {
                    connectionName,
                    token
                };

                adapter.send(eventActivity);
            })
            .assertReply('Logged in.');
    });

    it('should call OAuthPrompt with code', async function () {
        var connectionName = "myConnection";
        var token = "abc123";
        var magicCode = "888999";

        // Initialize TestAdapter.
        const adapter = new TestAdapter(async (turnContext) => {
            const dc = await dialogs.createContext(turnContext);

            const results = await dc.continueDialog();
            if (results.status === DialogTurnStatus.empty) {
                await dc.prompt('prompt', { });
            } else if (results.status === DialogTurnStatus.complete) {
                if (results.result.token) {
                    await turnContext.sendActivity(`Logged in.`);
                }
                else {
                    await turnContext.sendActivity(`Failed`);
                }
            }
            await convoState.saveChanges(turnContext);
        });

        // Create new ConversationState with MemoryStorage
        const convoState = new ConversationState(new MemoryStorage());

        // Create a DialogState property, DialogSet and OAuthPrompt
        const dialogState = convoState.createProperty('dialogState');
        const dialogs = new DialogSet(dialogState);
        dialogs.add(new OAuthPrompt('prompt', {
                connectionName,
                title: 'Login',
                timeout: 300000
            }));

        await adapter.send('Hello')
            .assertReply(activity  => {
                assert(activity.attachments.length === 1);
                assert(activity.attachments[0].contentType === CardFactory.contentTypes.oauthCard);

                adapter.addUserToken(connectionName, activity.channelId, activity.recipient.id, token, magicCode);
            })
            .send(magicCode)
            .assertReply('Logged in.');
    });

    it('should see attemptCount increment', async function() {
        var connectionName = 'myConnection';
        var token = 'abc123';
        var magicCode = '888999';

        // Create new ConversationState with MemoryStorage
        const convoState = new ConversationState(new MemoryStorage());

        // Create a DialogState property, DialogSet and OAuthPrompt
        const dialogState = convoState.createProperty('dialogState');
        const dialogs = new DialogSet(dialogState);
        
        dialogs.add(new OAuthPrompt('prompt', {
            connectionName,
            title: 'Login',
            timeout: 300000
        }, async (prompt) => {
            if (prompt.recognized.succeeded) {
                return true;
            }
            prompt.context.sendActivity(`attemptCount ${ prompt.attemptCount }`);
            return false;
        }));

        // Initialize TestAdapter.
        const adapter = new TestAdapter(async (turnContext) => {
            const dc = await dialogs.createContext(turnContext);

            const results = await dc.continueDialog();
            if (results.status === DialogTurnStatus.empty) {
                await dc.prompt('prompt', { retryPrompt: 'Try again' });
            } else if (results.status === DialogTurnStatus.complete) {
                if (results.result.token) {
                    await turnContext.sendActivity('Logged in');
                }
                else {
                    await turnContext.sendActivity('Failed');
                }
            }
            await convoState.saveChanges(turnContext);
        });
        
        await adapter.send('Hello')
            .assertReply(activity => {
                assert(activity.attachments.length === 1);
                assert(activity.attachments[0].contentType === CardFactory.contentTypes.oauthCard);

                adapter.addUserToken(connectionName, activity.channelId, activity.recipient.id, token, magicCode);
            })
            .send('1')
            .assertReply('attemptCount 1')
            .send('12')
            .assertReply('attemptCount 2')
            .send('123')
            .assertReply('attemptCount 3')
            .send(magicCode)
            .assertReply(activity => {
                assert(activity.text === 'Logged in');

                adapter.signOutUser(new TurnContext(adapter, { channelId: activity.channelId, recipient: activity.recipient }), connectionName);
            })
            .send('Another!')
            .assertReply(activity => {
                assert(activity.attachments.length === 1);
                assert(activity.attachments[0].contentType === CardFactory.contentTypes.oauthCard);

                adapter.addUserToken(connectionName, activity.channelId, activity.recipient.id, token, magicCode);
            })
            .send('1234')
            .assertReply('attemptCount 1')
            .send('12345')
            .assertReply('attemptCount 2')
            .send('123456')
            .assertReply('Failed');
    });

    it('should call OAuthPrompt for streaming connection', async function () {
        var connectionName = "myConnection";
        var token = "abc123";

        // Initialize TestAdapter.
        const adapter = new TestAdapter(async (turnContext) => {
            const dc = await dialogs.createContext(turnContext);

            const results = await dc.continueDialog();
            if (results.status === DialogTurnStatus.empty) {
                await dc.prompt('prompt', { });
            } else if (results.status === DialogTurnStatus.complete) {
                if (results.result.token) {
                    await turnContext.sendActivity(`Logged in.`);
                }
                else {
                    await turnContext.sendActivity(`Failed`);
                }
            }
            await convoState.saveChanges(turnContext);
        });

        // Create new ConversationState with MemoryStorage and register the state as middleware.
        const convoState = new ConversationState(new MemoryStorage());

        // Create a DialogState property, DialogSet and AttachmentPrompt.
        const dialogState = convoState.createProperty('dialogState');
        const dialogs = new DialogSet(dialogState);
        dialogs.add(new OAuthPrompt('prompt', {
                connectionName,
                title: 'Login',
                timeout: 300000
            }));

        const streamingActivity = {
            activityId: '1234',
            channelId: 'directlinespeech',
            serviceUrl: 'urn:botframework.com:websocket:wss://channel.com/blah',
            user: { id: 'user', name: 'User Name' },
            bot: { id: 'bot', name: 'Bot Name' },
            conversation: { 
                id: 'convo1',
                properties: {
                    'foo': 'bar'
                }
            },
            attachments: [],
            type: 'message',
            text: 'Hello'
        };

        await adapter.send(streamingActivity)
            .assertReply(activity  => {
                assert(activity.attachments.length === 1);
                assert(activity.attachments[0].contentType === CardFactory.contentTypes.oauthCard);
                assert(activity.inputHint === InputHints.AcceptingInput);
                assert(activity.attachments[0].content.buttons[0].value);

                // send a mock EventActivity back to the bot with the token
                adapter.addUserToken(connectionName, activity.channelId, activity.recipient.id, token);

                var eventActivity = createReply(activity);
                eventActivity.type = ActivityTypes.Event;
                var from = eventActivity.from;
                eventActivity.from = eventActivity.recipient;
                eventActivity.recipient = from;
                eventActivity.name = "tokens/response";
                eventActivity.value = {
                    connectionName,
                    token
                };

                adapter.send(eventActivity);
            })
            .assertReply('Logged in.');
    });
});

function createReply(activity) {
    return {
        type: ActivityTypes.Message,
        from: { id: activity.recipient.id, name: activity.recipient.name },
        recipient: { id: activity.from.id, name: activity.from.name },
        replyToId: activity.id,
        serviceUrl: activity.serviceUrl,
        channelId: activity.channelId,
        conversation: { isGroup: activity.conversation.isGroup, id: activity.conversation.id, name: activity.conversation.name },
    };
}
