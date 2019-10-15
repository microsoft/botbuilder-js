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
                    assert(activity.type === 'invokeResponse', `incorrect activity type "${ activity.type }", expected "invokeResponse"`);
                    assert(activity.value.status === 501, `incorrect status code "${ activity.value.status }", expected "501"`);
                    assert(!activity.value.body,
                        `expected empty body for invokeResponse from fileConsent flow.\nReceived: ${ JSON.stringify(activity.value.body) }`);
                });
        });
    });

    xdescribe('should send an OK status code when', () => {
        it('a "fileConsent/invoke" activity is handled by an onTeamsFileConsentAccept handler', async () => {
            const bot = new TeamsActivityHandler();
            bot.onTeamsFileConsentAccept(async (context, fileConsentCardResponse) => {
                assert(context, 'context not found');
                assert(fileConsentCardResponse, 'fileConsentCardResponse not found');
            });
    
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

        it('a "fileConsent/invoke" activity is handled by an onTeamsFileConsentAccept handler', async () => {
            const bot = new TeamsActivityHandler();
            bot.onTeamsFileConsentDecline(async (context, fileConsentCardResponse) => {
                assert(context, 'context not found');
                assert(fileConsentCardResponse, 'fileConsentCardResponse not found');
            });
    
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
    });

    xdescribe('should dispatch through a registered', () => {
        it('onTeamsFileConsent handler before an onTeamsFileConsentAccept handler', async () => {
            const bot = new TeamsActivityHandler();
    
            let fileConsentCalled = false;
            let fileConsentAcceptCalled = false;
    
            bot.onTeamsFileConsent(async (context, fileConsentCardResponse) => {
                assert(context, 'context not found');
                assert(fileConsentCardResponse, 'fileConsentCardResponse not found');
                fileConsentCalled = true;
            });
            bot.onTeamsFileConsentAccept(async (context, fileConsentCardResponse) => {
                assert(context, 'context not found');
                assert(fileConsentCardResponse, 'fileConsentCardResponse not found');
                assert(fileConsentCalled, 'onTeamsFileConsent handler was not called before onTeamsFileConsentAccept handler');
                fileConsentAcceptCalled = true;
            });
            assert(bot.handlers['TeamsFileConsent'].length === 1);
            assert(bot.handlers['TeamsFileConsentAccept'].length === 1);
    
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
            const bot = new TeamsActivityHandler();
    
            let fileConsentCalled = false;
            let fileConsentDeclineCalled = false;
    
            bot.onTeamsFileConsent(async (context, fileConsentCardResponse) => {
                assert(context, 'context not found');
                assert(fileConsentCardResponse, 'fileConsentCardResponse not found');
                fileConsentCalled = true;
            });
            bot.onTeamsFileConsentDecline(async (context, fileConsentCardResponse, next) => {
                assert(context, 'context not found');
                assert(fileConsentCardResponse, 'fileConsentCardResponse not found');
                assert(fileConsentCalled, 'onTeamsFileConsent handler was not called before onTeamsFileConsentDecline handler');
                fileConsentDeclineCalled = true;
            });
            assert(bot.handlers['TeamsFileConsent'].length === 1);
            assert(bot.handlers['TeamsFileConsentDecline'].length === 1);
    
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

        it('onTeamsFileConsent handler and send a NotImplemented if no onTeamsFileConsentAccept handler is registered', async () => {
            const bot = new TeamsActivityHandler();
            let fileConsentCalled = false;
    
            bot.onTeamsFileConsent(async (context, fileConsentCardResponse) => {
                assert(context, 'context not found');
                assert(fileConsentCardResponse, 'fileConsentCardResponse not found');
                fileConsentCalled = true;
            });
            const adapter = new TestAdapter(async context => {
                await bot.run(context);
            });
    
            const fileConsentActivity = createInvokeActivity('fileConsent/invoke', { action: 'decline' });
            adapter.send(fileConsentActivity)
                .assertReply(activity => {
                    assert(activity.type === 'invokeResponse', `incorrect activity type "${ activity.type }", expected "invokeResponse"`);
                    assert(activity.value.status === 501, `incorrect status code "${ activity.value.status }", expected "501"`);
                    assert(!activity.value.body,
                        `expected empty body for invokeResponse from fileConsent flow.\nReceived: ${ JSON.stringify(activity.value.body) }`);
                }).then(() => {
                    assert(fileConsentCalled, 'onTeamsFileConsent handler not called');
                });
        });

        it('onTeamsFileConsent handler and send a NotImplemented if no onTeamsFileConsentDecline handler is registered', async () => {
            const bot = new TeamsActivityHandler();
            let fileConsentCalled = false;
    
            bot.onTeamsFileConsent(async (context, fileConsentCardResponse) => {
                assert(context, 'context not found');
                assert(fileConsentCardResponse, 'fileConsentCardResponse not found');
                fileConsentCalled = true;
            });
            const adapter = new TestAdapter(async context => {
                await bot.run(context);
            });
    
            const fileConsentActivity = createInvokeActivity('fileConsent/invoke', { action: 'decline' });
            adapter.send(fileConsentActivity)
                .assertReply(activity => {
                    assert(activity.type === 'invokeResponse', `incorrect activity type "${ activity.type }", expected "invokeResponse"`);
                    assert(activity.value.status === 501, `incorrect status code "${ activity.value.status }", expected "501"`);
                    assert(!activity.value.body,
                        `expected empty body for invokeResponse from fileConsent flow.\nReceived: ${ JSON.stringify(activity.value.body) }`);
                }).then(() => {
                    assert(fileConsentCalled, 'onTeamsFileConsent handler not called');
                });
        });
    });

    xdescribe('should call onDialog handlers after successfully handling an', () => {

        function createConvUpdateActivity() {

        }

        it('onTeamsMembersAdded routed activity', async () => {
            const bot = new TeamsActivityHandler();
    
            let fileConsentCalled = false;
            let fileConsentAcceptCalled = false;
            let dialogCalled = false;
    
            bot.onTeamsFileConsent(async (context, fileConsentCardResponse) => {
                assert(context, 'context not found');
                assert(fileConsentCardResponse, 'fileConsentCardResponse not found');
                fileConsentCalled = true;
            });
            bot.onTeamsFileConsentAccept(async (context, fileConsentCardResponse) => {
                assert(context, 'context not found');
                assert(fileConsentCardResponse, 'fileConsentCardResponse not found');
                assert(fileConsentCalled, 'onTeamsFileConsent handler was not called before onTeamsFileConsentAccept handler');
                fileConsentAcceptCalled = true;
            });
            bot.onDialog(async (context, next) => {
                assert(context, 'context not found');
                assert(next, 'next not found');
                dialogCalled = true;
            });
    
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
                    assert(dialogCalled, 'onDialog handler not called');
                });
        });

        it('onTeamsFileConsentDecline routed activity', async () => {
            const bot = new TeamsActivityHandler();
    
            let fileConsentCalled = false;
            let fileConsentDeclineCalled = false;
            let dialogCalled = false;
    
            bot.onTeamsFileConsent(async (context, fileConsentCardResponse) => {
                assert(context, 'context not found');
                assert(fileConsentCardResponse, 'fileConsentCardResponse not found');
                fileConsentCalled = true;
            });
            bot.onTeamsFileConsentDecline(async (context, fileConsentCardResponse) => {
                assert(context, 'context not found');
                assert(fileConsentCardResponse, 'fileConsentCardResponse not found');
                assert(fileConsentCalled, 'onTeamsFileConsent handler was not called before onTeamsFileConsentDecline handler');
                fileConsentDeclineCalled = true;
            });
            bot.onDialog(async (context, next) => {
                assert(context, 'context not found');
                assert(next, 'next not found');
                dialogCalled = true;
            });
    
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
                    assert(dialogCalled, 'onDialog handler not called');
                });
        });
    });

    xit('should handle "AcceptFileConsent" activities', async () => {
        const bot = new TeamsActivityHandler();
        bot.onAcceptFileConsent(async (context, value, next) => {
            assert(context, 'context not passed to handler');
            assert(value, 'value not passed in');
            assert(value === context.activity.value);
            assert(next, 'next handler not passed in');
            await context.sendActivity('fileconsent received');
            await next();
            return { status: 200 };
        });

        const adapter = new TestAdapter(async context => {
            await bot.run(context);
        });

        const fileConsentActivity = createInvokeActivity('fileConsent/invoke', { action: 'accept' });

        adapter.send(fileConsentActivity)
            .assertReply('fileconsent received')
            .assertReply(activity => {
                // Verify that bot sends out an invokeResponse via the TurnContext.
                assert(activity.value, 'activity value does not exist');
                assert(activity.value.status === 200, `incorrect status code "${activity.value.status}", expected "200"`);
                assert(activity.type === 'invokeResponse', `incorrect activity type "${activity.type}", expected "invokeResponse"`);
            });
    });

    xit('should throw an error if onAcceptFileConsent handler does not return InvokeResponse', done => {
        const bot = new TeamsActivityHandler();
        bot.onAcceptFileConsent(async (context, value, next) => {
            assert(context, 'context not passed to handler');
            assert(value, 'value not passed in');
            assert(value === context.activity.value);
            assert(next, 'next handler not passed in');
            await context.sendActivity('fileconsent received');
            await next();
        });

        const adapter = new TestAdapter(async context => {
            await bot.run(context);
        });

        adapter.onTurnError = async (context, error) => {
            assert(error.message === 'TeamsActivityHandler.teamsInvokeWrapper(): InvokeResponse not returned from "onAcceptFileConsent" handler.', `unexpected error thrown: ${error.message}`);
            done();
        }

        const fileConsentActivity = createInvokeActivity('fileConsent/invoke', { action: 'accept' });

        adapter.send(fileConsentActivity)
            .assertReply('fileconsent received');
    });

    xit('should handle "DeclineFileConsent" activities', async () => {
        const bot = new TeamsActivityHandler();
        bot.onDeclineFileConsent(async (context, value, next) => {
            assert(context, 'context not passed to handler');
            assert(value, 'value not passed in');
            assert(value === context.activity.value);
            assert(next, 'next handler not passed in');
            await context.sendActivity('fileconsent not received');
            await next();
            return { status: 200 };
        });

        const adapter = new TestAdapter(async context => {
            await bot.run(context);
        });

        const fileConsentActivity = createInvokeActivity('fileConsent/invoke', { action: 'decline' });

        adapter.send(fileConsentActivity)
            .assertReply('fileconsent not received')
            .assertReply(activity => {
                assert(activity.value, 'activity value does not exist');
                assert(activity.value.status === 200, `incorrect status code "${activity.value.status}", expected "200"`);
                assert(activity.type === 'invokeResponse', `incorrect activity type "${activity.type}", expected "invokeResponse"`);
            });
    });

    xit('should throw an error if onDeclineFileConsent handler does not return InvokeResponse', done => {
        const bot = new TeamsActivityHandler();
        bot.onDeclineFileConsent(async (context, value, next) => {
            assert(context, 'context not passed to handler');
            assert(value, 'value not passed in');
            assert(value === context.activity.value);
            assert(next, 'next handler not passed in');
            await context.sendActivity('fileconsent received');
            await next();
        });

        const adapter = new TestAdapter(async context => {
            await bot.run(context);
        });

        adapter.onTurnError = async (context, error) => {
            assert(error.message === 'TeamsActivityHandler.teamsInvokeWrapper(): InvokeResponse not returned from "onDeclineFileConsent" handler.', `unexpected error thrown: ${error.message}`);
            done();
        }

        const fileConsentActivity = createInvokeActivity('fileConsent/invoke', { action: 'decline' });

        adapter.send(fileConsentActivity)
            .assertReply('fileconsent received');
    });

    xit('should handle "TaskModuleFetch" activities', async () => {
        throw new Error("Not Implemented");
    });

    xit('should throw an error if onTaskModuleFetch handler does not return InvokeResponse', done => {
        throw new Error("Not Implemented");
    });

    xit('should handle "TaskModuleSubmit" activities', async () => {
        throw new Error("Not Implemented");
    });

    xit('should handle "MessagingExtensionQuery" activities', async () => {
        throw new Error("Not Implemented");
    });

    xit('should handle "365CardActions"', async () => {
        throw new Error("Not Implemented");
    });
});
