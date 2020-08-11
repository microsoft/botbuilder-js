const assert = require('assert');
const { ActionTypes, ActivityTypes, CardFactory, Channels, ConversationState, InputHints, MemoryStorage, TestAdapter, tokenResponseEventName, TurnContext, verifyStateOperationName } = require('botbuilder-core');
const { spy } = require('sinon');
const { ok, strictEqual } = require('assert');
const { OAuthPrompt, DialogSet, DialogTurnStatus, ListStyle } = require('../');
const { AuthConstants } = require('../lib/prompts/skillsHelpers');

describe('OAuthPrompt', function() {
    this.timeout(60000);

    it('should call OAuthPrompt', async function() {
        var connectionName = 'myConnection';
        var token = 'abc123';

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
                eventActivity.name = 'tokens/response';
                eventActivity.value = {
                    connectionName,
                    token
                };

                adapter.send(eventActivity);
            })
            .assertReply('Logged in.');
    });

    it('should call OAuthPrompt with code', async function() {
        var connectionName = 'myConnection';
        var token = 'abc123';
        var magicCode = '888999';

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

    it('should timeout OAuthPrompt with message activity', async function() {
        const message = {
            activityId: '1234',
            type: ActivityTypes.message,
        };

        await testTimeout(message);
    });

    it('should timeout OAuthPrompt with tokenResponseEvent activity', async function() {
        const message = {
            activityId: '1234',
            type: ActivityTypes.Event,
            name: tokenResponseEventName,
            channelId: Channels.Msteams,
        };

        await testTimeout(message);
    });

    it('should timeout OAuthPrompt with verifyStateOperation activity', async function() {
        const message = {
            activityId: '1234',
            type: ActivityTypes.Invoke,
            name: verifyStateOperationName,
        };

        await testTimeout(message);
    });

    it('should not timeout OAuthPrompt with custom event activity', async function() {
        const message = {
            activityId: '1234',
            type: ActivityTypes.Event,
            name: 'custom_event_name',
        };

        await testTimeout(message, false, 'Failed', 'Ended' );
    });

    it('should end OAuthPrompt on invalid message when endOnInvalidMessage', async function() {
        const message = {
            activityId: '1234',
            type: ActivityTypes.Event,
            name: 'custom_event_name',
        };

        var connectionName = 'myConnection';
        var token = 'abc123';
        var magicCode = '888999';
        const exchangeToken = 'exch123';
    
        // Create new ConversationState with MemoryStorage
        const convoState = new ConversationState(new MemoryStorage());
    
        // Create a DialogState property, DialogSet and OAuthPrompt
        const dialogState = convoState.createProperty('dialogState');
        const dialogs = new DialogSet(dialogState);
        dialogs.add(new OAuthPrompt('prompt', {
            connectionName,
            title: 'Login',
            endOnInvalidMessage: true,
        }, async (prompt) => {
            if (prompt.recognized.succeeded) {
                assert(false, 'recognition succeeded but should have failed during test');
                return true;
            }
            
            return false;
        }));
    
        // Initialize TestAdapter.
        const adapter = new TestAdapter(async (turnContext) => {
            const dc = await dialogs.createContext(turnContext);
    
            const results = await dc.continueDialog();
            if (results.status === DialogTurnStatus.empty) {
                await dc.prompt('prompt', { });
            } else if (results.status === DialogTurnStatus.complete) {
                if (results.result && results.result.token) {
                    await turnContext.sendActivity('Failed');
                }
                else {
                    await turnContext.sendActivity('Ended');
                }
            }
            await convoState.saveChanges(turnContext);
        });
    
        await adapter.send('Hello')
            .assertReply(activity  => {
                assert(activity.attachments.length === 1);
                assert(activity.attachments[0].contentType === CardFactory.contentTypes.oauthCard);
    
                adapter.addUserToken(connectionName, activity.channelId, activity.recipient.id, token, magicCode);
                adapter.addExchangeableToken(connectionName, activity.channelId, activity.recipient.id, exchangeToken, token);
            })  
            .send('invalid text message here')
            .assertReply('Ended');
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

    it('should call OAuthPrompt for streaming connection', async function() {
        var connectionName = 'myConnection';
        var token = 'abc123';

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
                eventActivity.name = 'tokens/response';
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
                    assert(context, 'context not passed in to getUserToken call.');
                    assert(magicCode, 'magicCode not passed in to getUserToken call');
                    return 'token';
                }

                async getSignInResource(context, connectionName, userId) {
                    assert(context, 'context not passed in to getSignInResource call.');
                    assert(connectionName, 'connectionName not passed in to getSignInResource call');
                    assert(userId, 'userId not passed in to getSignInResource call');
                    return {
                        signInLink: this.signInLink,
                        tokenExchangeResource: this.tokenExchangeResource
                    };
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
                    assert.strictEqual(e.message, `OAuthPrompt.sendOAuthCardAsync(): not supported for the current adapter.`);
                }
            });

            it('should send a well-constructed OAuthCard for channels with OAuthCard support', async () => {
                const connectionName = 'connection';
                const title = 'myTitle';
                const text = 'Sign in here';
                const signInLink = 'https://dev.botframework.com';
                const tokenExchangeResource = {
                    id: 'id',
                    uri: 'some uri'
                };
                const adapter = new SendActivityAdapter({
                    connectionName, signInLink,
                    text, title, tokenExchangeResource
                });
                const context = new TurnContext(adapter, {
                    channelId: Channels.Webchat,
                    serviceUrl: 'https://bing.com',
                    from: {
                        id: 'someId'
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
                const tokenExchangeResource = {
                    id: 'id',
                    uri: 'some uri'
                };
                const adapter = new SendActivityAdapter({
                    connectionName, signInLink,
                    text, title, tokenExchangeResource
                });
                const context = new TurnContext(adapter, {
                    channelId: Channels.Emulator,
                    serviceUrl: 'https://bing.com',
                    from: {
                        id: 'someId'
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
                    from: {
                        id: 'someId'
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
                    channelId: Channels.Webchat,
                    serviceUrl: 'https://bing.com',
                    from: {
                        id: 'someId'
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

        describe('recognizeToken()', () => {
            it('should throw an error during a Token Response Event and adapter is missing "createConnectorClientWithIdentity"', async () => {
                const oAuthPrompt = new OAuthPrompt('OAuthPrompt');
                // Create spy for private instance method called during recognizeToken
                const isTokenResponseEventSpy = spy(oAuthPrompt, 'isTokenResponseEvent');
                isTokenResponseEventSpy.returnValues = [ true ];
                
                const adapter = new TestAdapter(async (context) => { /* no-op */ });
                const conversationState = new ConversationState(new MemoryStorage());
                const dialogState = conversationState.createProperty('DialogState');
                const dialogSet = new DialogSet(dialogState);
                const dc = await dialogSet.createContext(new TurnContext(adapter, { type: ActivityTypes.Event, name: tokenResponseEventName, conversation: { id: 'conversationId' }, channelId: Channels.Test }));
                function setActiveDialog(dc, dialog) {
                    // Create stack if not already there.
                    dc.stack = dc.stack || [];
                    dc.stack.unshift({ id: dialog.id, state: {
                        state: {},
                        [dialog.PersistedCaller]: { callerServiceUrl: 'https://test1', scope: 'parent-appId' },
                        options: { prompt: 'Login time' },
                        expires: new Date().getTime() + 900000 }});
                }

                setActiveDialog(dc, oAuthPrompt);

                try {
                    await oAuthPrompt.recognizeToken(dc);
                    throw new Error('recognizeToken call should have failed');
                } catch (err) {
                    ok(isTokenResponseEventSpy.calledOnce, 'isTokenResponseEventSpy called more than once');
                    ok(err instanceof TypeError, `unexpected error: ${ err.toString() }`);
                    strictEqual(err.message, 'OAuthPrompt: ConnectorClientBuilder interface not implemented by the current adapter');
                }

            });
        });
    });

    describe('Test Adapter should be able to exchange tokens for uri and token', async function() {
        let adapter;
        const connectionName = 'myConnection';
        const exchangeToken = 'exch123';
        const token = 'abc123';
        this.beforeEach(function() {
            adapter = new TestAdapter(async (turnContext) => {
                const userId = 'blah';
                adapter.addExchangeableToken(connectionName, turnContext.activity.channelId, userId, exchangeToken, token);

                // Positive case: Token
                let result = await adapter.exchangeToken(turnContext, connectionName, userId, {token: exchangeToken});
                assert(result);
                assert.strictEqual(result.token, token);
                assert.strictEqual(result.connectionName, connectionName);
                // Positive case: URI
                result = await adapter.exchangeToken(turnContext, connectionName, userId, {uri: exchangeToken});
                assert(result);
                assert.strictEqual(result.token, token);
                assert.strictEqual(result.connectionName, connectionName);
                // Negative case: Token
                result = await adapter.exchangeToken(turnContext, connectionName, userId, {token: 'beepboop'});
                assert(result === null);
                // Negative case: URI 
                result = await adapter.exchangeToken(turnContext, connectionName, userId, {uri: 'beepboop'});
                assert(result === null);
            });
        });

        it('Test adapter should be able to perform token exchanges for token', async function() {
            await adapter
                .send('hello');
        });
    });

    describe('OAuthPrompt should be able to exchange tokens', async function() {
        let adapter;
        const connectionName = 'myConnection';
        const exchangeToken = 'exch123';
        const token = 'abc123';
        this.beforeEach(function() {
            // Initialize TestAdapter
            adapter = new TestAdapter(async (turnContext) => {
                const dc = await dialogs.createContext(turnContext);
                const results = await dc.continueDialog();
                if(results.status === DialogTurnStatus.empty) {
                    await dc.prompt('OAuthPrompt', {});
                }
                else if(results.status === DialogTurnStatus.complete) {
                    if (results.result.token) {
                        await turnContext.sendActivity(`Logged in.`);
                    }
                    else {
                        await turnContext.sendActivity('Failed');
                    }
                }
                await convoState.saveChanges(turnContext);
            });


            //Create new ConversationState with MemoryStorage
            const convoState = new ConversationState(new MemoryStorage());

            //Create a DialogState property, DialogSet and OAuthPrompt
            const dialogState = convoState.createProperty('dialogState');
            const dialogs = new DialogSet(dialogState);

            dialogs.add(new OAuthPrompt('OAuthPrompt', {
                connectionName,
                title: 'Sign in',
                timeout: 30000,
                text: 'Please sign in'
            }));
        });

        it('Should handle token exchange invoke requests via OAuthPrompt', async function() {
            await adapter
                .send('hello')
                .assertReply(activity => {
                    assert.strictEqual(activity.attachments.length, 1);
                    assert.strictEqual(activity.attachments[0].contentType, CardFactory.contentTypes.oauthCard);
                    assert(activity.inputHint === InputHints.AcceptingInput);

                    // Add an exchangeable token to the adapter
                    adapter.addExchangeableToken(connectionName, activity.channelId, activity.recipient.id, exchangeToken, token);
                })
                .send({
                    type: ActivityTypes.Invoke,
                    name: 'signin/tokenExchange',
                    value: {
                        id: null,
                        connectionName: connectionName,
                        token: exchangeToken
                    }
                })
                .assertReply(a => {
                    assert.strictEqual('invokeResponse', a.type);
                    assert(a.value);
                    assert.strictEqual(a.value.status, 200);
                    assert.strictEqual(a.value.body.connectionName, connectionName);
                    assert(a.value.body.failureDetail === null);
                })
                .assertReply('Logged in.');
        });

        it('Should reject token exchange requests if token cannot be exchanged', async function() {
            await adapter
                .send('hello')
                .assertReply(activity => {
                    assert.strictEqual(activity.attachments.length, 1);
                    assert.strictEqual(activity.attachments[0].contentType, CardFactory.contentTypes.oauthCard);
                    assert(activity.inputHint === InputHints.AcceptingInput);

                // No exchangeable token is added to the adapter
                })
                .send({
                    type: ActivityTypes.Invoke,
                    name: 'signin/tokenExchange',
                    value: {
                        id: null,
                        connectionName: connectionName,
                        token: exchangeToken
                    }
                })
                .assertReply(a => {
                    assert.strictEqual('invokeResponse', a.type);
                    assert(a.value);
                    assert.strictEqual(a.value.status, 412);
                    assert(a.value.body.failureDetail);
                });
        });

        it('Should reject token exhchange requests with no body', async function() {
            await adapter
                .send('hello')
                .assertReply(activity => {
                    assert.strictEqual(activity.attachments.length, 1);
                    assert.strictEqual(activity.attachments[0].contentType, CardFactory.contentTypes.oauthCard);
                    assert(activity.inputHint === InputHints.AcceptingInput);

                // No exchangeable token is added to the adapter
                })
                .send({
                    type: ActivityTypes.Invoke,
                    name: 'signin/tokenExchange'
                //no body is sent
                })
                .assertReply(a => {
                    assert.strictEqual('invokeResponse', a.type);
                    assert(a.value);
                    assert.strictEqual(a.value.status, 400);
                    assert(a.value.body.failureDetail);
                });
        });

        it('Should reject token exhchange requests with wrong connection name', async function() {
            await adapter
                .send('hello')
                .assertReply(activity => {
                    assert.strictEqual(activity.attachments.length, 1);
                    assert.strictEqual(activity.attachments[0].contentType, CardFactory.contentTypes.oauthCard);
                    assert(activity.inputHint === InputHints.AcceptingInput);

                // No exchangeable token is added to the adapter
                })
                .send({
                    type: ActivityTypes.Invoke,
                    name: 'signin/tokenExchange',
                    value: {
                        id: null,
                        connectionName: 'foobar',
                        token: exchangeToken
                    }
                })
                .assertReply(a => {
                    assert.strictEqual('invokeResponse', a.type);
                    assert(a.value);
                    assert.strictEqual(a.value.status, 400);
                    assert.strictEqual(a.value.body.connectionName, connectionName);
                    assert(a.value.body.failureDetail);
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

async function testTimeout(oauthPromptActivity, shouldSucceed = true, tokenResponse = 'Failed', noTokenResonse = 'Ended') {
    var connectionName = 'myConnection';
    var token = 'abc123';
    var magicCode = '888999';
    const exchangeToken = 'exch123';

    // Create new ConversationState with MemoryStorage
    const convoState = new ConversationState(new MemoryStorage());

    // Create a DialogState property, DialogSet and OAuthPrompt
    const dialogState = convoState.createProperty('dialogState');
    const dialogs = new DialogSet(dialogState);
    dialogs.add(new OAuthPrompt('prompt', {
        connectionName,
        title: 'Login',
        timeout: 0
    }, async (prompt) => {
        if (prompt.recognized.succeeded) {
            assert(shouldSucceed, 'recognition succeeded but should have failed during testTimeout');
            return true;
        }
        
        assert(!shouldSucceed, 'recognition failed during testTimeout');
        return false;
    }));

    // Initialize TestAdapter.
    const adapter = new TestAdapter(async (turnContext) => {
        const dc = await dialogs.createContext(turnContext);

        if(!oauthPromptActivity.conversation) {
            oauthPromptActivity.conversation = turnContext.activity.conversation;
            oauthPromptActivity.recipient = turnContext.activity.recipient;
            oauthPromptActivity.from = turnContext.activity.from;
            oauthPromptActivity.serviceUrl = turnContext.activity.serviceUrl;
            oauthPromptActivity.channelId = turnContext.activity.channelId;
        }

        const results = await dc.continueDialog();
        if (results.status === DialogTurnStatus.empty) {
            await dc.prompt('prompt', { });
        } else if (results.status === DialogTurnStatus.complete || (results.status === DialogTurnStatus.waiting && !shouldSucceed)) {
            if (results.result && results.result.token) {
                await turnContext.sendActivity(tokenResponse);
            }
            else {
                await turnContext.sendActivity(noTokenResonse);
            }
        }
        await convoState.saveChanges(turnContext);
    });

    await adapter.send('Hello')
        .assertReply(activity  => {
            assert(activity.attachments.length === 1);
            assert(activity.attachments[0].contentType === CardFactory.contentTypes.oauthCard);

            adapter.addUserToken(connectionName, activity.channelId, activity.recipient.id, token, magicCode);
            adapter.addExchangeableToken(connectionName, activity.channelId, activity.recipient.id, exchangeToken, token);
        })  
        .send(oauthPromptActivity)
        .assertReply(noTokenResonse);
}
