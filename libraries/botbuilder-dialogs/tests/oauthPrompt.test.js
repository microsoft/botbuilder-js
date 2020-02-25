const assert = require('assert');
const { ActionTypes, ActivityTypes, CardFactory, Channels, ConversationState, InputHints, MemoryStorage, TestAdapter, TurnContext } = require('botbuilder-core');
const { OAuthPrompt, DialogSet, DialogTurnStatus, ListStyle } = require('../');
const { AuthConstants } = require('../lib/prompts/skillsHelpers');

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

                adapter.signOutUser(new TurnContext(adapter, { channelId: activity.channelId, from: activity.recipient }), connectionName);
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
            .assertReply('attemptCount 3')
            .send(magicCode)
            .assertReply('Logged in');
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

    describe('private methods', () => {
        describe('sendOAuthCardAsync()', () => {
            class SendActivityAdapter {
                constructor(settings = {}) {
                    // Lazily and forcefully assign all properties and values to SendActivityAdapter instance.
                    Object.assign(this, settings);
                    this.BotIdentityKey = 'BotIdentityKey';
                }

                async getSignInLink(context, connectionName) {
                    assert(context, 'context not passed in to getSignInLink call.');
                    assert(connectionName, 'connectionName not passed in to getSignInLink call.');
                    if (this.connectionName) {
                        assert.strictEqual(connectionName, this.connectionName);
                    }
                    return this.signInLink;
                }

                async getUserToken(context, magicCode) {
                    assert(context, 'context not passed in to getSignInLink call.');
                    assert(magicCode, 'magicCode not passed in to getUserToken call');
                    return 'token';
                }
            }

            it(`should fail if adapter does not have 'getUserToken'`, async () => {
                const fakeAdapter = {};
                const context = new TurnContext(fakeAdapter, {
                    activity: {
                        channelId: Channels.Webchat,
                        serviceUrl: 'https://bing.com',
                    }
                });

                const prompt = new OAuthPrompt('OAuthPrompt', {});
                try {
                    await prompt.sendOAuthCardAsync(context);
                } catch (e) {
                    assert.strictEqual(e.message, `OAuthPrompt.prompt(): not supported for the current adapter.`);
                }
            });

            it('should send a well-constructed OAuthCard for channels with OAuthCard support', async () => {
                const connectionName = 'connection';
                const title = 'myTitle';
                const text = 'Sign in here';
                const signInLink = 'https://dev.botframework.com';
                const adapter = new SendActivityAdapter({
                    connectionName, signInLink,
                    text, title,
                });
                const context = new TurnContext(adapter, {
                    activity: {
                        channelId: Channels.Webchat,
                        serviceUrl: 'https://bing.com',
                    }
                });
                // Override sendActivity
                context.sendActivity = async function(activity) {
                    assert.strictEqual(activity.attachments.length, 1);
                    const attachment = activity.attachments[0];
                    assert.strictEqual(attachment.contentType, CardFactory.contentTypes.oauthCard);
                    const card = attachment.content;
                    assert.strictEqual(card.buttons.length, 1);
                    assert.strictEqual(card.connectionName, connectionName);
                    assert.strictEqual(card.text, text);
                    const button = card.buttons[0];
                    assert.strictEqual(button.type, ActionTypes.Signin);
                    assert.strictEqual(button.title, title);
                    // For non streaming activities where the channel supports OAuthCards,
                    // no link should be set on button.value.
                    assert.strictEqual(button.value, undefined);
                }.bind(context);

                const prompt = new OAuthPrompt('OAuthPrompt', { connectionName, title, text });
                await prompt.sendOAuthCardAsync(context);
            });
            
            it('should send a well-constructed OAuthCard for channels with OAuthCard support from a skill', async () => {
                const connectionName = 'connection';
                const title = 'myTitle';
                const text = 'Sign in here';
                const signInLink = 'https://dev.botframework.com';
                const adapter = new SendActivityAdapter({
                    connectionName, signInLink,
                    text, title,
                });
                const context = new TurnContext(adapter, {
                    activity: {
                        channelId: Channels.Webchat,
                        serviceUrl: 'https://bing.com',
                    }
                });
                context.turnState.set(adapter.BotIdentityKey, new ClaimsIdentity([
                    { type: 'azp', value: uuid() },
                    { type: 'ver', value: '2.0' },
                    { type: 'aud', value: uuid() }
                ]));
                // Override sendActivity
                context.sendActivity = async function(activity) {
                    assert.strictEqual(activity.attachments.length, 1);
                    const attachment = activity.attachments[0];
                    assert.strictEqual(attachment.contentType, CardFactory.contentTypes.oauthCard);
                    const card = attachment.content;
                    assert.strictEqual(card.buttons.length, 1);
                    assert.strictEqual(card.connectionName, connectionName);
                    assert.strictEqual(card.text, text);
                    const button = card.buttons[0];
                    assert.strictEqual(button.type, ActionTypes.OpenUrl);
                    assert.strictEqual(button.title, title);
                    assert.strictEqual(button.value, signInLink);
                }.bind(context);

                const prompt = new OAuthPrompt('OAuthPrompt', { connectionName, title, text });
                await prompt.sendOAuthCardAsync(context);
            });

            it('should send a well-constructed OAuthCard for a streaming connection for channels with OAuthCard support', async () => {
                const connectionName = 'connection';
                const title = 'myTitle';
                const text = 'Sign in here';
                const signInLink = 'https://dev.botframework.com';
                const adapter = new SendActivityAdapter({
                    connectionName, signInLink,
                    text, title,
                });
                const context = new TurnContext(adapter, {
                    channelId: Channels.Webchat,
                    serviceUrl: 'wss://bing.com',
                });
                // Override sendActivity
                context.sendActivity = async function(activity) {
                    assert.strictEqual(activity.attachments.length, 1);
                    const attachment = activity.attachments[0];
                    assert.strictEqual(attachment.contentType, CardFactory.contentTypes.oauthCard);
                    const card = attachment.content;
                    assert.strictEqual(card.buttons.length, 1);
                    assert.strictEqual(card.connectionName, connectionName);
                    assert.strictEqual(card.text, text);
                    const button = card.buttons[0];
                    assert.strictEqual(button.type, ActionTypes.Signin);
                    assert.strictEqual(button.title, title);
                    // For streaming activities where the channel supports OAuthCards,
                    // a link should be set on button.value.
                    assert.strictEqual(button.value, signInLink);
                }.bind(context);

                const prompt = new OAuthPrompt('OAuthPrompt', { connectionName, title, text });
                await prompt.sendOAuthCardAsync(context);
            });

            it('should use the passed in activity as a base for the prompt', async () => {
                const connectionName = 'connection';
                const title = 'myTitle';
                const text = 'Sign in here';
                const signInLink = 'https://dev.botframework.com';
                const adapter = new SendActivityAdapter({
                    connectionName, signInLink,
                    text, title,
                });
                const context = new TurnContext(adapter, {
                    activity: {
                        channelId: Channels.Webchat,
                        serviceUrl: 'https://bing.com',
                    }
                });
                context.turnState.set(adapter.BotIdentityKey, new ClaimsIdentity([
                    { type: 'azp', value: uuid() },
                    { type: 'ver', value: '2.0' },
                    { type: 'aud', value: AuthConstants.ToBotFromChannelTokenIssuer }
                ]));
                // Override sendActivity
                context.sendActivity = async function(activity) {
                    assert.strictEqual(activity.value, 1);
                    assert.strictEqual(activity.attachments.length, 1);
                    const attachment = activity.attachments[0];
                    assert.strictEqual(attachment.contentType, CardFactory.contentTypes.oauthCard);
                    const card = attachment.content;
                    assert.strictEqual(card.buttons.length, 1);
                    assert.strictEqual(card.connectionName, connectionName);
                    assert.strictEqual(card.text, text);
                    const button = card.buttons[0];
                    assert.strictEqual(button.type, ActionTypes.Signin);
                    assert.strictEqual(button.title, title);
                    // For non streaming activities where the channel supports OAuthCards,
                    // no link should be set on button.value.
                    assert.strictEqual(button.value, undefined);
                }.bind(context);

                const prompt = new OAuthPrompt('OAuthPrompt', { connectionName, title, text });
                await prompt.sendOAuthCardAsync(context, { value: 1 });
            });
        });
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

class ClaimsIdentity {
    /**
     * Each claim should be { type: 'type', value: 'value' }
     * @param {*} claims 
     * @param {*} isAuthenticated 
     */
    constructor(claims = [], isAuthenticated= false) {
        this.claims = claims;
        this.isAuthenticated = isAuthenticated;
    }

    getClaimValue(claimType) {
        const claim = this.claims.find((c) => c.type === claimType);

        return claim ? claim.value : null;
    }
}

function uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
