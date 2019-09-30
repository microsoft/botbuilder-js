const assert = require('assert');
const { ActivityHandlerBase, ActivityTypes, TurnContext, TestAdapter } = require('../lib');

describe('ActivityHandlerBase', function() {

    const adapter = new TestAdapter();

    async function processActivity(activity, bot, done) {
        if (!activity) {
            throw new Error('Missing activity');
        }

        if (!bot) {
            throw new Error('Missing bot');
        }

        if (!done) {
            throw new Error('Missing done');
        }
        const context = new TurnContext(adapter, activity);
        // Adding the catch with `done(error)` makes sure that the correct error is surfaced
        await bot.run(context).catch(error => done(error));
    }

    let onActivityCalled = false;
    let onMessageCalled = false;
    let onConversationUpdateCalled = false;
    let onMessageReactionCalled = false;
    let onEventCalled = false;
    let onUnrecognizedActivity = false;

    afterEach(function() {
        onActivityCalled = false;
        onMessageCalled = false;
        onConversationUpdateCalled = false;
        onMessageReactionCalled = false;
        onEventCalled = false;
        onUnrecognizedActivity = false;
    });

    it('should throw an error if context is not passed in', done => {
        const bot = new ActivityHandlerBase();

        bot.run().catch(error => {
            if (error.message !== 'Missing TurnContext parameter') {
                done(error);
            } else {
                done();
            }
        });
    });

    it('should throw an error if context.activity is falsey', done => {
        const bot = new ActivityHandlerBase();
        
        bot.run({}).catch(error => {
            if (error.message !== 'TurnContext does not include an activity') {
                done(error);
            } else {
                done();
            }
        });
    });
    
    it('should throw an error if context.activity.type is falsey', done => {
        const bot = new ActivityHandlerBase();

        bot.run({ activity: {} }).catch(error => {
            if (error.message !== `Activity is missing it's type`) {
                done(error);
            } else {
                done();
            }
        });
    });

    it('should call onActivity from run()', done => {
        const bot = new ActivityHandlerBase();

        bot.onActivity = async function(context) {
            assert(context, 'context not found');
            done();
        };
        
        processActivity({ type: 'any' }, bot, done);
    });

    class UpdatedActivityHandler extends ActivityHandlerBase {
        async onActivity(context) {
            assert(context, 'context not found');
            onActivityCalled = true;
            super.onActivity(context);
        }

        async onMessageActivity(context) {
            assert(context, 'context not found');
            onMessageCalled = true;
        }

        async onConversationUpdateActivity(context) {
            assert(context, 'context not found');
            onConversationUpdateCalled = true;
        }

        async onMessageReactionActivity(context) {
            assert(context, 'context not found');
            onMessageReactionCalled = true;
        }

        async onEventActivity(context) {
            assert(context, 'context not found');
            onEventCalled = true;
        }

        async onUnrecognizedActivity(context) {
            assert(context, 'context not found');
            onUnrecognizedActivity = true;
        }
    }

    it('should dispatch by ActivityType in onActivity()', done => {
        const bot = new UpdatedActivityHandler();

        processActivity({ type: ActivityTypes.Message }, bot, done);
        processActivity({type: ActivityTypes.ConversationUpdate}, bot, done);
        processActivity({type: ActivityTypes.MessageReaction}, bot, done);
        processActivity({type: ActivityTypes.Event}, bot, done);
        processActivity({ type: 'unrecognized' }, bot, done);

        assert(onActivityCalled, 'onActivity was not called');
        assert(onMessageCalled, 'onMessageActivity was not called');
        assert(onConversationUpdateCalled, 'onConversationUpdateActivity was not called');
        assert(onMessageReactionCalled, 'onMessageReactionActivity was not called');
        assert(onEventCalled, 'onEventActivity was not called');
        assert(onUnrecognizedActivity, 'onUnrecognizedActivity was not called');
        done();
    });
});