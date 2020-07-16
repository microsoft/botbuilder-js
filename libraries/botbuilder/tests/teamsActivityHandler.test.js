const assert = require('assert');
const { TeamsActivityHandler, TeamsInfo } = require('../');
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

    describe('onInvokeActivity()', () => {
        class InvokeActivityEmptyHandlers extends TeamsActivityHandler {
            constructor() {
                super();
            }

            handleTeamsO365ConnectorCardAction() { }

            handleTeamsAppBasedLinkQuery() { }

            handleTeamsMessagingExtensionQuery() { }

            handleTeamsMessagingExtensionSelectItem() { }

            handleTeamsMessagingExtensionFetchTask() { }

            handleTeamsMessagingExtensionConfigurationQuerySettingUrl() { }

            handleTeamsMessagingExtensionConfigurationSetting() { }

            handleTeamsMessagingExtensionCardButtonClicked() { }
        }

        it('activity.name is not defined. should return status code [501].', done => {
            const bot = new TeamsActivityHandler();

            const adapter = new TestAdapter(async context => {
                await bot.run(context);
            });

            const activity = { type: ActivityTypes.Invoke, channelId: 'msteams' };

            adapter.send(activity)
                .assertReply(activity => {
                    assert.strictEqual(activity.value.status, 501, 'should be a status code 501.');
                    done();
                })
                .catch(err => done(err));
        });

        it('activity.name is "actionableMessage/executeAction". should return status code [200] when handleTeamsO365ConnectorCardAction method is overridden.', done => {
            const bot = new InvokeActivityEmptyHandlers();

            const adapter = new TestAdapter(async context => {
                await bot.run(context);
            });

            const activity = createInvokeActivity('actionableMessage/executeAction');

            adapter.send(activity)
                .assertReply(activity => {
                    assert.strictEqual(activity.value.status, 200, 'should be status code 200.');
                    done();
                })
                .catch(err => done(err));
        });

        it('activity.name is "composeExtension/queryLink". should return status code [200] when handleTeamsAppBasedLinkQuery method is overridden.', done => {
            const bot = new InvokeActivityEmptyHandlers();

            const adapter = new TestAdapter(async context => {
                await bot.run(context);
            });

            const activity = createInvokeActivity('composeExtension/queryLink');

            adapter.send(activity)
                .assertReply(activity => {
                    assert.strictEqual(activity.value.status, 200, 'should be status code 200.');
                    done();
                })
                .catch(err => done(err));
        });

        it('activity.name is "composeExtension/query". should return status code [200] when handleTeamsMessagingExtensionQuery method is overridden.', done => {
            const bot = new InvokeActivityEmptyHandlers();

            const adapter = new TestAdapter(async context => {
                await bot.run(context);
            });

            const activity = createInvokeActivity('composeExtension/query');

            adapter.send(activity)
                .assertReply(activity => {
                    assert.strictEqual(activity.value.status, 200, 'should be status code 200.');
                    done();
                })
                .catch(err => done(err));
        });

        it('activity.name is "composeExtension/selectItem". should return status code [200] when handleTeamsMessagingExtensionSelectItem method is overridden.', done => {
            const bot = new InvokeActivityEmptyHandlers();

            const adapter = new TestAdapter(async context => {
                await bot.run(context);
            });

            const activity = createInvokeActivity('composeExtension/selectItem');

            adapter.send(activity)
                .assertReply(activity => {
                    assert.strictEqual(activity.value.status, 200, 'should be status code 200.');
                    done();
                })
                .catch(err => done(err));
        });

        it('activity.name is "composeExtension/fetchTask". should return status code [200] when handleTeamsMessagingExtensionFetchTask method is overridden.', done => {
            const bot = new InvokeActivityEmptyHandlers();

            const adapter = new TestAdapter(async context => {
                await bot.run(context);
            });

            const activity = createInvokeActivity('composeExtension/fetchTask');

            adapter.send(activity)
                .assertReply(activity => {
                    assert.strictEqual(activity.value.status, 200, 'should be status code 200.');
                    done();
                })
                .catch(err => done(err));
        });

        it('activity.name is "composeExtension/querySettingUrl". should return status code [200] when handleTeamsMessagingExtensionConfigurationQuerySettingUrl method is overridden.', done => {
            const bot = new InvokeActivityEmptyHandlers();

            const adapter = new TestAdapter(async context => {
                await bot.run(context);
            });

            const activity = createInvokeActivity('composeExtension/querySettingUrl');

            adapter.send(activity)
                .assertReply(activity => {
                    assert.strictEqual(activity.value.status, 200, 'should be status code 200.');
                    done();
                })
                .catch(err => done(err));
        });

        it('activity.name is "composeExtension/setting". should return status code [200] when handleTeamsMessagingExtensionConfigurationSetting method is overridden.', done => {
            const bot = new InvokeActivityEmptyHandlers();

            const adapter = new TestAdapter(async context => {
                await bot.run(context);
            });

            const activity = createInvokeActivity('composeExtension/setting');

            adapter.send(activity)
                .assertReply(activity => {
                    assert.strictEqual(activity.value.status, 200, 'should be status code 200.');
                    done();
                })
                .catch(err => done(err));
        });

        it('activity.name is "composeExtension/onCardButtonClicked". should return status code [200] when handleTeamsMessagingExtensionCardButtonClicked method is overridden.', done => {
            const bot = new InvokeActivityEmptyHandlers();

            const adapter = new TestAdapter(async context => {
                await bot.run(context);
            });

            const activity = createInvokeActivity('composeExtension/onCardButtonClicked');

            adapter.send(activity)
                .assertReply(activity => {
                    assert.strictEqual(activity.value.status, 200, 'should be status code 200.');
                    done();
                })
                .catch(err => done(err));
        });

        it('should throw an error when onInvokeActivity param context is null.', done => {
            class InvokeActivityHandler extends TeamsActivityHandler {
                async onInvokeActivity() {
                    try {
                        await super.onInvokeActivity(null);
                    } catch (error) {
                        return error;
                    }
                }
            }

            const bot = new InvokeActivityHandler();

            const adapter = new TestAdapter(async context => {
                await bot.run(context);
            });

            const activity = createInvokeActivity();

            adapter.send(activity)
                .assertReply(activity => {
                    assert.strictEqual(activity.value.message, 'Cannot read property \'activity\' of null', 'should have thrown an error.');
                    done();
                })
                .catch(err => done(err));
        });
    });

    describe('should send a BadRequest status code if', () => {
        it('a bad BotMessagePreview.action is received by the bot', done => {
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
                    done();
                })
                .catch(err => done(err));
        });

        it('a bad FileConsentCardResponse.action is received by the bot', done => {
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
                    done();
                })
                .catch(err => done(err));
        });
    });

    describe('should send a NotImplemented status code if', () => {
        it('handleTeamsMessagingExtensionSubmitAction is not overridden', done => {
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
                    done();
                })
                .catch(err => done(err));
        });

        it('onTeamsBotMessagePreviewEdit is not overridden', done => {
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
                    done();
                })
                .catch(err => done(err));
        });

        it('onTeamsBotMessagePreviewSend is not overridden', done => {
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
                    done();
                })
                .catch(err => done(err));
        });

        it('handleTeamsFileConsentAccept is not overridden', done => {
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
                    done();
                })
                .catch(err => done(err));
        });

        it('handleTeamsFileConsentDecline is not overridden', done => {
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
                    done();
                })
                .catch(err => done(err));
        });

        it('handleTeamsO365ConnectorCardAction is not overridden', done => {
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
                    done();
                })
                .catch(err => done(err));
        });

        it('handleTeamsSigninVerifyState is not overridden', done => {
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
                    done();
                })
                .catch(err => done(err));
        });

        it('handleTeamsSigninTokenExchange is not overridden', done => {
            const bot = new TeamsActivityHandler();

            const adapter = new TestAdapter(async context => {
                await bot.run(context);
            });

            const signinVerifyStateActivity = createInvokeActivity('signin/tokenExchange');
            adapter.send(signinVerifyStateActivity)
                .assertReply(activity => {
                    assert.strictEqual(activity.type, 'invokeResponse');
                    assert.strictEqual(activity.value.status, 501);
                    assert.strictEqual(activity.value.body, undefined);
                    done();
                })
                .catch(err => done(err));
        });

        it('handleTeamsMessagingExtensionCardButtonClicked is not overridden', done => {
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
                    done();
                })
                .catch(err => done(err));
        });

        it('handleTeamsTaskModuleFetch is not overridden', done => {
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
                    done();
                })
                .catch(err => done(err));
        });

        it('handleTeamsTaskModuleSubmit is not overridden', done => {
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
                    done();
                })
                .catch(err => done(err));
        });

        it('handleTeamsAppBasedLinkQuery is not overridden', done => {
            const bot = new TeamsActivityHandler();

            const adapter = new TestAdapter(async context => {
                await bot.run(context);
            });

            const taskSubmitActivity = createInvokeActivity('composeExtension/queryLink');
            adapter.send(taskSubmitActivity)
                .assertReply(activity => {
                    assert.strictEqual(activity.type, 'invokeResponse');
                    assert.strictEqual(activity.value.status, 501);
                    assert.strictEqual(activity.value.body, undefined);
                    done();
                })
                .catch(err => done(err));
        });

        it('handleTeamsMessagingExtensionConfigurationQuerySettingUrl is not overridden', done => {
            const bot = new TeamsActivityHandler();

            const adapter = new TestAdapter(async context => {
                await bot.run(context);
            });

            const taskSubmitActivity = createInvokeActivity('composeExtension/querySettingUrl');
            adapter.send(taskSubmitActivity)
                .assertReply(activity => {
                    assert.strictEqual(activity.type, 'invokeResponse');
                    assert.strictEqual(activity.value.status, 501);
                    assert.strictEqual(activity.value.body, undefined);
                    done();
                })
                .catch(err => done(err));
        });

        it('handleTeamsMessagingExtensionQuery is not overridden', done => {
            const bot = new TeamsActivityHandler();

            const adapter = new TestAdapter(async context => {
                await bot.run(context);
            });

            const taskSubmitActivity = createInvokeActivity('composeExtension/query');
            adapter.send(taskSubmitActivity)
                .assertReply(activity => {
                    assert.strictEqual(activity.type, 'invokeResponse');
                    assert.strictEqual(activity.value.status, 501);
                    assert.strictEqual(activity.value.body, undefined);
                    done();
                })
                .catch(err => done(err));
        });

        it('handleTeamsMessagingExtensionSelectItem is not overridden', done => {
            const bot = new TeamsActivityHandler();

            const adapter = new TestAdapter(async context => {
                await bot.run(context);
            });

            const taskSubmitActivity = createInvokeActivity('composeExtension/selectItem');
            adapter.send(taskSubmitActivity)
                .assertReply(activity => {
                    assert.strictEqual(activity.type, 'invokeResponse');
                    assert.strictEqual(activity.value.status, 501);
                    assert.strictEqual(activity.value.body, undefined);
                    done();
                })
                .catch(err => done(err));
        });

        it('handleTeamsMessagingExtensionFetchTask is not overridden', done => {
            const bot = new TeamsActivityHandler();

            const adapter = new TestAdapter(async context => {
                await bot.run(context);
            });

            const taskSubmitActivity = createInvokeActivity('composeExtension/fetchTask');
            adapter.send(taskSubmitActivity)
                .assertReply(activity => {
                    assert.strictEqual(activity.type, 'invokeResponse');
                    assert.strictEqual(activity.value.status, 501);
                    assert.strictEqual(activity.value.body, undefined);
                    done();
                })
                .catch(err => done(err));
        });

        it('handleTeamsMessagingExtensionConfigurationQuerySettingUrl is not overridden', done => {
            const bot = new TeamsActivityHandler();

            const adapter = new TestAdapter(async context => {
                await bot.run(context);
            });

            const taskSubmitActivity = createInvokeActivity('composeExtension/querySettingUrl');
            adapter.send(taskSubmitActivity)
                .assertReply(activity => {
                    assert.strictEqual(activity.type, 'invokeResponse');
                    assert.strictEqual(activity.value.status, 501);
                    assert.strictEqual(activity.value.body, undefined);
                    done();
                })
                .catch(err => done(err));
        });

        it('handleTeamsMessagingExtensionConfigurationSetting is not overridden', done => {
            const bot = new TeamsActivityHandler();

            const adapter = new TestAdapter(async context => {
                await bot.run(context);
            });

            const taskSubmitActivity = createInvokeActivity('composeExtension/setting');
            adapter.send(taskSubmitActivity)
                .assertReply(activity => {
                    assert.strictEqual(activity.type, 'invokeResponse');
                    assert.strictEqual(activity.value.status, 501);
                    assert.strictEqual(activity.value.body, undefined);
                    done();
                })
                .catch(err => done(err));
        });
    });

    describe('should send an OK status code', () => {
        class OKFileConsent extends TeamsActivityHandler {
            async handleTeamsFileConsentAccept(context, fileConsentCardResponse) {
                assert(context, 'context not found');
                assert(fileConsentCardResponse, 'fileConsentCardResponse not found');
            }

            async handleTeamsFileConsentDecline(context, fileConsentCardResponse) {
                assert(context, 'context not found');
                assert(fileConsentCardResponse, 'fileConsentCardResponse not found');
            }
        }

        it('when a "fileConsent/invoke" activity is handled by handleTeamsFileConsentAccept', done => {
            const bot = new OKFileConsent();

            const adapter = new TestAdapter(async context => {
                await bot.run(context);
            });

            const fileConsentActivity = createInvokeActivity('fileConsent/invoke', { action: 'accept' });
            adapter.send(fileConsentActivity)
                .assertReply(activity => {
                    assert(activity.type === 'invokeResponse', `incorrect activity type "${ activity.type }", expected "invokeResponse"`);
                    assert(activity.value.status === 200, `incorrect status code "${ activity.value.status }", expected "200"`);
                    assert(!activity.value.body,
                        `expected empty body for invokeResponse from fileConsent flow.\nReceived: ${ JSON.stringify(activity.value.body) }`);
                    done();
                })
                .catch(err => done(err));
        });

        it('when a "fileConsent/invoke" activity is handled by handleTeamsFileConsentDecline', done => {
            const bot = new OKFileConsent();

            const adapter = new TestAdapter(async context => {
                await bot.run(context);
            });

            const fileConsentActivity = createInvokeActivity('fileConsent/invoke', { action: 'decline' });
            adapter.send(fileConsentActivity)
                .assertReply(activity => {
                    assert(activity.type === 'invokeResponse', `incorrect activity type "${ activity.type }", expected "invokeResponse"`);
                    assert(activity.value.status === 200, `incorrect status code "${ activity.value.status }", expected "200"`);
                    assert(!activity.value.body,
                        `expected empty body for invokeResponse from fileConsent flow.\nReceived: ${ JSON.stringify(activity.value.body) }`);
                    done();
                })
                .catch(err => done(err));
        });

        it('when a "fileConsent/invoke" activity handled by handleTeamsFileConsent', done => {
            class FileConsent extends TeamsActivityHandler {
                async handleTeamsFileConsent(context, fileConsentCardResponse) {
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
                    assert(activity.type === 'invokeResponse', `incorrect activity type "${ activity.type }", expected "invokeResponse"`);
                    assert(activity.value.status === 200, `incorrect status code "${ activity.value.status }", expected "200"`);
                    assert(!activity.value.body,
                        `expected empty body for invokeResponse from fileConsent flow.\nReceived: ${ JSON.stringify(activity.value.body) }`);
                    done();
                })
                .catch(err => done(err));
        });


        describe('and the return value from', () => {
            class TaskHandler extends TeamsActivityHandler {
                constructor() {
                    super();
                    // TaskModuleResponses with inner types of 'continue' and 'message'.
                    this.fetchReturn = { task: { type: 'continue', value: { title: 'test' } } };
                    this.submitReturn = { task: { type: 'message', value: 'test' } };
                }

                async handleTeamsTaskModuleFetch(context, taskModuleRequest) {
                    assert(context, 'context not found');
                    assert(taskModuleRequest, 'taskModuleRequest not found');
                    return this.fetchReturn;
                }

                async handleTeamsTaskModuleSubmit(context, taskModuleRequest) {
                    assert(context, 'context not found');
                    assert(taskModuleRequest, 'taskModuleRequest not found');
                    return this.submitReturn;
                }
            }

            it('an overriden handleTeamsTaskModuleFetch()', done => {
                const bot = new TaskHandler();

                const adapter = new TestAdapter(async context => {
                    await bot.run(context);
                });

                const taskFetchActivity = createInvokeActivity('task/fetch', { data: 'fetch' });
                adapter.send(taskFetchActivity)
                    .assertReply(activity => {
                        assert.strictEqual(activity.type, 'invokeResponse');
                        assert(activity.value, 'activity.value not found');
                        assert.strictEqual(activity.value.status, 200);
                        assert.strictEqual(activity.value.body, bot.fetchReturn);
                        done();
                    })
                    .catch(err => done(err));
            });

            it('an overriden handleTeamsTaskModuleSubmit()', done => {
                const bot = new TaskHandler();

                const adapter = new TestAdapter(async context => {
                    await bot.run(context);
                });

                const taskSubmitActivity = createInvokeActivity('task/submit', { data: 'submit' });
                adapter.send(taskSubmitActivity)
                    .assertReply(activity => {
                        assert.strictEqual(activity.type, 'invokeResponse');
                        assert(activity.value, 'activity.value not found');
                        assert.strictEqual(activity.value.status, 200);
                        assert.strictEqual(activity.value.body, bot.submitReturn);
                        done();
                    })
                    .catch(err => done(err));
            });
        });
    });

    describe('should send a BadRequest status code when', () => {
        it('handleTeamsFileConsent() receives an unexpected action value', done => {
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
                    done();
                })
                .catch(err => done(err));
        });

        it('handleTeamsMessagingExtensionSubmitActionDispatch() receives an unexpected botMessagePreviewAction value', done => {
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
                    done();
                })
                .catch(err => done(err));
        });
    });

    describe('should dispatch through a registered', () => {
        let fileConsentAcceptCalled = false;
        let fileConsentDeclineCalled = false;
        let fileConsentCalled = false;

        class FileConsentBot extends TeamsActivityHandler {
            async handleTeamsFileConsent(context, fileConsentCardResponse) {
                assert(context, 'context not found');
                assert(fileConsentCardResponse, 'fileConsentCardResponse not found');
                fileConsentCalled = true;
                await super.handleTeamsFileConsent(context, fileConsentCardResponse);
            }

            async handleTeamsFileConsentAccept(context, fileConsentCardResponse) {
                assert(context, 'context not found');
                assert(fileConsentCardResponse, 'fileConsentCardResponse not found');
                assert(fileConsentCalled, 'handleTeamsFileConsent handler was not called before handleTeamsFileConsentAccept handler');
                fileConsentAcceptCalled = true;
            }

            async handleTeamsFileConsentDecline(context, fileConsentCardResponse) {
                assert(context, 'context not found');
                assert(fileConsentCardResponse, 'fileConsentCardResponse not found');
                assert(fileConsentCalled, 'handleTeamsFileConsent handler was not called before handleTeamsFileConsentDecline handler');
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

        it('handleTeamsFileConsent handler before an handleTeamsFileConsentAccept handler', done => {
            const bot = new FileConsentBot();
            const adapter = new TestAdapter(async context => {
                await bot.run(context);
            });

            const fileConsentActivity = createInvokeActivity('fileConsent/invoke', { action: 'accept' });
            adapter.send(fileConsentActivity)
                .assertReply(activity => {
                    assert(activity.type === 'invokeResponse', `incorrect activity type "${ activity.type }", expected "invokeResponse"`);
                    assert(activity.value.status === 200, `incorrect status code "${ activity.value.status }", expected "200"`);
                    assert(!activity.value.body,
                        `expected empty body for invokeResponse from fileConsent flow.\nReceived: ${ JSON.stringify(activity.value.body) }`);
                }).then(() => {
                    assert(fileConsentCalled, 'handleTeamsFileConsent handler not called');
                    assert(fileConsentAcceptCalled, 'handleTeamsFileConsentAccept handler not called');
                    done();
                })
                .catch(err => done(err));
        });

        it('handleTeamsFileConsent handler before an handleTeamsFileConsentDecline handler', done => {
            const bot = new FileConsentBot();
            const adapter = new TestAdapter(async context => {
                await bot.run(context);
            });

            const fileConsentActivity = createInvokeActivity('fileConsent/invoke', { action: 'decline' });
            adapter.send(fileConsentActivity)
                .assertReply(activity => {
                    assert(activity.type === 'invokeResponse', `incorrect activity type "${ activity.type }", expected "invokeResponse"`);
                    assert(activity.value.status === 200, `incorrect status code "${ activity.value.status }", expected "200"`);
                    assert(!activity.value.body,
                        `expected empty body for invokeResponse from fileConsent flow.\nReceived: ${ JSON.stringify(activity.value.body) }`);
                }).then(() => {
                    assert(fileConsentCalled, 'handleTeamsFileConsent handler not called');
                    assert(fileConsentDeclineCalled, 'handleTeamsFileConsentDecline handler not called');
                    done();
                })
                .catch(err => done(err));
        });
    });


    describe('should call onDialog handlers after successfully handling an', () => {

        function createConvUpdateActivity(channelData) {
            const activity = {
                type: ActivityTypes.ConversationUpdate,
                channelData,
                channelId: 'msteams'
            };
            return activity;
        }

        function createSignInVerifyState(channelData) {
            const activity = {
                type: ActivityTypes.Invoke,
                name: 'signin/verifyState',
                channelData
            };
            return activity;
        }

        function createSigninTokenExchange(channelData) {
            const activity = {
                type: ActivityTypes.Invoke,
                name: 'signin/tokenExchange',
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

        it('No MS-Teams routed activity', done => {
            const bot = new TeamsActivityHandler();

            const activity = { type: ActivityTypes.ConversationUpdate, channelId: 'no-msteams' };

            const adapter = new TestAdapter(async context => {
                await bot.run(context);
            });

            bot.onDialog(async (context, next) => {
                onDialogCalled = true;
                await next();
            });

            adapter.send(activity)
                .then(() => {
                    assert(onDialogCalled, 'onDialog handler not called');
                    done();
                })
                .catch(err => done(err));
        });

        it('MS-Teams with non-existent channelData.eventType routed activity', done => {
            const bot = new TeamsActivityHandler();

            const activity = { type: ActivityTypes.ConversationUpdate, channelId: 'msteams', channelData: { eventType: 'non-existent' } };

            const adapter = new TestAdapter(async context => {
                await bot.run(context);
            });

            bot.onDialog(async (context, next) => {
                onDialogCalled = true;
                await next();
            });

            adapter.send(activity)
                .then(() => {
                    assert(onDialogCalled, 'onDialog handler not called');
                    done();
                })
                .catch(err => done(err));
        });

        it('MS-Teams with no channelData routed activity', done => {
            const bot = new TeamsActivityHandler();

            const activity = { type: ActivityTypes.ConversationUpdate, channelId: 'msteams' };

            const adapter = new TestAdapter(async context => {
                await bot.run(context);
            });

            bot.onDialog(async (context, next) => {
                onDialogCalled = true;
                await next();
            });

            adapter.send(activity)
                .then(() => {
                    assert(onDialogCalled, 'onDialog handler not called');
                    done();
                })
                .catch(err => done(err));
        });

        it('onTeamsMembersAdded routed activity', done => {
            const bot = new TeamsActivityHandler();
            let onTeamsMemberAddedEvent = false;
            let getMemberCalledCount = 0;

            const membersAddedMock = [{ id: 'test' }, { id: 'id' }];
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

            const wasGetMember = TeamsInfo.getMember;
            TeamsInfo.getMember = function(context, userId) {
                getMemberCalledCount++;
                return membersAddedMock.filter(obj => obj.id === userId)[0];
            };

            adapter.send(activity)
                .then(() => {
                    assert(onTeamsMemberAddedEvent, 'onTeamsMemberAddedEvent handler not called');
                    assert(onConversationUpdateCalled, 'handleTeamsFileConsentAccept handler not called');
                    assert(onDialogCalled, 'onDialog handler not called');
                    assert(getMemberCalledCount === 2, 'TeamsInfo.getMember not called twice');
                    TeamsInfo.getMember = wasGetMember;
                    done();
                })
                .catch(err => done(err));
        });

        it('onTeamsMembersAdded routed activity with no TeamsMembersAddedEvent handler', done => {
            const bot = new TeamsActivityHandler();

            const membersAddedMock = [{ id: 'test' }, { id: 'id' }];
            const team = { id: 'team' };
            const activity = createConvUpdateActivity({ team, eventType: 'teamMemberAdded' });
            activity.membersAdded = membersAddedMock;

            bot.onDialog(async (context, next) => {
                onDialogCalled = true;
                await next();
            });

            const adapter = new TestAdapter(async context => {
                await bot.run(context);
            });

            adapter.send(activity)
                .then(() => {
                    assert(onDialogCalled, 'onDialog handler not called');
                    done();
                })
                .catch(err => done(err));
        });

        it('onTeamsMembersAdded for bot routed activity should throw a ConversationNotFound Error on TeamsInfo.getMember', done => {
            const bot = new TeamsActivityHandler();
            let onTeamsMemberAddedEvent = false;
            let getMemberCalled = false;

            const membersAddedMock = [{ id: 'botid' }];
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

            const wasGetMember = TeamsInfo.getMember;
            TeamsInfo.getMember = function() {
                getMemberCalled = true;
                throw { body: { error: { code: 'ConversationNotFound' } } };
            };

            adapter.send(activity)
                .then(() => {
                    assert(onTeamsMemberAddedEvent, 'onTeamsMemberAddedEvent handler not called');
                    assert(onConversationUpdateCalled, 'handleTeamsFileConsentAccept handler not called');
                    assert(onDialogCalled, 'onDialog handler not called');
                    assert(getMemberCalled, 'TeamsInfo.getMember handler not called');
                    TeamsInfo.getMember = wasGetMember;
                    done();
                })
                .catch(err => done(err));
        });

        it('onTeamsMembersAdded for bot routed activity should throw an Error on TeamsInfo.getMember', done => {
            const bot = new TeamsActivityHandler();
            let onTeamsMemberAddedEvent = false;
            let getMemberCalled = false;

            const membersAddedMock = [{ id: 'botid' }];
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

            const wasGetMember = TeamsInfo.getMember;
            TeamsInfo.getMember = function() {
                getMemberCalled = true;
                throw 'TeamsInfo.getMember Error';
            };

            adapter.send(activity)
                .then(() => {
                    assert(onTeamsMemberAddedEvent, 'onTeamsMemberAddedEvent handler not called');
                    assert(onConversationUpdateCalled, 'handleTeamsFileConsentAccept handler not called');
                    assert(onDialogCalled, 'onDialog handler not called');
                    assert(getMemberCalled, 'TeamsInfo.getMember handler not called');
                    TeamsInfo.getMember = wasGetMember;
                    done();
                })
                .catch(err => {
                    if (err === 'TeamsInfo.getMember Error') {
                        TeamsInfo.getMember = wasGetMember;
                        done();
                    } else {
                        done(err);
                    }
                });
        });

        it('onTeamsMembersAdded for bot routed activity does NOT call TeamsInfo.getMember', done => {
            const bot = new TeamsActivityHandler();
            let onTeamsMemberAddedEvent = false;
            let getMemberCalled = false;

            const membersAddedMock = [{ id: 'botid' }];
            const team = { id: 'team' };
            const activity = createConvUpdateActivity({ team, eventType: 'teamMemberAdded' });
            activity.membersAdded = membersAddedMock;
            activity.recipient = { id: membersAddedMock[0].id };

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

            const wasGetMember = TeamsInfo.getMember;
            TeamsInfo.getMember = function(context, userId) {
                getMemberCalled = true;
                return membersAddedMock.filter(obj => obj.id === userId)[0];
            };

            adapter.send(activity)
                .then(() => {
                    assert(onTeamsMemberAddedEvent, 'onTeamsMemberAddedEvent handler not called');
                    assert(onConversationUpdateCalled, 'handleTeamsFileConsentAccept handler not called');
                    assert(onDialogCalled, 'onDialog handler not called');
                    assert(getMemberCalled === false, 'TeamsInfo.getMember was called, but should not have been');
                    TeamsInfo.getMember = wasGetMember;
                    done();
                })
                .catch(err => done(err));
        });

        it('onTeamsMembersRemoved routed activity', done => {
            const bot = new TeamsActivityHandler();

            let onTeamsMemberRemovedEvent = false;

            const membersRemovedMock = [{ id: 'test' }, { id: 'id' }];
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
                onTeamsMemberRemovedEvent = true;
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
                    assert(onTeamsMemberRemovedEvent, 'onTeamsMemberRemovedEvent handler not called');
                    assert(onConversationUpdateCalled, 'onConversationUpdateCalled handler not called');
                    assert(onDialogCalled, 'onDialog handler not called');
                    done();
                })
                .catch(err => done(err));
        });

        it('onTeamsMembersRemoved routed activity with no TeamsMembersRemovedEvent handler', done => {
            const bot = new TeamsActivityHandler();

            const membersRemovedMock = [{ id: 'test' }, { id: 'id' }];
            const team = { id: 'team' };
            const activity = createConvUpdateActivity({ team, eventType: 'teamMemberRemoved' });
            activity.membersRemoved = membersRemovedMock;

            bot.onDialog(async (context, next) => {
                onDialogCalled = true;
                await next();
            });

            const adapter = new TestAdapter(async context => {
                await bot.run(context);
            });

            adapter.send(activity)
                .then(() => {
                    assert(onDialogCalled, 'onDialog handler not called');
                    done();
                })
                .catch(err => done(err));
        });

        it('onTeamsChannelCreated routed activity', done => {
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
                    done();
                })
                .catch(err => done(err));
        });

        it('onTeamsChannelDeleted routed activity', done => {
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
                    done();
                })
                .catch(err => done(err));
        });

        it('onTeamsChannelRenamed routed activity', done => {
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
                    done();
                })
                .catch(err => done(err));
        });

        it('onTeamsTeamRenamed routed activity', done => {
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
                    done();
                })
                .catch(err => done(err));
        });

        it('signin/verifyState routed activity', done => {
            onDialogCalled = false;
            handleTeamsSigninVerifyStateCalled = false;

            class InvokeHandler extends TeamsActivityHandler {
                constructor() {
                    super();

                    this.onDialog(async (context, next) => {
                        assert(context, 'context not found');
                        onDialogCalled = true;
                        await next();
                    });
                }

                handleTeamsSigninVerifyState(context) {
                    assert(context, 'context not found');
                    handleTeamsSigninVerifyStateCalled = true;
                }
            }

            const bot = new InvokeHandler();

            const team = { id: 'team' };
            const activity = createSignInVerifyState({ team, channelId: 'msteams' });

            const adapter = new TestAdapter(async context => {
                await bot.run(context);
            });

            adapter.send(activity)
                .then(() => {
                    assert(onDialogCalled, 'onDialog handler not called');
                    assert(handleTeamsSigninVerifyStateCalled, 'handleTeamsSigninVerifyState handler not called');
                    done();
                })
                .catch(err => done(err));
        });

        it('signin/tokenExchange routed activity', done => {
            onDialogCalled = false;
            handleTeamsSigninTokenExchangeCalled = false;

            class InvokeHandler extends TeamsActivityHandler {
                constructor() {
                    super();

                    this.onDialog(async (context, next) => {
                        assert(context, 'context not found');
                        onDialogCalled = true;
                        await next();
                    });
                }

                async handleTeamsSigninTokenExchange(context) {
                    assert(context, 'context not found');
                    handleTeamsSigninTokenExchangeCalled = true;
                }
            }

            const bot = new InvokeHandler();

            const team = { id: 'team' };
            const activity = createSigninTokenExchange({ team, channelId: 'msteams' });

            const adapter = new TestAdapter(async context => {
                await bot.run(context);
            });

            adapter.send(activity)
                .then(() => {
                    assert(onDialogCalled, 'onDialog handler not called');
                    assert(handleTeamsSigninTokenExchangeCalled, 'handleTeamsSigninTokenExchange handler not called');
                    done();
                })
                .catch(err => done(err));
        });
    });
});