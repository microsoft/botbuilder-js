const assert = require('assert');

const { TurnContext, BotStateSet, BotState, MemoryStorage, UserState, ConversationState, TestAdapter } = require('../lib');

const receivedMessage = { text: 'received', type: 'message', channelId: 'test', from: { id: 'testuser' }, conversation: { id: 'conv' } };

class BotStateMock {
    constructor(state) {
        this.state = state || {};
        this.assertForce = false;
        this.readCalled = false;
        this.writeCalled = false;
    }
    load(context, force) {
        assert(context, `BotStateMock.load() not passed context.`);
        if (this.assertForce) assert(force, `BotStateMock.load(): force not set.`);
        this.readCalled = true;
        return new Promise((resolve, reject) => {
            setTimeout(() => resolve(this.state), Math.random() * 50);
        });
    }

    saveChanges(context, force) {
        assert(context, `BotStateMock.saveChanges() not passed context.`);
        if (this.assertForce) assert(force, `BotStateMock.saveChanges(): force not set.`);
        this.writeCalled = true;
        return new Promise((resolve, reject) => {
            setTimeout(() => resolve(), Math.random() * 50);
        });
    }
}

describe(`BotStateSet`, function () {
    this.timeout(5000);

    const adapter = new TestAdapter();
    const turnContext = new TurnContext(adapter, receivedMessage);

    it(`should use() and call readAll() on a single BotState plugin.`, async function () {
        const memoryStorage = new MemoryStorage();
        const userState = new UserState(memoryStorage);
        const convState = new ConversationState(memoryStorage);

        let botStateSet = new BotStateSet(userState)
            .add(convState);
        assert.equal(botStateSet.botStates.length, 2);
    });

    it(`BotStateSet_LoadSave`, async function () {
        const memoryStorage = new MemoryStorage();

        {
            const userState = new UserState(memoryStorage);
            const convState = new ConversationState(memoryStorage);
            let botStateSet = new BotStateSet(userState, convState);

            let userProperty = userState.createProperty("userCount");
            let convProperty = convState.createProperty("convCount");

            assert.equal(botStateSet.botStates.length, 2);

            let userCount = await userProperty.get(turnContext, 0);
            assert.equal(userCount, 0);
            let convCount = await convProperty.get(turnContext, 0);
            assert.equal(convCount, 0);

            await userProperty.set(turnContext, 10);
            await convProperty.set(turnContext, 20);

            await botStateSet.saveAllChanges(turnContext);
        }

        {
            const userState = new UserState(memoryStorage);
            const convState = new ConversationState(memoryStorage);
            let botStateSet = new BotStateSet(userState, convState);

            let userProperty = userState.createProperty("userCount");
            let convProperty = convState.createProperty("convCount");

            assert.equal(botStateSet.botStates.length, 2);

            await botStateSet.loadAll(turnContext);

            let userCount = await userProperty.get(turnContext, 0);
            assert.equal(userCount, 10);
            let convCount = await convProperty.get(turnContext, 0);
            assert.equal(convCount, 20);
        }

    });
});
