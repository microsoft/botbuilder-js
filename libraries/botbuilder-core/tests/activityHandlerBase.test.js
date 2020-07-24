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

    let onTurnActivityCalled = false;
    let onMessageCalled = false;
    let onConversationUpdateActivityCalled = false;
    let onMessageReactionCalled = false;
    let onEventCalled = false;
    let onEndOfConversationCalled = false;
    let onTypingCalled = false;
    let onInstallationUpdateCalled = false;
    let onUnrecognizedActivity = false;

    afterEach(function() {
        onTurnActivityCalled = false;
        onMessageCalled = false;
        onConversationUpdateActivityCalled = false;
        onMessageReactionCalled = false;
        onEventCalled = false;
        onEndOfConversationCalled = false;
        onTypingCalled = false;
        onInstallationUpdateCalled = false;
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

    class OverrideOnTurnActivity extends ActivityHandlerBase {
        async onTurnActivity(context) {
            assert(context, 'context not found');
            super.onTurnActivity(context);
        }
    }
    it('should call onActivity from run()', done => {
        const bot = new OverrideOnTurnActivity();       
        processActivity({ type: 'any' }, bot, done);
        done();
    });

    class UpdatedActivityHandler extends ActivityHandlerBase {
        async onTurnActivity(context) {
            assert(context, 'context not found');
            onTurnActivityCalled = true;
            super.onTurnActivity(context);
        }

        async onMessageActivity(context) {
            assert(context, 'context not found');
            onMessageCalled = true;
        }

        async onConversationUpdateActivity(context) {
            assert(context, 'context not found');
            onConversationUpdateActivityCalled = true;
        }

        async onMessageReactionActivity(context) {
            assert(context, 'context not found');
            onMessageReactionCalled = true;
        }

        async onEventActivity(context) {
            assert(context, 'context not found');
            onEventCalled = true;
        }

        async onEndOfConversationActivity(context) {
            assert(context, 'context not found');
            onEndOfConversationCalled = true;
        }

        async onTypingActivity(context) {
            assert(context, 'context not found');
            onTypingCalled = true;
        }

        async onInstallationUpdateActivity(context) {
            assert(context, 'context not found');
            onInstallationUpdateCalled = true;
        }

        async onUnrecognizedActivity(context) {
            assert(context, 'context not found');
            onUnrecognizedActivity = true;
        }
    }

    it('should dispatch by ActivityType in onTurnActivity()', done => {
        const bot = new UpdatedActivityHandler();

        processActivity({ type: ActivityTypes.Message }, bot, done);
        processActivity({type: ActivityTypes.ConversationUpdate}, bot, done);
        processActivity({type: ActivityTypes.MessageReaction}, bot, done);
        processActivity({type: ActivityTypes.Event}, bot, done);
        processActivity({type: ActivityTypes.EndOfConversation}, bot, done);
        processActivity({type: ActivityTypes.Typing}, bot, done);
        processActivity({type: ActivityTypes.InstallationUpdate}, bot, done);
        processActivity({ type: 'unrecognized' }, bot, done);

        assert(onTurnActivityCalled, 'onTurnActivity was not called');
        assert(onMessageCalled, 'onMessageActivity was not called');
        assert(onConversationUpdateActivityCalled, 'onConversationUpdateActivity was not called');
        assert(onMessageReactionCalled, 'onMessageReactionActivity was not called');
        assert(onEventCalled, 'onEventActivity was not called');
        assert(onEndOfConversationCalled, 'onEndOfConversationCalled was not called');
        assert(onTypingCalled, 'onTypingCalled was not called');
        assert(onInstallationUpdateCalled, 'onInstallationUpdateCalled was not called');
        assert(onUnrecognizedActivity, 'onUnrecognizedActivity was not called');
        done();
    });

    describe('onConversationUpdateActivity', () => {
        class ConversationUpdateActivityHandler extends ActivityHandlerBase {
            async onTurnActivity(context) {
                assert(context, 'context not found');
                onTurnActivityCalled = true;
                super.onTurnActivity(context);
            }

            async onConversationUpdateActivity(context) {
                assert(context, 'context not found');
                onConversationUpdateActivityCalled = true;
                super.onConversationUpdateActivity(context);
            }

            async onMembersAddedActivity(membersAdded, context) {
                const value = context.activity.value;
                if (value && value.skipSubtype) {
                    throw new Error('should not have reached onMembersAddedActivity');
                }
                assert(context, 'context not found');
                assert(membersAdded, 'membersAdded not found');
                assert(membersAdded.length === 1, `unexpected number of membersAdded: ${membersAdded.length}`);
                onMembersAddedActivityCalled = true;
            }
    
            async onMembersRemovedActivity(membersRemoved, context) {
                const value = context.activity.value;
                if (value && value.skipSubtype) {
                    throw new Error('should not have reached onMembersRemovedActivity');
                }
                assert(context, 'context not found');
                assert(membersRemoved, 'membersRemoved not found');
                assert(membersRemoved.length === 1, `unexpected number of membersRemoved: ${membersRemoved.length}`);
                onMembersRemovedActivityCalled = true;
            }
        }

        let onTurnActivityCalled = false;
        let onConversationUpdateActivityCalled = false;
        let onMembersAddedActivityCalled = false;
        let onMembersRemovedActivityCalled = false;
    
        afterEach(function() {
            onTurnActivityCalled = false;
            onConversationUpdateActivityCalled = false;
            onMembersAddedActivityCalled = false;
            onMembersRemovedActivityCalled = false;
        });

        function createConvUpdateActivity(recipientId, AddedOrRemoved, skipSubtype) {
            const recipient = { id: recipientId };
            const activity = { type: ActivityTypes.ConversationUpdate, recipient, value: { }, ...AddedOrRemoved };
            if (skipSubtype) {
                activity.value.skipSubtype = true;
            }
            return activity;
        }

        it(`should call onMembersAddedActivity if the id of the member added does not match the recipient's id`, done => {
            const bot = new ConversationUpdateActivityHandler();
            const activity = createConvUpdateActivity('bot', { membersAdded: [ { id: 'user' } ] });
            processActivity(activity, bot, done);
            assert(onTurnActivityCalled, 'onTurnActivity was not called');
            assert(onConversationUpdateActivityCalled, 'onConversationUpdateActivity was not called');
            assert(onMembersAddedActivityCalled, 'onMembersAddedActivity was not called');
            done();
        });
    
        it(`should call onMembersRemovedActivity if the id of the member removed does not match the recipient's id`, done => {
            const bot = new ConversationUpdateActivityHandler();
            const activity = createConvUpdateActivity('bot', { membersRemoved: [ { id: 'user' } ] });
            processActivity(activity, bot, done);
            assert(onTurnActivityCalled, 'onTurnActivity was not called');
            assert(onConversationUpdateActivityCalled, 'onConversationUpdateActivity was not called');
            assert(onMembersRemovedActivityCalled, 'onMembersRemovedActivity was not called');
            done();
        });
    
        it(`should not call onMembersAddedActivity if the id of the member added matches the recipient's id`, done => {
            const bot = new ConversationUpdateActivityHandler();
            const activity = createConvUpdateActivity('bot', { membersAdded: [ { id: 'bot' } ] }, true);
            processActivity(activity, bot, done);
            assert(onTurnActivityCalled, 'onTurnActivity was not called');
            assert(onConversationUpdateActivityCalled, 'onConversationUpdateActivity was not called');
            done();
        });
    
        it(`should not call onMembersRemovedActivity if the id of the member removed matches the recipient's id`, done => {
            const bot = new ConversationUpdateActivityHandler();
            const activity = createConvUpdateActivity('bot', { membersRemoved: [ { id: 'bot' } ] }, true);
            processActivity(activity, bot, done);
            assert(onTurnActivityCalled, 'onTurnActivity was not called');
            assert(onConversationUpdateActivityCalled, 'onConversationUpdateActivity was not called');
            done();
        });
    });

    describe('onMessageReaction', () => {
        class MessageReactionActivityHandler extends ActivityHandlerBase {
            async onTurnActivity(context) {
                assert(context, 'context not found');
                onTurnActivityCalled = true;
                super.onTurnActivity(context);
            }

            async onMessageReactionActivity(context) {
                assert(context, 'context not found');
                onMessageReactionActivityCalled = true;
                super.onMessageReactionActivity(context);
            }

            async onReactionsAddedActivity(reactionsAdded, context) {
                assert(context, 'context not found');
                assert(reactionsAdded, 'membersAdded not found');
                assert(reactionsAdded.length === 1, `unexpected number of reactionsAdded: ${reactionsAdded.length}`);
                onReactionsAddedActivityCalled = true;
            }
    
            async onReactionsRemovedActivity(reactionsRemoved, context) {
                assert(context, 'context not found');
                assert(reactionsRemoved, 'reactionsRemoved not found');
                assert(reactionsRemoved.length === 1, `unexpected number of reactionsRemoved: ${reactionsRemoved.length}`);
                onReactionsRemovedActivityCalled = true;
            }
        }

        let onTurnActivityCalled = false;
        let onMessageReactionActivityCalled = false;
        let onReactionsAddedActivityCalled = false;
        let onReactionsRemovedActivityCalled = false;
    
        afterEach(function() {
            onTurnActivityCalled = false;
            onMessageReactionActivityCalled = false;
            onReactionsAddedActivityCalled = false;
            onReactionsRemovedActivityCalled = false;
        });

        function createMsgReactActivity(recipientId, AddedOrRemoved) {
            const recipient = { id: recipientId };
            const activity = { type: ActivityTypes.MessageReaction, recipient, ...AddedOrRemoved };
            return activity;
        }

        it(`should call onReactionsAddedActivity if reactionsAdded exists and reactionsAdded.length > 0`, done => {
            const bot = new MessageReactionActivityHandler();
            const activity = createMsgReactActivity('bot', { reactionsAdded: [ { type: 'like' } ] });
            processActivity(activity, bot, done);
            assert(onTurnActivityCalled, 'onTurnActivity was not called');
            assert(onMessageReactionActivityCalled, 'onMessageReactionActivity was not called');
            assert(onReactionsAddedActivityCalled, 'onReactionsAddedActivity was not called');
            done();
        });
    
        it(`should call onReactionsRemovedActivity if reactionsRemoved exists and reactionsRemoved.length > 0`, done => {
            const bot = new MessageReactionActivityHandler();
            const activity = createMsgReactActivity('bot', { reactionsRemoved: [ { type: 'like' } ] });
            processActivity(activity, bot, done);
            assert(onTurnActivityCalled, 'onTurnActivity was not called');
            assert(onMessageReactionActivityCalled, 'onMessageReactionActivity was not called');
            assert(onReactionsRemovedActivityCalled, 'onReactionsRemovedActivity was not called');
            done();
        });
    });
});