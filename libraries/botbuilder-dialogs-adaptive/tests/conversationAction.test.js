const assert = require('assert');
const {
    ActivityTypes,
    TestAdapter,
    TurnContext,
    useBotState,
    MemoryStorage,
    ConversationState,
    UserState,
    QueueStorage,
    ActivityEventNames,
} = require('botbuilder');
const { DialogManager, DialogTurnStateConstants } = require('botbuilder-dialogs');
const {
    ContinueConversation,
    ContinueConversationLater,
    AdaptiveDialog,
    OnMessageActivity,
    SendActivity,
    ActivityTemplate,
    GetConversationReference,
} = require('../lib');
const { AssertCondition } = require('botbuilder-dialogs-adaptive-testing/lib')

class MockQueue extends QueueStorage {
    constructor() {
        super();
        this.receipt = 1;
        this.queue = [];
    }

    async queueActivity(activity, visibilityTimeout, _timeToLive) {
        if (visibilityTimeout) {
            setTimeout(() => {
                this.queue.push(activity);
            }, visibilityTimeout * 1000);
        } else {
            this.queue.push(activity);
        }

        return `${this.receipt++}`;
    }

    async receiveActivity() {
        let activity;
        while (!activity) {
            if (this.queue.length) {
                activity = this.queue.shift();
                break;
            } else {
                await new Promise((resolve) => {
                    setTimeout(function () {
                        resolve();
                    }, 1000);
                });
            }
        }
        return activity;
    }
}

describe('ConversationAction', function () {
    this.timeout(5000);

    it('ContinueConverationLater', async () => {
        const storage = new MemoryStorage();
        const queueStorage = new MockQueue();
        const dm = new DialogManager(
            new ContinueConversationLater().configure({
                date: '=addSeconds(utcNow(), 2)',
                value: 'foo',
            })
        );

        dm.initialTurnState.set(DialogTurnStateConstants.queueStorage, queueStorage);
        const adapter = new TestAdapter((turnContext) => {
            return dm.onTurn(turnContext);
        });
        useBotState(adapter, new ConversationState(storage), new UserState(storage));

        const cr = adapter.conversation;
        adapter.send('hi').startTest();
        await new Promise((resolve) => {
            setTimeout(function () {
                resolve();
            }, 2000);
        });

        const activity = await queueStorage.receiveActivity();
        assert.strictEqual(activity.type, ActivityTypes.Event);
        assert.strictEqual(activity.name, ActivityEventNames.ContinueConversation);
        assert.strictEqual(activity.value, 'foo');
        assert(activity.relatesTo);
        const cr2 = TurnContext.getConversationReference(activity);
        delete cr.activityId;
        delete cr.locale;
        delete cr2.activityId;
        delete cr2.locale;
        assert.deepStrictEqual(cr, cr2);
    });

    it('ContinueConversation', async () => {
        const storage = new MemoryStorage();
        const queueStorage = new MockQueue();
        const cr = TestAdapter.createConversation('ContinueConversationTests');
        const dm = new DialogManager(
            new AdaptiveDialog().configure({
                triggers: [
                    new OnMessageActivity().configure({
                        actions: [
                            new ContinueConversation().configure({
                                conversationReference: cr,
                                value: 'foo',
                            }),
                            new SendActivity().configure({
                                activity: new ActivityTemplate('ContinueConversation Sent'),
                            }),
                        ],
                    }),
                ],
            })
        );
        dm.initialTurnState.set(DialogTurnStateConstants.queueStorage, queueStorage);
        const adapter = new TestAdapter((turnContext) => {
            return dm.onTurn(turnContext);
        });
        useBotState(adapter, new ConversationState(storage), new UserState(storage));

        adapter.send('hi').startTest();
        await new Promise((resolve) => {
            setTimeout(function () {
                resolve();
            }, 2000);
        });

        const activity = await queueStorage.receiveActivity();
        assert.strictEqual(activity.type, ActivityTypes.Event);
        assert.strictEqual(activity.name, ActivityEventNames.ContinueConversation);
        assert.strictEqual(activity.value, 'foo');
        assert(activity.relatesTo);
        const cr2 = TurnContext.getConversationReference(activity);
        delete cr.activityId;
        delete cr.locale;
        delete cr2.activityId;
        delete cr2.locale;
        assert.deepStrictEqual(cr, cr2);
    });

    it('GetConversationReference', async () => {
        const storage = new MemoryStorage();
        const queueStorage = new MockQueue();
        const dm = new DialogManager(
            new AdaptiveDialog().configure({
                triggers: [
                    new OnMessageActivity().configure({
                        actions: [
                            new GetConversationReference().configure({
                                property: '$cr',
                            }),
                            new AssertCondition().configure({
                                condition: "$cr.channelId == 'test'",
                            }),
                            new AssertCondition().configure({
                                condition: "$cr.conversation.id == 'Convo1'",
                            }),
                            new AssertCondition().configure({
                                condition: '$cr.conversation.id == turn.activity.conversation.id',
                            }),
                            new AssertCondition().configure({
                                condition: '$cr.bot.id == turn.activity.recipient.id',
                            }),
                            new AssertCondition().configure({
                                condition: '$cr.user.id == turn.activity.from.id',
                            }),
                            new SendActivity('ok'),
                        ],
                    }),
                ],
            })
        );
        dm.initialTurnState.set(DialogTurnStateConstants.queueStorage, queueStorage);
        const adapter = new TestAdapter((turnContext) => {
            return dm.onTurn(turnContext);
        });
        useBotState(adapter, new ConversationState(storage), new UserState(storage));

        await adapter.send('hi').assertReply('ok').startTest();
    });
});
