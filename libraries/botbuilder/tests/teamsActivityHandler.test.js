const assert = require('assert');
const { TeamsActivityHandler } = require('../');
const { ActivityTypes, TestAdapter } = require('botbuilder-core');

function createInvokeActivity(name, value = {}, channelData = {}) {
    const activity = {
        type: ActivityTypes.Invoke,
        channelData,
        name,
        value,
    };
    return activity;
}

describe('TeamsActivityHandler', () => {
    describe('onTurnActivity()', () => {
        it('should not override the InvokeResponse on the context.turnState if it is set', done => {
            class InvokeHandler extends TeamsActivityHandler {
                async onInvokeActivity(context) {
                    assert(context, 'context not found');
                    await context.sendActivity({ type: 'invokeResponse', value: { status: 200, body: `I'm a teapot.` } });
                    return { status: 418 };
                }
            }
    
            const bot = new InvokeHandler();
            const adapter = new TestAdapter(async context => {
                await bot.run(context);
            });
    
            adapter.send({ type: ActivityTypes.Invoke })
                .assertReply(activity => {
                    assert.strictEqual(activity.type, 'invokeResponse');
                    assert(activity.value, 'activity.value not found');
                    assert.strictEqual(activity.value.status, 200);
                    assert.strictEqual(activity.value.body, `I'm a teapot.`);
                    done();
                })
                .catch(err => done(err));
    
        });

        it('should call onTurnActivity if non-Invoke is received', done => {
            const bot = new TeamsActivityHandler();
            bot.onMessage(async (context, next) => {
                await context.sendActivity('Hello');
                await next();
            });
    
            const adapter = new TestAdapter(async context => {
                await bot.run(context);
            });
    
            adapter.send({ type: ActivityTypes.Message, text: 'Hello' })
                .assertReply(activity => {
                    assert.strictEqual(activity.type, ActivityTypes.Message);
                    assert.strictEqual(activity.text, 'Hello');
                    done();
                })
                .catch(err => done(err));
        });
    });

    describe('should send a BadRequest status code if', () => {
        it('a bad BotMessagePreview.action is received by the bot', async () => {
            const bot = new TeamsActivityHandler();
    
            const adapter = new TestAdapter(async context => {
                await bot.run(context);
            });
    
            const fileConsentActivity = createInvokeActivity('composeExtension/submitAction', { botMessagePreviewAction: 'this.is.a.bad.action' });
            adapter.send(fileConsentActivity)
                .assertReply(activity => {
                    assert(activity.type === 'invokeResponse', `incorrect activity type "${ activity.type }", expected "invokeResponse"`);
                    assert(activity.value.status === 400, `incorrect status code "${ activity.value.status }", expected "400"`);
                    assert(!activity.value.body,
                        `expected empty body for invokeResponse from fileConsent flow.\nReceived: ${ JSON.stringify(activity.value.body) }`);
                });
        });

        it('a bad FileConsentCardResponse.action is received by the bot', async () => {
            const bot = new TeamsActivityHandler();
    
            const adapter = new TestAdapter(async context => {
                await bot.run(context);
            });
    
            const fileConsentActivity = createInvokeActivity('fileConsent/invoke', { action: 'this.is.a.bad.action' });
            adapter.send(fileConsentActivity)
                .assertReply(activity => {
                    assert(activity.type === 'invokeResponse', `incorrect activity type "${ activity.type }", expected "invokeResponse"`);
                    assert(activity.value.status === 400, `incorrect status code "${ activity.value.status }", expected "400"`);
                    assert(!activity.value.body,
                        `expected empty body for invokeResponse from fileConsent flow.\nReceived: ${ JSON.stringify(activity.value.body) }`);
                });
        });
    });

    describe('should send a NotImplemented status code if', () => {
        it('onTeamsMessagingExtensionSubmitAction is not overridden', async () => {
            const bot = new TeamsActivityHandler();
    
            const adapter = new TestAdapter(async context => {
                await bot.run(context);
            });
    
            const fileConsentActivity = createInvokeActivity('composeExtension/submitAction');
            adapter.send(fileConsentActivity)
                .assertReply(activity => {
                    assert(activity.type === 'invokeResponse', `incorrect activity type "${ activity.type }", expected "invokeResponse"`);
                    assert(activity.value.status === 501, `incorrect status code "${ activity.value.status }", expected "501"`);
                    assert(!activity.value.body,
                        `expected empty body for invokeResponse from fileConsent flow.\nReceived: ${ JSON.stringify(activity.value.body) }`);
                });
        });

        it('onTeamsBotMessagePreviewEdit is not overridden', async () => {
            const bot = new TeamsActivityHandler();
    
            const adapter = new TestAdapter(async context => {
                await bot.run(context);
            });
    
            const fileConsentActivity = createInvokeActivity('composeExtension/submitAction', { botMessagePreviewAction: 'edit' });
            adapter.send(fileConsentActivity)
                .assertReply(activity => {
                    assert(activity.type === 'invokeResponse', `incorrect activity type "${ activity.type }", expected "invokeResponse"`);
                    assert(activity.value.status === 501, `incorrect status code "${ activity.value.status }", expected "501"`);
                    assert(!activity.value.body,
                        `expected empty body for invokeResponse from fileConsent flow.\nReceived: ${ JSON.stringify(activity.value.body) }`);
                });
        });

        it('onTeamsBotMessagePreviewSend is not overridden', async () => {
            const bot = new TeamsActivityHandler();
    
            const adapter = new TestAdapter(async context => {
                await bot.run(context);
            });
    
            const fileConsentActivity = createInvokeActivity('composeExtension/submitAction', { botMessagePreviewAction: 'send' });
            adapter.send(fileConsentActivity)
                .assertReply(activity => {
                    assert(activity.type === 'invokeResponse', `incorrect activity type "${ activity.type }", expected "invokeResponse"`);
                    assert(activity.value.status === 501, `incorrect status code "${ activity.value.status }", expected "501"`);
                    assert(!activity.value.body,
                        `expected empty body for invokeResponse from fileConsent flow.\nReceived: ${ JSON.stringify(activity.value.body) }`);
                });
        });

        it('onTeamsFileConsentAccept is not overridden', async () => {
            const bot = new TeamsActivityHandler();
    
            const adapter = new TestAdapter(async context => {
                await bot.run(context);
            });
    
            const fileConsentActivity = createInvokeActivity('fileConsent/invoke', { action: 'accept' });
            adapter.send(fileConsentActivity)
                .assertReply(activity => {
                    assert(activity.type === 'invokeResponse', `incorrect activity type "${ activity.type }", expected "invokeResponse"`);
                    assert(activity.value.status === 501, `incorrect status code "${ activity.value.status }", expected "501"`);
                    assert(!activity.value.body,
                        `expected empty body for invokeResponse from fileConsent flow.\nReceived: ${ JSON.stringify(activity.value.body) }`);
                });
        });

        it('onTeamsFileConsentDecline is not overridden', async () => {
            const bot = new TeamsActivityHandler();
    
            const adapter = new TestAdapter(async context => {
                await bot.run(context);
            });
    
            const fileConsentActivity = createInvokeActivity('fileConsent/invoke', { action: 'decline' });
            adapter.send(fileConsentActivity)
                .assertReply(activity => {
                    assert.strictEqual(activity.type, 'invokeResponse');
                    assert.strictEqual(activity.value.status, 501);
                    assert.strictEqual(activity.value.body, undefined);
                });
        });

        it('onTeamsO365ConnectorCardAction is not overridden', async () => {
            const bot = new TeamsActivityHandler();
    
            const adapter = new TestAdapter(async context => {
                await bot.run(context);
            });
    
            const teamsO365ConnectorCardActionActivity = createInvokeActivity('actionableMessage/executeAction');
            adapter.send(teamsO365ConnectorCardActionActivity)
                .assertReply(activity => {
                    assert.strictEqual(activity.type, 'invokeResponse');
                    assert.strictEqual(activity.value.status, 501);
                    assert.strictEqual(activity.value.body, undefined);
                });
        });

        it('onTeamsSigninVerifyState is not overridden', async () => {
            const bot = new TeamsActivityHandler();
    
            const adapter = new TestAdapter(async context => {
                await bot.run(context);
            });
    
            const signinVerifyStateActivity = createInvokeActivity('signin/verifyState');
            adapter.send(signinVerifyStateActivity)
                .assertReply(activity => {
                    assert.strictEqual(activity.type, 'invokeResponse');
                    assert.strictEqual(activity.value.status, 501);
                    assert.strictEqual(activity.value.body, undefined);
                });
        });

        it('onTeamsMessagingExtensionCardButtonClicked is not overridden', async () => {
            const bot = new TeamsActivityHandler();
    
            const adapter = new TestAdapter(async context => {
                await bot.run(context);
            });
    
            const cardButtonClickedActivity = createInvokeActivity('composeExtension/onCardButtonClicked');
            adapter.send(cardButtonClickedActivity)
                .assertReply(activity => {
                    assert.strictEqual(activity.type, 'invokeResponse');
                    assert.strictEqual(activity.value.status, 501);
                    assert.strictEqual(activity.value.body, undefined);
                });
        });

        it('onTeamsTaskModuleFetch is not overridden', async () => {
            const bot = new TeamsActivityHandler();
    
            const adapter = new TestAdapter(async context => {
                await bot.run(context);
            });
    
            const taskFetchActivity = createInvokeActivity('task/fetch');
            adapter.send(taskFetchActivity)
                .assertReply(activity => {
                    assert.strictEqual(activity.type, 'invokeResponse');
                    assert.strictEqual(activity.value.status, 501);
                    assert.strictEqual(activity.value.body, undefined);
                });
        });

        it('onTeamsTaskModuleSubmit is not overridden', async () => {
            const bot = new TeamsActivityHandler();
    
            const adapter = new TestAdapter(async context => {
                await bot.run(context);
            });
    
            const taskSubmitActivity = createInvokeActivity('task/submit');
            adapter.send(taskSubmitActivity)
                .assertReply(activity => {
                    assert.strictEqual(activity.type, 'invokeResponse');
                    assert.strictEqual(activity.value.status, 501);
                    assert.strictEqual(activity.value.body, undefined);
                });
        });
    });

    describe('should send an OK status code when', () => {
        class OKFileConsent extends TeamsActivityHandler {
            async onTeamsFileConsentAccept(context, fileConsentCardResponse) {
                assert(context, 'context not found');
                assert(fileConsentCardResponse, 'fileConsentCardResponse not found');
            }

            async onTeamsFileConsentDecline(context, fileConsentCardResponse) {
                assert(context, 'context not found');
                assert(fileConsentCardResponse, 'fileConsentCardResponse not found');
            }
        }
        it('a "fileConsent/invoke" activity is handled by onTeamsFileConsentAccept', async () => {
            const bot = new OKFileConsent();
    
            const adapter = new TestAdapter(async context => {
                await bot.run(context);
            });
    
            const fileConsentActivity = createInvokeActivity('fileConsent/invoke', { action: 'accept' });
            adapter.send(fileConsentActivity)
                .assertReply(activity => {
                    assert(activity.type === 'invokeResponse', `incorrect activity type "${activity.type}", expected "invokeResponse"`);
                    assert(activity.value.status === 200, `incorrect status code "${activity.value.status}", expected "200"`);
                    assert(!activity.value.body,
                        `expected empty body for invokeResponse from fileConsent flow.\nReceived: ${JSON.stringify(activity.value.body)}`);
                });
        });

        it('a "fileConsent/invoke" activity is handled by onTeamsFileConsentDecline', async () => {
            const bot = new OKFileConsent();

            const adapter = new TestAdapter(async context => {
                await bot.run(context);
            });

            const fileConsentActivity = createInvokeActivity('fileConsent/invoke', { action: 'decline' });
            adapter.send(fileConsentActivity)
                .assertReply(activity => {
                    assert(activity.type === 'invokeResponse', `incorrect activity type "${activity.type}", expected "invokeResponse"`);
                    assert(activity.value.status === 200, `incorrect status code "${activity.value.status}", expected "200"`);
                    assert(!activity.value.body,
                        `expected empty body for invokeResponse from fileConsent flow.\nReceived: ${JSON.stringify(activity.value.body)}`);
                });
        });

        it('a "fileConsent/invoke" activity handled by onTeamsFileConsent', async () => {
            class FileConsent extends TeamsActivityHandler {
                async onTeamsFileConsent(context, fileConsentCardResponse) {
                    assert(context, 'context not found');
                    assert(fileConsentCardResponse, 'fileConsentCardResponse not found');
                }
            }
            const bot = new FileConsent();

            const adapter = new TestAdapter(async context => {
                await bot.run(context);
            });

            const fileConsentActivity = createInvokeActivity('fileConsent/invoke', { action: 'accept' });
            adapter.send(fileConsentActivity)
                .assertReply(activity => {
                    assert(activity.type === 'invokeResponse', `incorrect activity type "${activity.type}", expected "invokeResponse"`);
                    assert(activity.value.status === 200, `incorrect status code "${activity.value.status}", expected "200"`);
                    assert(!activity.value.body,
                        `expected empty body for invokeResponse from fileConsent flow.\nReceived: ${JSON.stringify(activity.value.body)}`);
                });
        });
    });

    describe('should send a BadRequest status code when', () => {
        it('onTeamsFileConsent() receives an unexpected action value', () => {
            const bot = new TeamsActivityHandler();            
            const adapter = new TestAdapter(async context => {
                await bot.run(context);
            });
            const fileConsentActivity = createInvokeActivity('fileConsent/invoke', { action: 'test' });

            adapter.send(fileConsentActivity)
                .assertReply(activity => {
                    assert.strictEqual(activity.type, 'invokeResponse');
                    assert.strictEqual(activity.value.status, 400);
                    assert.strictEqual(activity.value.body, undefined);
                });

        });

        it('onTeamsMessagingExtensionSubmitActionDispatch() receives an unexpected botMessagePreviewAction value', () => {
            const bot = new TeamsActivityHandler();            
            const adapter = new TestAdapter(async context => {
                await bot.run(context);
            });
            const fileConsentActivity = createInvokeActivity('composeExtension/submitAction', { botMessagePreviewAction: 'test' });

            adapter.send(fileConsentActivity)
                .assertReply(activity => {
                    assert.strictEqual(activity.type, 'invokeResponse');
                    assert.strictEqual(activity.value.status, 400);
                    assert.strictEqual(activity.value.body, undefined);
                });
        });
    });

    describe('should dispatch through a registered', () => {
        let fileConsentAcceptCalled = false;
        let fileConsentDeclineCalled = false;
        let fileConsentCalled = false;

        class FileConsentBot extends TeamsActivityHandler {
            async onTeamsFileConsent(context, fileConsentCardResponse) {
                assert(context, 'context not found');
                assert(fileConsentCardResponse, 'fileConsentCardResponse not found');
                fileConsentCalled = true;
                await super.onTeamsFileConsent(context, fileConsentCardResponse);
            }

            async onTeamsFileConsentAccept(context, fileConsentCardResponse) {
                assert(context, 'context not found');
                assert(fileConsentCardResponse, 'fileConsentCardResponse not found');
                assert(fileConsentCalled, 'onTeamsFileConsent handler was not called before onTeamsFileConsentAccept handler');
                fileConsentAcceptCalled = true;
            }

            async onTeamsFileConsentDecline(context, fileConsentCardResponse) {
                assert(context, 'context not found');
                assert(fileConsentCardResponse, 'fileConsentCardResponse not found');
                assert(fileConsentCalled, 'onTeamsFileConsent handler was not called before onTeamsFileConsentDecline handler');
                fileConsentDeclineCalled = true;
            }            
        }

        beforeEach(() => {
            fileConsentAcceptCalled = false;
            fileConsentDeclineCalled = false;
            fileConsentCalled = false;
        });

        afterEach(() => {
            fileConsentAcceptCalled = false;
            fileConsentDeclineCalled = false;
            fileConsentCalled = false;
        });

        it('onTeamsFileConsent handler before an onTeamsFileConsentAccept handler', async () => {
            const bot = new FileConsentBot();
            const adapter = new TestAdapter(async context => {
                await bot.run(context);
            });
    
            const fileConsentActivity = createInvokeActivity('fileConsent/invoke', { action: 'accept' });
            adapter.send(fileConsentActivity)
                .assertReply(activity => {
                    assert(activity.type === 'invokeResponse', `incorrect activity type "${activity.type}", expected "invokeResponse"`);
                    assert(activity.value.status === 200, `incorrect status code "${activity.value.status}", expected "200"`);
                    assert(!activity.value.body,
                        `expected empty body for invokeResponse from fileConsent flow.\nReceived: ${JSON.stringify(activity.value.body)}`);
                }).then(() => {
                    assert(fileConsentCalled, 'onTeamsFileConsent handler not called');
                    assert(fileConsentAcceptCalled, 'onTeamsFileConsentAccept handler not called');
                });
        });

        it('onTeamsFileConsent handler before an onTeamsFileConsentDecline handler', async () => {
            const bot = new FileConsentBot();
            const adapter = new TestAdapter(async context => {
                await bot.run(context);
            });
    
            const fileConsentActivity = createInvokeActivity('fileConsent/invoke', { action: 'decline' });
            adapter.send(fileConsentActivity)
                .assertReply(activity => {
                    assert(activity.type === 'invokeResponse', `incorrect activity type "${activity.type}", expected "invokeResponse"`);
                    assert(activity.value.status === 200, `incorrect status code "${activity.value.status}", expected "200"`);
                    assert(!activity.value.body,
                        `expected empty body for invokeResponse from fileConsent flow.\nReceived: ${JSON.stringify(activity.value.body)}`);
                }).then(() => {
                    assert(fileConsentCalled, 'onTeamsFileConsent handler not called');
                    assert(fileConsentDeclineCalled, 'onTeamsFileConsentDecline handler not called');
    
                });
        });
    });

    describe('should call onDialog handlers after successfully handling an', () => {

        function createConvUpdateActivity(channelData) {
            const activity = {
                type: ActivityTypes.ConversationUpdate,
                channelData
            };
            return activity;
        }

        let onConversationUpdateCalled = false;
        let onDialogCalled = false;

        beforeEach(() => {
            onConversationUpdateCalled = false;
            onDialogCalled = false;
        });

        afterEach(() => {
            onConversationUpdateCalled = true;
            onDialogCalled = true;
        });

        it('onTeamsMembersAdded routed activity', () => {
            const bot = new TeamsActivityHandler();
            let onTeamsMemberAddedEvent = false;
    
            const membersAddedMock = [{ id: 'test'} , { id: 'id' }];
            const team = { id: 'team' };
            const activity = createConvUpdateActivity({ team, eventType: 'teamMemberAdded' });
            activity.membersAdded = membersAddedMock;

            bot.onConversationUpdate(async (context, next) => {
                assert(context, 'context not found');
                assert(next, 'next not found');
                onConversationUpdateCalled = true;
                await next();
            });

            bot.onTeamsMembersAddedEvent(async (membersAdded, teamInfo, context, next) => {
                assert(membersAdded, 'membersAdded not found');
                assert(teamInfo, 'teamsInfo not found');
                assert(context, 'context not found');
                assert(next, 'next not found');
                assert.strictEqual(teamInfo, team);
                assert.strictEqual(membersAdded, membersAddedMock);
                onTeamsMemberAddedEvent = true;
                await next();
            });

            bot.onDialog(async (context, next) => {
                assert(context, 'context not found');
                assert(next, 'next not found');
                onDialogCalled = true;
                await next();
            });
    
            const adapter = new TestAdapter(async context => {
                await bot.run(context);
            });
    
            adapter.send(activity)
                .then(() => {
                    assert(onTeamsMemberAddedEvent, 'onTeamsMemberAddedEvent handler not called');
                    assert(onConversationUpdateCalled, 'onTeamsFileConsentAccept handler not called');
                    assert(onDialogCalled, 'onDialog handler not called');
                });
        });

        it('onTeamsMembersRemoved routed activity', () => {
            const bot = new TeamsActivityHandler();
    
            let onTeamsMemberAddedEvent = false;
    
            const membersRemovedMock = [{ id: 'test'} , { id: 'id' }];
            const team = { id: 'team' };
            const activity = createConvUpdateActivity({ team, eventType: 'teamMemberRemoved' });
            activity.membersRemoved = membersRemovedMock;

            bot.onConversationUpdate(async (context, next) => {
                assert(context, 'context not found');
                assert(next, 'next not found');
                onConversationUpdateCalled = true;
                await next();
            });

            bot.onTeamsMembersRemovedEvent(async (membersRemoved, teamInfo, context, next) => {
                assert(membersRemoved, 'membersRemoved not found');
                assert(teamInfo, 'teamsInfo not found');
                assert(context, 'context not found');
                assert(next, 'next not found');
                assert.strictEqual(teamInfo, team);
                assert.strictEqual(membersRemoved, membersRemovedMock);
                onTeamsMemberAddedEvent = true;
                await next();
            });

            bot.onDialog(async (context, next) => {
                assert(context, 'context not found');
                assert(next, 'next not found');
                onDialogCalled = true;
                await next();
            });
    
            const adapter = new TestAdapter(async context => {
                await bot.run(context);
            });
    
            adapter.send(activity)
                .then(() => {
                    assert(onTeamsMemberAddedEvent, 'onTeamsMemberAddedEvent handler not called');
                    assert(onConversationUpdateCalled, 'onTeamsFileConsentAccept handler not called');
                    assert(onDialogCalled, 'onDialog handler not called');
                });
        });

        it('onTeamsChannelCreated routed activity', () => {
            const bot = new TeamsActivityHandler();
    
            let onTeamsChannelCreatedEventCalled = false;
    
            const team = { id: 'team' };
            const channel = { id: 'channel', name: 'channelName' };
            const activity = createConvUpdateActivity({ channel, team, eventType: 'channelCreated' });

            bot.onConversationUpdate(async (context, next) => {
                assert(context, 'context not found');
                assert(next, 'next not found');
                onConversationUpdateCalled = true;
                await next();
            });

            bot.onTeamsChannelCreatedEvent(async (channelInfo, teamInfo, context, next) => {
                assert(channelInfo, 'channelInfo not found');
                assert(teamInfo, 'teamsInfo not found');
                assert(context, 'context not found');
                assert(next, 'next not found');
                assert.strictEqual(teamInfo, team);
                assert.strictEqual(channelInfo, channel);
                onTeamsChannelCreatedEventCalled = true;
                await next();
            });

            bot.onDialog(async (context, next) => {
                assert(context, 'context not found');
                assert(next, 'next not found');
                onDialogCalled = true;
                await next();
            });
    
            const adapter = new TestAdapter(async context => {
                await bot.run(context);
            });
    
            adapter.send(activity)
                .then(() => {
                    assert(onTeamsChannelCreatedEventCalled, 'onTeamsChannelCreated handler not called');
                    assert(onConversationUpdateCalled, 'onConversationUpdate handler not called');
                    assert(onDialogCalled, 'onDialog handler not called');
                });
        });

        it('onTeamsChannelDeleted routed activity', () => {
            const bot = new TeamsActivityHandler();
    
            let onTeamsChannelDeletedEventCalled = false;
    
            const team = { id: 'team' };
            const channel = { id: 'channel', name: 'channelName' };
            const activity = createConvUpdateActivity({ channel, team, eventType: 'channelDeleted' });

            bot.onConversationUpdate(async (context, next) => {
                assert(context, 'context not found');
                assert(next, 'next not found');
                onConversationUpdateCalled = true;
                await next();
            });

            bot.onTeamsChannelDeletedEvent(async (channelInfo, teamInfo, context, next) => {
                assert(channelInfo, 'channelInfo not found');
                assert(teamInfo, 'teamsInfo not found');
                assert(context, 'context not found');
                assert(next, 'next not found');
                assert.strictEqual(teamInfo, team);
                assert.strictEqual(channelInfo, channel);
                onTeamsChannelDeletedEventCalled = true;
                await next();
            });

            bot.onDialog(async (context, next) => {
                assert(context, 'context not found');
                assert(next, 'next not found');
                onDialogCalled = true;
                await next();
            });
    
            const adapter = new TestAdapter(async context => {
                await bot.run(context);
            });
    
            adapter.send(activity)
                .then(() => {
                    assert(onTeamsChannelDeletedEventCalled, 'onTeamsChannelDeletedEvent handler not called');
                    assert(onConversationUpdateCalled, 'onConversationUpdate handler not called');
                    assert(onDialogCalled, 'onDialog handler not called');
                });
        });
        
        it('onTeamsChannelRenamed routed activity', () => {
            const bot = new TeamsActivityHandler();
    
            let onTeamsChannelRenamedEventCalled = false;
    
            const team = { id: 'team' };
            const channel = { id: 'channel', name: 'channelName' };
            const activity = createConvUpdateActivity({ channel, team, eventType: 'channelRenamed' });

            bot.onConversationUpdate(async (context, next) => {
                assert(context, 'context not found');
                assert(next, 'next not found');
                onConversationUpdateCalled = true;
                await next();
            });

            bot.onTeamsChannelRenamedEvent(async (channelInfo, teamInfo, context, next) => {
                assert(channelInfo, 'channelInfo not found');
                assert(teamInfo, 'teamsInfo not found');
                assert(context, 'context not found');
                assert(next, 'next not found');
                assert.strictEqual(teamInfo, team);
                assert.strictEqual(channelInfo, channel);
                onTeamsChannelRenamedEventCalled = true;
                await next();
            });

            bot.onDialog(async (context, next) => {
                assert(context, 'context not found');
                assert(next, 'next not found');
                onDialogCalled = true;
                await next();
            });
    
            const adapter = new TestAdapter(async context => {
                await bot.run(context);
            });
    
            adapter.send(activity)
                .then(() => {
                    assert(onTeamsChannelRenamedEventCalled, 'onTeamsChannelRenamedEvent handler not called');
                    assert(onConversationUpdateCalled, 'onConversationUpdate handler not called');
                    assert(onDialogCalled, 'onDialog handler not called');
                });
        });
        
        it('onTeamsTeamRenamed routed activity', () => {
            const bot = new TeamsActivityHandler();
    
            let onTeamsTeamRenamedEventCalled = false;
    
            const team = { id: 'team' };
            const activity = createConvUpdateActivity({ team, eventType: 'teamRenamed' });

            bot.onConversationUpdate(async (context, next) => {
                assert(context, 'context not found');
                assert(next, 'next not found');
                onConversationUpdateCalled = true;
                await next();
            });

            bot.onTeamsTeamRenamedEvent(async (teamInfo, context, next) => {
                assert(teamInfo, 'teamsInfo not found');
                assert(context, 'context not found');
                assert(next, 'next not found');
                assert.strictEqual(teamInfo, team);
                onTeamsTeamRenamedEventCalled = true;
                await next();
            });

            bot.onDialog(async (context, next) => {
                assert(context, 'context not found');
                assert(next, 'next not found');
                onDialogCalled = true;
                await next();
            });
    
            const adapter = new TestAdapter(async context => {
                await bot.run(context);
            });
    
            adapter.send(activity)
                .then(() => {
                    assert(onTeamsTeamRenamedEventCalled, 'onTeamsTeamRenamedEvent handler not called');
                    assert(onConversationUpdateCalled, 'onConversationUpdate handler not called');
                    assert(onDialogCalled, 'onDialog handler not called');
                });
        });
    });
});
