const assert = require('assert');
const { ActivityHandler, ActivityTypes, TurnContext, TestAdapter } = require('../lib');

describe('ActivityHandler', function() {

    const adapter = new TestAdapter();

    async function processActivity(activity, bot) {
        const context = new TurnContext(adapter, activity);
        await bot.run(context);
    }

    it(`should fire onTurn for any inbound activity`, async function (done) {

        const bot = new ActivityHandler();

        bot.onTurn(async(context, next) => {
            assert(true, 'onTurn not called');
            done();
            await next();
        });

        processActivity({type: 'any'}, bot);
    });

    it(`should fire onMessage for any message activities`, async function (done) {

        const bot = new ActivityHandler();

        bot.onMessage(async(context, next) => {
            assert(true, 'onMessage not called');
            done();
            await next();
        });

        processActivity({type: 'message'}, bot);
    });

    it(`calling  next allows following events to firing`, async function (done) {

        const bot = new ActivityHandler();

        bot.onTurn(async(context, next) => {
            assert(true, 'onTurn not called');
            await next();
        });

        bot.onMessage(async(context, next) => {
            assert(true, 'onMessage not called');
            done();
            await next();
        });

        processActivity({type: 'message'}, bot);
    });

    it(`omitting call to next prevents following events from firing`, async function (done) {

        const bot = new ActivityHandler();

        bot.onTurn(async(context, next) => {
            assert(true, 'onTurn not called');
            done();
        });

        bot.onMessage(async(context, next) => {
            assert(false, 'onMessage called improperly!');
            await next();
        });

        processActivity({type: 'message'}, bot);
    });

    it(`binding 2 methods to the same event both fire`, async function (done) {

        const bot = new ActivityHandler();
        let count = 0;

        bot.onMessage(async(context, next) => {
            assert(true, 'event 1 did not fire');
            count++;
            await next();
        });

        bot.onMessage(async(context, next) => {
            assert(true, 'event 2 did not fire');
            count++;

            assert(count === 2, 'all events did fire');
            done();
            await next();
        });

        processActivity({type: 'message'}, bot);
    });

    it(`should fire onConversationUpdate`, async function (done) {

        const bot = new ActivityHandler();

        bot.onConversationUpdate(async(context, next) => {
            assert(true, 'onConversationUpdate not called');
            done();
            await next();
        });

        processActivity({type: ActivityTypes.ConversationUpdate}, bot);
    });

    it(`should fire onMembersAdded`, async function (done) {

        const bot = new ActivityHandler();

        bot.onMembersAdded(async(context, next) => {
            assert(true, 'onConversationUpdate not called');
            done();
            await next();
        });

        processActivity({type: ActivityTypes.ConversationUpdate, membersAdded: [{id: 1}]}, bot);
    });

    it(`should fire onMembersRemoved`, async function (done) {

        const bot = new ActivityHandler();

        bot.onMembersRemoved(async(context, next) => {
            assert(true, 'onMembersRemoved not called');
            done();
            await next();
        });

        processActivity({type: ActivityTypes.ConversationUpdate, membersRemoved: [{id: 1}]}, bot);
    });

    it(`should fire onMessageReaction`, async function (done) {

        const bot = new ActivityHandler();

        bot.onMessageReaction(async(context, next) => {
            assert(true, 'onMessageReaction not called');
            done();
            await next();
        });

        processActivity({type: ActivityTypes.MessageReaction}, bot);
    });

    it(`should fire onReactionsAdded`, async function (done) {

        const bot = new ActivityHandler();

        bot.onReactionsAdded(async(context, next) => {
            assert(true, 'onReactionsAdded not called');
            done();
            await next();
        });

        processActivity({type: ActivityTypes.MessageReaction, reactionsAdded: [{type: 'like'}]}, bot);
    });

    it(`should fire onReactionsRemoved`, async function (done) {

        const bot = new ActivityHandler();

        bot.onReactionsRemoved(async(context, next) => {
            assert(true, 'onReactionsRemoved not called');
            done();
            await next();
        });

        processActivity({type: ActivityTypes.MessageReaction, reactionsRemoved: [{type: 'like'}]}, bot);
    });
    
    it(`should fire onEvent`, async function (done) {

        const bot = new ActivityHandler();

        bot.onEvent(async(context, next) => {
            assert(true, 'onEvent not called');
            done();
            await next();
        });

        processActivity({type: ActivityTypes.Event}, bot);
    });


    it(`should fire onUnrecognizedActivityType`, async function (done) {

        const bot = new ActivityHandler();

        bot.onUnrecognizedActivityType(async(context, next) => {
            assert(true, 'onUnrecognizedActivityType not called');
            done();
            await next();
        });

        processActivity({type: 'foo'}, bot);
    });

    it(`should fire onDialog`, async function (done) {

        const bot = new ActivityHandler();

        bot.onDialog(async(context, next) => {
            assert(true, 'onDialog not called');
            done();
            await next();
        });

        processActivity({type: 'foo'}, bot);
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

        afterEach(function () {
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

        function assertTrueFlagBeforeSubTypes(flag, ...args) {
            assert(flag, `${args[0]}Called should be true after the ${args[0]} handler is called but not before the ${args.splice(1).join(', ')} handlers are called.`);
        }

        it('call "onTurn" handlers then dispatch by Activity Type for "ConversationUpdate"', async () => {
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
    

            processActivity({type: ActivityTypes.ConversationUpdate}, bot);
            assertTrueFlag(onTurnCalled, 'onTurn');
            assertTrueFlag(onConversationUpdateCalled, 'onConversationUpdate');
        });

        it('call "onTurn" handlers then dispatch by Activity Type "Message"', async () => {
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
    

            processActivity({type: ActivityTypes.Message}, bot);
            assertTrueFlag(onTurnCalled, 'onTurn');
            assertTrueFlag(onMessageCalled, 'onMessage');
        });

        xit('call "onTurn" handlers then dispatch by Activity Type "MembersAdded"', async () => {
            const bot = new ActivityHandler();
            bot.onTurn(async (context, next) => {
                assertContextAndNext(context, next);
                assert(!onTurnCalled, 'onTurnCalled should not be true before the onTurn handlers are called.');
                onTurnCalled = true;
                assert(!onMembersAddedCalled, 'onMembersAdded should not be true before onTurn and onMembersAdded handlers complete.');
                await next();
            });

            bot.onMembersAdded(async (context, next) => {
                assertContextAndNext(context, next);
                assert(onTurnCalled, 'onTurnCalled should not be false before the onMembersAdded handlers are called.');
                assert(!onMembersAddedCalled, 'onMembersAdded should not be true before onTurn and onMembersAdded handlers complete.');
                onMembersAddedCalled = true;
                await next();
            });

            processActivity({type: ActivityTypes.ConversationUpdate, membersAdded: [{id: 1}]}, bot);
            assert(onTurnCalled, 'onTurnCalled should be true after the onTurn handlers are called.');
            assert(onMembersAddedCalled, 'onTurnCalled should be true after the onMembersAdded handlers are called.');
        });

        xit('call "onTurn" handlers then dispatch by Activity Type "MembersAdded"', async () => {
            const bot = new ActivityHandler();
            bot.onTurn(async (context, next) => {
                assertContextAndNext(context, next);
                assert(!onTurnCalled, 'onTurnCalled should not be true before the onTurn handlers are called.');
                onTurnCalled = true;
                assert(!onMessageReactionCalled, 'onMessageReaction should not be true before onTurn and onMessageReaction handlers complete.');
                assert(!onReactionsRemovedCalled, 'onMessageReaction should not be true before onTurn and onMessageReaction handlers complete.');
                await next();
            });

            bot.onMessageReaction(async (context, next) => {
                assertContextAndNext(context, next);
                assert(onTurnCalled, 'onTurnCalled should not be false before the onMessageReaction handlers are called.');
                assert(!onMessageReactionCalled, 'onMembersAdded should not be true before onTurn and onMembersAdded handlers complete.');
                onMessageReactionCalled = true;
                await next();
            });

            bot.onReactionsRemoved(async (context, next) => {
                assertContextAndNext(context, next);
                assert(onTurnCalled, 'onTurnCalled should not be false before the onReactionsRemoved handlers are called.');
                assert(!onReactionsRemovedCalled, 'onReactionsRemoved should not be true before onTurn and onReactionsRemoved handlers complete.');
                onReactionsRemovedCalled = true;
                await next();
            });
            processActivity({type: ActivityTypes.MessageReaction, reactionsRemoved: [{type: 'like'}]}, bot);

            assert(onTurnCalled, 'onTurnCalled should be true after the onTurn handlers are called.');
            assert(onMembersAddedCalled, 'onTurnCalled should be true after the onMembersAdded handlers are called.');
        });
    });

});