const assert = require('assert');
const { TeamsActivityHandler } = require('../');
const { ActivityTypes, TestAdapter } = require('botbuilder-core');

function createInvokeActivity(name, value, channelData) {
    const activity = {
        type: ActivityTypes.Invoke,
        channelData,
        name,
        value,
    };
    return activity;
}

describe('TeamsActivityHandler', () => {
    it('should not permit onTeamsFileConsent to register more than one handler', () => {
        const bot = new TeamsActivityHandler();
        assert(!bot.handlers['TeamsFileConsent']);
        bot.onTeamsFileConsent(async (context, fileConsentCardResponse) => {
            assert(false, 'this should not be called during test.');
        });
        assert(bot.handlers['TeamsFileConsent'].length === 1);
        try {
            bot.onTeamsFileConsent(async (context, fileConsentCardResponse) => {
                assert(false, 'this should not be called during test.');
            });
        } catch (error) {
            assert(error.message === 'Cannot register more than one handler for TeamsFileConsent.',
                `unexpected error thrown:\n ${JSON.stringify(error)}`);
        }
    });

    it('onTeamsFileConsent handlers should fire before onTeamsFileConsentAccept handlers', async () => {
        const bot = new TeamsActivityHandler();

        let fileConsentCalled = false;
        let fileConsentAcceptCalled = false;

        bot.onTeamsFileConsent(async (context, fileConsentCardResponse) => {
            assert(true, 'this should not be called during test.');
            assert(context, 'context not found');
            assert(fileConsentCardResponse, 'fileConsentCardResponse not found');
            fileConsentCalled = true;
        });
        bot.onTeamsFileConsentAccept(async (context, fileConsentCardResponse, next) => {
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
                assert(fileConsentCalled, 'onTeamsFileConsent handler not called')
                assert(fileConsentAcceptCalled, 'onTeamsFileConsentAccept handler not called');

            });
    });

    xit('should fire onDialog handler after receiving a Teams Invoke activity', async () => {
        const bot = new TeamsActivityHandler();

        let fileConsentCalled = false;
        let fileConsentAcceptCalled = false;

        bot.onDialog(async (context, next) => {
            assert(true, 'this should not be called during test.');
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
                assert(fileConsentCalled, 'onTeamsFileConsent handler not called')
                assert(fileConsentAcceptCalled, 'onTeamsFileConsentAccept handler not called');

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
