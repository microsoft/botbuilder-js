const assert = require('assert');
const { ActivityHandler, ActivityTypes, TestAdapter, tokenResponseEventName, TurnContext } = require('../lib');

describe('ActivityHandler', function () {
    const adapter = new TestAdapter();

    async function processActivity(activity, bot) {
        if (!activity) {
            throw new Error('Missing activity');
        }

        if (!bot) {
            throw new Error('Missing bot');
        }

        const context = new TurnContext(adapter, activity);
        await bot.run(context);
    }

    it(`should fire onTurn for any inbound activity`, async function () {
        const bot = new ActivityHandler();

        let onTurnCalled = false;
        bot.onTurn(async (context, next) => {
            onTurnCalled = true;
            await next();
        });

        await processActivity({ type: 'any' }, bot);
        assert(onTurnCalled);
    });

    it(`should fire onMessage for any message activities`, async function () {
        const bot = new ActivityHandler();

        let onMessageCalled = false;
        bot.onMessage(async (context, next) => {
            onMessageCalled = true;
            await next();
        });

        await processActivity({ type: ActivityTypes.Message }, bot);
        assert(onMessageCalled);
    });

    it(`calling  next allows following events to firing`, async function () {
        const bot = new ActivityHandler();

        let onTurnCalled = false;
        bot.onTurn(async (context, next) => {
            onTurnCalled = true;
            await next();
        });

        let onMessageCalled = false;
        bot.onMessage(async (context, next) => {
            onMessageCalled = true;
            await next();
        });

        await processActivity({ type: ActivityTypes.Message }, bot);
        assert(onTurnCalled);
        assert(onMessageCalled);
    });

    it(`omitting call to next prevents following events from firing`, async function () {
        const bot = new ActivityHandler();

        let onTurnCalled = false;
        bot.onTurn(async (context, next) => {
            onTurnCalled = true;
        });

        let onMessageCalled = false;
        bot.onMessage(async (context, next) => {
            onMessageCalled = false;
            await next();
        });

        await processActivity({ type: ActivityTypes.Message }, bot);
        assert(onTurnCalled);
        assert(!onMessageCalled);
    });

    it(`binding 2 methods to the same event both fire`, async function () {
        const bot = new ActivityHandler();
        let count = 0;

        let onMessageCalled = false;
        bot.onMessage(async (context, next) => {
            onMessageCalled = true;
            count++;
            await next();
        });

        let onMessageCalledAgain = false;
        bot.onMessage(async (context, next) => {
            onMessageCalledAgain = true;
            count++;
            await next();
        });

        await processActivity({ type: ActivityTypes.Message }, bot);
        assert(onMessageCalled);
        assert(onMessageCalledAgain);
        assert(count === 2, 'all events did fire');
    });

    it(`should fire onConversationUpdate`, async function () {
        const bot = new ActivityHandler();

        let onConversationUpdateCalled = false;
        bot.onConversationUpdate(async (context, next) => {
            onConversationUpdateCalled = true;
            await next();
        });

        await processActivity({ type: ActivityTypes.ConversationUpdate }, bot);
        assert(onConversationUpdateCalled);
    });

    it(`should fire onMembersAdded`, async function () {
        const bot = new ActivityHandler();

        let onMembersAddedCalled = false;
        bot.onMembersAdded(async (context, next) => {
            onMembersAddedCalled = true;
            await next();
        });

        await processActivity({ type: ActivityTypes.ConversationUpdate, membersAdded: [{ id: 1 }] }, bot);
        assert(onMembersAddedCalled);
    });

    it(`should fire onMembersRemoved`, async function () {
        const bot = new ActivityHandler();

        let onMembersRemovedCalled = false;
        bot.onMembersRemoved(async (context, next) => {
            onMembersRemovedCalled = true;
            await next();
        });

        await processActivity({ type: ActivityTypes.ConversationUpdate, membersRemoved: [{ id: 1 }] }, bot);
        assert(onMembersRemovedCalled);
    });

    it(`should fire onMessageReaction`, async function () {
        const bot = new ActivityHandler();

        let onMessageReactionCalled = false;
        bot.onMessageReaction(async (context, next) => {
            onMessageReactionCalled = true;
            await next();
        });

        await processActivity({ type: ActivityTypes.MessageReaction }, bot);
        assert(onMessageReactionCalled);
    });

    it(`should fire onReactionsAdded`, async function () {
        const bot = new ActivityHandler();

        let onReactionsAddedCalled = false;
        bot.onReactionsAdded(async (context, next) => {
            onReactionsAddedCalled = true;
            await next();
        });

        await processActivity({ type: ActivityTypes.MessageReaction, reactionsAdded: [{ type: 'like' }] }, bot);
        assert(onReactionsAddedCalled);
    });

    it(`should fire onReactionsRemoved`, async function () {
        const bot = new ActivityHandler();

        let onReactionsRemovedCalled = false;
        bot.onReactionsRemoved(async (context, next) => {
            onReactionsRemovedCalled = true;
            await next();
        });

        await processActivity({ type: ActivityTypes.MessageReaction, reactionsRemoved: [{ type: 'like' }] }, bot);
        assert(onReactionsRemovedCalled);
    });

    it(`should fire onEvent`, async function () {
        const bot = new ActivityHandler();

        let onEventCalled = false;
        bot.onEvent(async (context, next) => {
            onEventCalled = true;
            await next();
        });

        await processActivity({ type: ActivityTypes.Event }, bot);
        assert(onEventCalled);
    });

    it(`should fire onEndOfConversation`, async function () {
        const bot = new ActivityHandler();

        let onEndConversationCalled = false;
        bot.onEndOfConversation(async (context, next) => {
            onEndConversationCalled = true;
            await next();
        });

        await processActivity({ type: ActivityTypes.EndOfConversation }, bot);
        assert(onEndConversationCalled);
    });

    it(`should fire onTyping`, async function () {
        const bot = new ActivityHandler();

        let onTypingCalled = false;
        bot.onTyping(async (context, next) => {
            onTypingCalled = true;
            await next();
        });

        await processActivity({ type: ActivityTypes.Typing }, bot);
        assert(onTypingCalled);
    });

    it(`should fire onInstallationUpdate`, async function () {
        const bot = new ActivityHandler();

        let onInstallationUpdateCalled = false;
        bot.onInstallationUpdate(async (context, next) => {
            onInstallationUpdateCalled = true;
            await next();
        });

        await processActivity({ type: ActivityTypes.InstallationUpdate }, bot);
        assert(onInstallationUpdateCalled);
    });

    it(`should fire onInstallationUpdateAdd`, async function () {
        const bot = new ActivityHandler();

        let onInstallationUpdateAddCalled = false;
        bot.onInstallationUpdateAdd(async (context, next) => {
            onInstallationUpdateAddCalled = true;
            await next();
        });

        await processActivity({ type: ActivityTypes.InstallationUpdate, action: 'add' }, bot);
        assert(onInstallationUpdateAddCalled);
    });

    it(`should fire onInstallationUpdateAddUpgrade`, async function () {
        const bot = new ActivityHandler();

        let onInstallationUpdateAddCalled = false;
        bot.onInstallationUpdateAdd(async (context, next) => {
            onInstallationUpdateAddCalled = true;
            await next();
        });

        await processActivity({ type: ActivityTypes.InstallationUpdate, action: 'add-upgrade' }, bot);
        assert(onInstallationUpdateAddCalled);
    });

    it(`should fire onInstallationUpdateRemove`, async function () {
        const bot = new ActivityHandler();

        let onInstallationUpdateRemoveCalled = false;
        bot.onInstallationUpdateRemove(async (context, next) => {
            onInstallationUpdateRemoveCalled = true;
            await next();
        });

        await processActivity({ type: ActivityTypes.InstallationUpdate, action: 'remove' }, bot);
        assert(onInstallationUpdateRemoveCalled);
    });

    it(`should fire onInstallationUpdateRemoveUpgrade`, async function () {
        const bot = new ActivityHandler();

        let onInstallationUpdateRemoveCalled = false;
        bot.onInstallationUpdateRemove(async (context, next) => {
            onInstallationUpdateRemoveCalled = true;
            await next();
        });

        await processActivity({ type: ActivityTypes.InstallationUpdate, action: 'remove-upgrade' }, bot);
        assert(onInstallationUpdateRemoveCalled);
    });

    it(`should fire onUnrecognizedActivityType`, async function () {
        const bot = new ActivityHandler();

        let onUnrecognizedActivityTypeCalled = false;
        bot.onUnrecognizedActivityType(async (context, next) => {
            onUnrecognizedActivityTypeCalled = true;
            await next();
        });

        await processActivity({ type: 'foo' }, bot);
        assert(onUnrecognizedActivityTypeCalled);
    });

    it(`should fire onDialog`, async function () {
        const bot = new ActivityHandler();

        let onDialogCalled = false;
        bot.onDialog(async (context, next) => {
            onDialogCalled = true;
            await next();
        });

        await processActivity({ type: 'foo' }, bot);
        assert(onDialogCalled);
    });

    describe('should by default', function () {
        let onTurnCalled = false;
        let onMessageCalled = false;
        let onCommandActivityCalled = false;
        let onCommandResultActivityCalled = false;
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
            onCommandActivityCalled = false;
            onCommandResultActivityCalled = false;
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

        it('call "onTurn" handlers then dispatch by Activity Type "Message"', async function () {
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

            await processActivity({ type: ActivityTypes.Message }, bot);
            assertTrueFlag(onTurnCalled, 'onTurn');
            assertTrueFlag(onMessageCalled, 'onMessage');
        });

        it('call "onTurn" handlers then dispatch by Activity Type "Command"', async function () {
            const bot = new ActivityHandler();
            bot.onTurn(async (context, next) => {
                assertContextAndNext(context, next);
                assertFalseFlag(onTurnCalled, 'onTurn');
                onTurnCalled = true;
                assertFalseFlag(onCommandActivityCalled, 'onCommandActivity', 'onTurn');
                await next();
            });

            bot.onCommand(async (context, next) => {
                assertContextAndNext(context, next);
                assertTrueFlag(onTurnCalled, 'onTurn');
                assertFalseFlag(onCommandActivityCalled, 'onCommandActivity', 'onTurn');
                onCommandActivityCalled = true;
                await next();
            });

            await processActivity({ type: ActivityTypes.Command }, bot);
            assertTrueFlag(onTurnCalled, 'onTurn');
            assertTrueFlag(onCommandActivityCalled, 'onCommandActivity');
        });

        it('call "onTurn" handlers then dispatch by Activity Type "CommandResult"', async function () {
            const bot = new ActivityHandler();
            bot.onTurn(async (context, next) => {
                assertContextAndNext(context, next);
                assertFalseFlag(onTurnCalled, 'onTurn');
                onTurnCalled = true;
                assertFalseFlag(onCommandResultActivityCalled, 'onCommandResultActivity', 'onTurn');
                await next();
            });

            bot.onCommandResult(async (context, next) => {
                assertContextAndNext(context, next);
                assertTrueFlag(onTurnCalled, 'onTurn');
                assertFalseFlag(onCommandResultActivityCalled, 'onCommandResultActivity', 'onTurn');
                onCommandResultActivityCalled = true;
                await next();
            });

            await processActivity({ type: ActivityTypes.CommandResult }, bot);
            assertTrueFlag(onTurnCalled, 'onTurn');
            assertTrueFlag(onCommandResultActivityCalled, 'onCommandResultActivity');
        });

        it('call "onTurn" handlers then dispatch by Activity Type "ConversationUpdate"', async function () {
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

            await processActivity({ type: ActivityTypes.ConversationUpdate }, bot);
            assertTrueFlag(onTurnCalled, 'onTurn');
            assertTrueFlag(onConversationUpdateCalled, 'onConversationUpdate');
        });

        it('call "onTurn" handlers then dispatch by Activity Type "ConversationUpdate"-subtype "MembersAdded"', async function () {
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

            await processActivity({ type: ActivityTypes.ConversationUpdate, membersAdded: [{ id: 1 }] }, bot);
            assertTrueFlag(onTurnCalled, 'onTurn', 'onMembersAdded');
            assertTrueFlag(onMembersAddedCalled, 'onMembersAdded', 'onTurn');
        });

        it('call "onTurn" handlers then dispatch by Activity Type "ConversationUpdate"-subtype "MembersRemoved"', async function () {
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

            await processActivity({ type: ActivityTypes.ConversationUpdate, membersRemoved: [{ id: 1 }] }, bot);
            assertTrueFlag(onTurnCalled, 'onTurn', 'onMembersRemoved');
            assertTrueFlag(onMembersRemovedCalled, 'onMembersRemoved', 'onTurn');
        });

        it('call "onTurn" handlers then dispatch by Activity Type "MessageReaction"', async function () {
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

            await processActivity({ type: ActivityTypes.MessageReaction, reactionsRemoved: [{ type: 'like' }] }, bot);
            assertTrueFlag(onTurnCalled, 'onTurn', 'onMembersAdded');
            assertTrueFlag(onMessageReactionCalled, 'onMessageReaction', 'onTurn');
        });

        it('call "onTurn" handlers then dispatch by Activity Type "MessageReaction"-subtype "ReactionsAdded"', async function () {
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

            await processActivity({ type: ActivityTypes.MessageReaction, reactionsAdded: [{ type: 'like' }] }, bot);
            assertTrueFlag(onTurnCalled, 'onTurn', 'onMembersAdded');
            assertTrueFlag(onMessageReactionCalled, 'onMessageReaction');
            assertTrueFlag(onReactionsAddedCalled, 'onReactionsAdded', 'onMessageReaction', 'onTurn');
        });

        it('call "onTurn" handlers then dispatch by Activity Type "MessageReaction"-subtype "ReactionsRemoved"', async function () {
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

            await processActivity({ type: ActivityTypes.MessageReaction, reactionsRemoved: [{ type: 'like' }] }, bot);
            assertTrueFlag(onTurnCalled, 'onTurn', 'onMembersAdded');
            assertTrueFlag(onMessageReactionCalled, 'onMessageReaction');
            assertTrueFlag(onReactionsRemovedCalled, 'onReactionsRemoved');
        });

        it('call "onTurn" handlers then dispatch by Activity Type "event"', async function () {
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

            await processActivity({ type: ActivityTypes.Event }, bot);
            assertTrueFlag(onTurnCalled, 'onTurn');
            assertTrueFlag(onEventCalled, 'onEvent');
        });

        it('call "onTurn" handlers then dispatch by Activity Type "event" with name "healthtokens/responseCheck', async function () {
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
                assert(
                    !onTokenResponseEventCalled,
                    'onEvent should not be true before onTurn and onEvent handlers complete.'
                );
                onTokenResponseEventCalled = true;
                await next();
            });

            await processActivity({ type: ActivityTypes.Event, name: tokenResponseEventName }, bot);
            assertTrueFlag(onTurnCalled, 'onTurn');
            assertTrueFlag(onEventCalled, 'onEvent');
            assertTrueFlag(onTokenResponseEventCalled, 'onTokenResponseEvent');
        });

        it('call "onTurn" handlers then dispatch for unrecognized ActivityTypes', async function () {
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
                assert(
                    !onUnrecognizedActivityTypeCalled,
                    'onUnrecognizedActivityType should not be true before onTurn and onUnrecognizedActivityType handlers complete.'
                );
                onUnrecognizedActivityTypeCalled = true;
                await next();
            });

            await processActivity({ type: 'not-a-real-type' }, bot);
            assertTrueFlag(onTurnCalled, 'onTurn');
            assertTrueFlag(onUnrecognizedActivityTypeCalled, 'onUnrecognizedActivityType');
        });

        it('call "onTurn" handlers then by default dispatch to onDialog for all ActivityTypes', async function () {
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

            await processActivity({ type: ActivityTypes.Event }, bot);
            assertTrueFlag(onTurnCalled, 'onTurn');
            assertTrueFlag(onDialogCalled, 'onDialog');
        });
    });
});
