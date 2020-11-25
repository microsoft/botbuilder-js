const assert = require('assert');
const { QueueClient } = require('@azure/storage-queue');
const { DialogManager, DialogTurnStateConstants } = require('botbuilder-dialogs');
const {
    ActivityTypes,
    ActivityEventNames,
    ConversationState,
    MemoryStorage,
    TestAdapter,
    useBotState,
    UserState,
} = require('botbuilder-core');
const { ContinueConversationLater } = require('../../botbuilder-dialogs-adaptive/lib');
const { AzureQueueStorage } = require('../lib');

describe('AzureQueueStorage', function () {
    this.timeout(5000);

    it('ContinueConversationLaterTest', async function () {
        const connectionString = 'UseDevelopmentStorage=true';
        const queueName = 'ContinueConversationLaterTest'.toLowerCase();
        const queue = new QueueClient(connectionString, queueName);
        await queue.createIfNotExists();
        await queue.clearMessages();
        const queueStorage = new AzureQueueStorage(connectionString, queueName);

        const dm = new DialogManager(
            new ContinueConversationLater().configure({
                date: '=addSeconds(utcNow(), 2)',
                value: 'foo',
            })
        );

        dm.initialTurnState.set(DialogTurnStateConstants.queueStorage, queueStorage);

        const adapter = new TestAdapter(async (context) => {
            return dm.onTurn(context);
        });

        const memoryStorage = new MemoryStorage();
        useBotState(adapter, new ConversationState(memoryStorage), new UserState(memoryStorage));

        await adapter.send('hi').startTest();

        const { receivedMessageItems } = await new Promise((resolve) => setTimeout(resolve, 2000)).then(() =>
            queue.receiveMessages()
        );
        assert.strictEqual(receivedMessageItems.length, 1);

        const message = receivedMessageItems[0];
        const messageJson = Buffer.from(message.messageText, 'base64').toString();
        const activity = JSON.parse(messageJson);
        assert.strictEqual(activity.type, ActivityTypes.Event);
        assert.strictEqual(activity.name, ActivityEventNames.ContinueConversation);
        assert.strictEqual(activity.value, 'foo');
        assert(activity.relatesTo);
    });
});
