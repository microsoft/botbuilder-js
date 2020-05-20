const assert = require('assert');
const { ActivityHandler, ActivityTypes, TestAdapter, tokenResponseEventName, TurnContext } = require('../lib');

describe('ActivityHandler', function() {

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

    it(`should fire onTurn for any inbound activity`, async function(done) {

        const bot = new ActivityHandler();

        bot.onTurn(async (context, next) => {
            assert(true, 'onTurn not called');
            done();
            await next();
        });

        processActivity({type: 'any'}, bot, done);
    });

    it(`should fire onMessage for any message activities`, async function(done) {

        const bot = new ActivityHandler();

        bot.onMessage(async (context, next) => {
            assert(true, 'onMessage not called');
            done();
            await next();
        });

        processActivity({type: ActivityTypes.Message}, bot, done);
    });

    it(`calling  next allows following events to firing`, async function(done) {

        const bot = new ActivityHandler();

        bot.onTurn(async (context, next) => {
            assert(true, 'onTurn not called');
            await next();
        });

        bot.onMessage(async (context, next) => {
            assert(true, 'onMessage not called');
            done();
            await next();
        });

        processActivity({type: ActivityTypes.Message}, bot, done);
    });

    it(`omitting call to next prevents following events from firing`, async function(done) {

        const bot = new ActivityHandler();

        bot.onTurn(async (context, next) => {
            assert(true, 'onTurn not called');
            done();
        });

        bot.onMessage(async (context, next) => {
            assert(false, 'onMessage called improperly!');
            await next();
        });

        processActivity({type: ActivityTypes.Message}, bot, done);
    });

    it(`binding 2 methods to the same event both fire`, async function(done) {

        const bot = new ActivityHandler();
        let count = 0;

        bot.onMessage(async (context, next) => {
            assert(true, 'event 1 did not fire');
            count++;
            await next();
        });

        bot.onMessage(async (context, next) => {
            assert(true, 'event 2 did not fire');
            count++;

            assert(count === 2, 'all events did fire');
            done();
            await next();
        });

        processActivity({type: ActivityTypes.Message}, bot, done);
    });

    it(`should fire onConversationUpdate`, async function(done) {

        const bot = new ActivityHandler();

        bot.onConversationUpdate(async (context, next) => {
            assert(true, 'onConversationUpdate not called');
            done();
            await next();
        });

        processActivity({type: ActivityTypes.ConversationUpdate}, bot, done);
    });

    it(`should fire onMembersAdded`, async function(done) {

        const bot = new ActivityHandler();

        bot.onMembersAdded(async (context, next) => {
            assert(true, 'onConversationUpdate not called');
            done();
            await next();
        });

        processActivity({type: ActivityTypes.ConversationUpdate, membersAdded: [{id: 1}]}, bot, done);
    });

    it(`should fire onMembersRemoved`, async function(done) {

        const bot = new ActivityHandler();

        bot.onMembersRemoved(async (context, next) => {
            assert(true, 'onMembersRemoved not called');
            done();
            await next();
        });

        processActivity({type: ActivityTypes.ConversationUpdate, membersRemoved: [{id: 1}]}, bot, done);
    });

    it(`should fire onMessageReaction`, async function(done) {

        const bot = new ActivityHandler();

        bot.onMessageReaction(async (context, next) => {
            assert(true, 'onMessageReaction not called');
            done();
            await next();
        });

        processActivity({type: ActivityTypes.MessageReaction}, bot, done);
    });

    it(`should fire onReactionsAdded`, async function(done) {

        const bot = new ActivityHandler();

        bot.onReactionsAdded(async (context, next) => {
            assert(true, 'onReactionsAdded not called');
            done();
            await next();
        });

        processActivity({type: ActivityTypes.MessageReaction, reactionsAdded: [{type: 'like'}]}, bot, done);
    });

    it(`should fire onReactionsRemoved`, async function(done) {

        const bot = new ActivityHandler();

        bot.onReactionsRemoved(async (context, next) => {
            assert(true, 'onReactionsRemoved not called');
            done();
            await next();
        });

        processActivity({type: ActivityTypes.MessageReaction, reactionsRemoved: [{type: 'like'}]}, bot, done);
    });
    
    it(`should fire onEvent`, async function(done) {

        const bot = new ActivityHandler();

        bot.onEvent(async (context, next) => {
            assert(true, 'onEvent not called');
            done();
            await next();
        });

        processActivity({type: ActivityTypes.Event}, bot, done);
    });

    it(`should fire onEndOfConversation`, async function(done) {

        const bot = new ActivityHandler();

        bot.onEndOfConversation(async (context, next) => {
            assert(true, 'onEndOfConversation not called');
            done();
            await next();
        });

        processActivity({type: ActivityTypes.EndOfConversation}, bot, done);
    });

    it(`should fire onTyping`, async function(done) {

        const bot = new ActivityHandler();

        bot.onTyping(async (context, next) => {
            assert(true, 'onTyping not called');
            done();
            await next();
        });

        processActivity({type: ActivityTypes.Typing}, bot, done);
    });

    it(`should fire onUnrecognizedActivityType`, async function(done) {

        const bot = new ActivityHandler();

        bot.onUnrecognizedActivityType(async (context, next) => {
            assert(true, 'onUnrecognizedActivityType not called');
            done();
            await next();
        });

        processActivity({type: 'foo'}, bot, done);
    });

    it(`should fire onDialog`, async function(done) {

        const bot = new ActivityHandler();

        bot.onDialog(async (context, next) => {
            assert(true, 'onDialog not called');
            done();
            await next();
        });

        processActivity({type: 'foo'}, bot, done);
    });

    describe('should by default', () => {
        let onTurnCalled = false;
        let onMessageCalled = false;
        let onConversationUpdateCalled = false;
        let onMembersAddedCalled = false;
        let onMembersRemovedCalled = false;
        let onMessageReactionCalled = false;
        let onReactionsAddedCalled = false;
        let onReactionsRemovedCalled = false;
        let onEventCalled = false;
        let onTokenResponseEventCalled = false;
        let onUnrecognizedActivityTypeCalled = false;
        let onDialogCalled = false;

        afterEach(function() {
            onTurnCalled = false;
            onMessageCalled = false;
            onConversationUpdateCalled = false;
            onMembersAddedCalled = false;
            onMembersRemovedCalled = false;
            onMessageReactionCalled = false;
            onReactionsAddedCalled = false;
            onReactionsRemovedCalled = false;
            onEventCalled = false;
            onTokenResponseEventCalled = false;
            onUnrecognizedActivityTypeCalled = false;
            onDialogCalled = false;
        });

        function assertContextAndNext(context, next) {
            assert(context, 'context not found');
            assert(next, 'next not found');
        }

        function assertFalseFlag(flag, ...args) {
            assert(!flag, `${args[0]}Called should not be true before the ${args.join(', ')} handlers are called.`);
        }

        function assertTrueFlag(flag, ...args) {
            assert(flag, `${args[0]}Called should be true after the ${args[0]} handlers are called.`);
        }

        it('call "onTurn" handlers then dispatch by Activity Type "Message"', (done) => {
            const bot = new ActivityHandler();
            bot.onTurn(async (context, next) => {
                assertContextAndNext(context, next);
                assertFalseFlag(onTurnCalled, 'onTurn');
                onTurnCalled = true;
                assertFalseFlag(onConversationUpdateCalled, 'onMessage', 'onTurn');
                await next();
            });

            bot.onMessage(async (context, next) => {
                assertContextAndNext(context, next);
                assertTrueFlag(onTurnCalled, 'onTurn');
                assertFalseFlag(onConversationUpdateCalled, 'onMessage', 'onTurn');
                assert(!onMessageCalled, 'onMessage should not be true before onTurn and onMessage handlers complete.');
                onMessageCalled = true;
                await next();
            });

            processActivity({type: ActivityTypes.Message}, bot, done);
            assertTrueFlag(onTurnCalled, 'onTurn');
            assertTrueFlag(onMessageCalled, 'onMessage');
            done();
        });

        it('call "onTurn" handlers then dispatch by Activity Type "ConversationUpdate"', (done) => {
            const bot = new ActivityHandler();
            bot.onTurn(async (context, next) => {
                assertContextAndNext(context, next);
                assertFalseFlag(onTurnCalled, 'onTurn');
                onTurnCalled = true;
                assertFalseFlag(onConversationUpdateCalled, 'onConversationUpdate', 'onTurn');
                await next();
            });

            bot.onConversationUpdate(async (context, next) => {
                assertContextAndNext(context, next);
                assertTrueFlag(onTurnCalled, 'onTurn');
                assertFalseFlag(onConversationUpdateCalled, 'onConversationUpdate', 'onTurn');
                onConversationUpdateCalled = true;
                await next();
            });

            processActivity({type: ActivityTypes.ConversationUpdate}, bot, done);
            assertTrueFlag(onTurnCalled, 'onTurn');
            assertTrueFlag(onConversationUpdateCalled, 'onConversationUpdate');
            done();
        });

        it('call "onTurn" handlers then dispatch by Activity Type "ConversationUpdate"-subtype "MembersAdded"', (done) => {
            const bot = new ActivityHandler();
            bot.onTurn(async (context, next) => {
                assertContextAndNext(context, next);
                assertFalseFlag(onTurnCalled, 'onTurn');
                onTurnCalled = true;
                assertFalseFlag(onMembersAddedCalled, 'onMembersAdded', 'onTurn');
                await next();
            });

            bot.onMembersAdded(async (context, next) => {
                assertContextAndNext(context, next);
                assertTrueFlag(onTurnCalled, 'onTurn');
                assertFalseFlag(onMembersAddedCalled, 'onMembersAdded', 'onTurn');
                onMembersAddedCalled = true;
                await next();
            });

            processActivity({type: ActivityTypes.ConversationUpdate, membersAdded: [{id: 1}]}, bot, done);
            assertTrueFlag(onTurnCalled, 'onTurn', 'onMembersAdded');
            assertTrueFlag(onMembersAddedCalled, 'onMembersAdded', 'onTurn');
            done();
        });

        it('call "onTurn" handlers then dispatch by Activity Type "ConversationUpdate"-subtype "MembersRemoved"', (done) => {
            const bot = new ActivityHandler();
            bot.onTurn(async (context, next) => {
                assertContextAndNext(context, next);
                assertFalseFlag(onTurnCalled, 'onTurn');
                onTurnCalled = true;
                assertFalseFlag(onMembersRemovedCalled, 'onMembersRemoved', 'onTurn');
                await next();
            });

            bot.onMembersRemoved(async (context, next) => {
                assertContextAndNext(context, next);
                assertTrueFlag(onTurnCalled, 'onTurn');
                assertFalseFlag(onMembersRemovedCalled, 'onMembersRemoved', 'onTurn');
                onMembersRemovedCalled = true;
                await next();
            });

            processActivity({type: ActivityTypes.ConversationUpdate, membersRemoved: [{id: 1}]}, bot, done);
            assertTrueFlag(onTurnCalled, 'onTurn', 'onMembersRemoved');
            assertTrueFlag(onMembersRemovedCalled, 'onMembersRemoved', 'onTurn');
            done();
        });

        it('call "onTurn" handlers then dispatch by Activity Type "MessageReaction"', (done) => {
            const bot = new ActivityHandler();
            bot.onTurn(async (context, next) => {
                assertContextAndNext(context, next);
                assertFalseFlag(onTurnCalled, 'onTurn');
                onTurnCalled = true;
                assertFalseFlag(onMessageReactionCalled, 'onMessageReaction', 'onTurn');
                await next();
            });

            bot.onMessageReaction(async (context, next) => {
                assertContextAndNext(context, next);
                assertTrueFlag(onTurnCalled, 'onTurn');
                assertFalseFlag(onMessageReactionCalled, 'onMessageReaction', 'onTurn');
                onMessageReactionCalled = true;
                await next();
            });

            processActivity({type: ActivityTypes.MessageReaction, reactionsRemoved: [{type: 'like'}]}, bot, done);
            assertTrueFlag(onTurnCalled, 'onTurn', 'onMembersAdded');
            assertTrueFlag(onMessageReactionCalled, 'onMessageReaction', 'onTurn');
            done();
        });

        it('call "onTurn" handlers then dispatch by Activity Type "MessageReaction"-subtype "ReactionsAdded"', (done) => {
            const bot = new ActivityHandler();
            bot.onTurn(async (context, next) => {
                assertContextAndNext(context, next);
                assertFalseFlag(onTurnCalled, 'onTurn');
                onTurnCalled = true;
                assertFalseFlag(onMessageReactionCalled, 'onMessageReaction', 'onTurn');
                assertFalseFlag(onReactionsRemovedCalled, 'onReactionsRemoved', 'onMessageReaction', 'onTurn');
                await next();
            });

            bot.onMessageReaction(async (context, next) => {
                assertContextAndNext(context, next);
                assertTrueFlag(onTurnCalled, 'onTurn');
                assertFalseFlag(onMessageReactionCalled, 'onMessageReaction', 'onTurn');
                onMessageReactionCalled = true;
                assertFalseFlag(onReactionsRemovedCalled, 'onReactionsRemoved', 'onMessageReaction', 'onTurn');
                await next();
            });

            bot.onReactionsAdded(async (context, next) => {
                assertContextAndNext(context, next);
                assertTrueFlag(onTurnCalled, 'onTurn');
                assertTrueFlag(onMessageReactionCalled, 'onMessageReaction', 'onTurn');
                assertFalseFlag(onReactionsAddedCalled, 'onReactionsAdded', 'onMessageReaction', 'onTurn');
                onReactionsAddedCalled = true;
                await next();
            });

            processActivity({type: ActivityTypes.MessageReaction, reactionsAdded: [{type: 'like'}]}, bot, done);
            assertTrueFlag(onTurnCalled, 'onTurn', 'onMembersAdded');
            assertTrueFlag(onMessageReactionCalled, 'onMessageReaction');
            assertTrueFlag(onReactionsAddedCalled, 'onReactionsAdded', 'onMessageReaction', 'onTurn');
            done();
        });

        it('call "onTurn" handlers then dispatch by Activity Type "MessageReaction"-subtype "ReactionsRemoved"', (done) => {
            const bot = new ActivityHandler();
            bot.onTurn(async (context, next) => {
                assertContextAndNext(context, next);
                assertFalseFlag(onTurnCalled, 'onTurn');
                onTurnCalled = true;
                assertFalseFlag(onMessageReactionCalled, 'onMessageReaction', 'onTurn');
                assertFalseFlag(onReactionsRemovedCalled, 'onReactionsRemoved', 'onMessageReaction', 'onTurn');
                await next();
            });

            bot.onMessageReaction(async (context, next) => {
                assertContextAndNext(context, next);
                assertTrueFlag(onTurnCalled, 'onTurn');
                assertFalseFlag(onMessageReactionCalled, 'onMessageReaction', 'onTurn');
                onMessageReactionCalled = true;
                assertFalseFlag(onReactionsRemovedCalled, 'onReactionsRemoved', 'onMessageReaction', 'onTurn');
                await next();
            });

            bot.onReactionsRemoved(async (context, next) => {
                assertContextAndNext(context, next);
                assertTrueFlag(onTurnCalled, 'onTurn');
                assertTrueFlag(onMessageReactionCalled, 'onMessageReaction', 'onTurn');
                assertFalseFlag(onReactionsRemovedCalled, 'onReactionsRemoved', 'onMessageReaction', 'onTurn');
                onReactionsRemovedCalled = true;
                await next();
            });

            processActivity({type: ActivityTypes.MessageReaction, reactionsRemoved: [{type: 'like'}]}, bot, done);
            assertTrueFlag(onTurnCalled, 'onTurn', 'onMembersAdded');
            assertTrueFlag(onMessageReactionCalled, 'onMessageReaction');
            assertTrueFlag(onReactionsRemovedCalled, 'onReactionsRemoved');
            done();
        });

        it('call the default onHealthCheck when called with Activity Type "Invoke" with name "healthCheck"', (done) => {
            const activity = { type: ActivityTypes.Invoke, name: 'healthCheck' };
            const testAdapter = new TestAdapter();
            const context = new TurnContext(testAdapter, activity);
            const bot = new ActivityHandler();
            bot.run(context)
                .then(() => {
                    const invokeResponseActivity = testAdapter.activityBuffer.find((a) => a.type == 'invokeResponse');
                    const healthCheckResponse = invokeResponseActivity.value.body;
                    assert(true, healthCheckResponse.healthResults.success);
                    assert('Health check succeeded.', healthCheckResponse.healthResults.messages[0]);
                    done();
                })
                .catch(error => done(error));
        });

        it('call the default onHealthCheck when called with Activity Type "Invoke" with name "healthCheck" with results from the adapter', (done) => {
            const activity = { type: ActivityTypes.Invoke, name: 'healthCheck' };
            const testAdapter = new TestAdapter();

            testAdapter.healthCheck = async (context) => {
                return { healthResults: {
                    success: true,
                    "user-agent": 'user-agent-header-value',
                    authorization: 'authorization-header-value',
                    messages: [ 'Health results from adapter.' ] } } 
            };

            const context = new TurnContext(testAdapter, activity);
            const bot = new ActivityHandler();
            bot.run(context)
                .then(() => {
                    const invokeResponseActivity = testAdapter.activityBuffer.find((a) => a.type == 'invokeResponse');
                    const healthCheckResponse = invokeResponseActivity.value.body;
                    assert(true, healthCheckResponse.healthResults.success);
                    assert('user-agent-header-value', healthCheckResponse.healthResults["user-agent"]);
                    assert('authorization-header-value', healthCheckResponse.healthResults.authorization);
                    assert('Health results from adapter.', healthCheckResponse.healthResults.messages[0]);
                    done();
                })
                .catch(error => done(error));
        });

        it('call "onTurn" handlers then dispatch by Activity Type "event"', (done) => {
            const bot = new ActivityHandler();
            bot.onTurn(async (context, next) => {
                assertContextAndNext(context, next);
                assertFalseFlag(onTurnCalled, 'onTurn');
                onTurnCalled = true;
                assertFalseFlag(onEventCalled, 'onEvent', 'onTurn');
                await next();
            });

            bot.onEvent(async (context, next) => {
                assertContextAndNext(context, next);
                assertTrueFlag(onTurnCalled, 'onTurn');
                assertFalseFlag(onEventCalled, 'onEvent', 'onTurn');
                assert(!onEventCalled, 'onEvent should not be true before onTurn and onEvent handlers complete.');
                onEventCalled = true;
                await next();
            });

            processActivity({ type: ActivityTypes.Event }, bot, done);
            assertTrueFlag(onTurnCalled, 'onTurn');
            assertTrueFlag(onEventCalled, 'onEvent');
            done();
        });

        it('call "onTurn" handlers then dispatch by Activity Type "event" with name "healthtokens/responseCheck', (done) => {
            const bot = new ActivityHandler();
            bot.onTurn(async (context, next) => {
                assertContextAndNext(context, next);
                assertFalseFlag(onTurnCalled, 'onTurn');
                onTurnCalled = true;
                assertFalseFlag(onEventCalled, 'onEvent', 'onTurn');
                assertFalseFlag(onTokenResponseEventCalled, 'onTokenResponseEvent', 'onTurn', 'onEvent');
                await next();
            });

            bot.onEvent(async (context, next) => {
                assertContextAndNext(context, next);
                assertTrueFlag(onTurnCalled, 'onTurn');
                assertFalseFlag(onEventCalled, 'onEvent', 'onTurn');
                onEventCalled = true;
                assertFalseFlag(onTokenResponseEventCalled, 'onTokenResponseEvent', 'onTurn', 'onEvent');
                await next();
            });

            bot.onTokenResponseEvent(async (context, next) => {
                assertContextAndNext(context, next);
                assertTrueFlag(onTurnCalled, 'onTurn');
                assertTrueFlag(onEventCalled, 'onEvent');
                assertFalseFlag(onTokenResponseEventCalled, 'onTokenResponseEvent', 'onTurn', 'onEvent');
                assert(!onTokenResponseEventCalled, 'onEvent should not be true before onTurn and onEvent handlers complete.');
                onTokenResponseEventCalled = true;
                await next();
            });

            processActivity({ type: ActivityTypes.Event, name: tokenResponseEventName }, bot, done);
            assertTrueFlag(onTurnCalled, 'onTurn');
            assertTrueFlag(onEventCalled, 'onEvent');
            assertTrueFlag(onTokenResponseEventCalled, 'onTokenResponseEvent');
            done();
        });

        it('call "onTurn" handlers then dispatch for unrecognized ActivityTypes', (done) => {
            const bot = new ActivityHandler();
            bot.onTurn(async (context, next) => {
                assertContextAndNext(context, next);
                assertFalseFlag(onTurnCalled, 'onTurn');
                onTurnCalled = true;
                assertFalseFlag(onUnrecognizedActivityTypeCalled, 'onUnrecognizedActivityType', 'onTurn');
                await next();
            });

            bot.onUnrecognizedActivityType(async (context, next) => {
                assertContextAndNext(context, next);
                assertTrueFlag(onTurnCalled, 'onTurn');
                assertFalseFlag(onUnrecognizedActivityTypeCalled, 'onUnrecognizedActivityType', 'onTurn');
                assert(!onUnrecognizedActivityTypeCalled, 'onUnrecognizedActivityType should not be true before onTurn and onUnrecognizedActivityType handlers complete.');
                onUnrecognizedActivityTypeCalled = true;
                await next();
            });

            processActivity({ type: 'not-a-real-type' }, bot, done);
            assertTrueFlag(onTurnCalled, 'onTurn');
            assertTrueFlag(onUnrecognizedActivityTypeCalled, 'onUnrecognizedActivityType');
            done();
        });

        it('call "onTurn" handlers then by default dispatch to onDialog for all ActivityTypes', (done) => {
            const bot = new ActivityHandler();
            bot.onTurn(async (context, next) => {
                assertContextAndNext(context, next);
                assertFalseFlag(onTurnCalled, 'onTurn');
                onTurnCalled = true;
                assertFalseFlag(onDialogCalled, 'onDialog', 'onTurn');
                await next();
            });

            bot.onDialog(async (context, next) => {
                assertContextAndNext(context, next);
                assertTrueFlag(onTurnCalled, 'onTurn');
                assertFalseFlag(onDialogCalled, 'onDialog', 'onTurn');
                assert(!onDialogCalled, 'onDialog should not be true before onTurn and onDialog handlers complete.');
                onDialogCalled = true;
                await next();
            });

            processActivity({ type: ActivityTypes.Event }, bot, done);
            assertTrueFlag(onTurnCalled, 'onTurn');
            assertTrueFlag(onDialogCalled, 'onDialog');
            done();
        });
    });
});