const assert = require('assert');
const { BotState, MemoryStorage, TestAdapter } = require('../');

const storageKey = 'stateKey';

describe(`BotStatePropertyAccessor`, function () {
    this.timeout(5000);

    const storage = new MemoryStorage();
    const adapter = new TestAdapter();
    const middleware = new BotState(storage, (context) => {
        assert(context, `context not passed into storage stateKey factory.`);
        return storageKey;
    });
    it(`should use default value when a default value is assigned.`, function (done) {
        const USER_COUNT = 'userCount';
        const userProperty = middleware.createProperty(USER_COUNT, 100);

        const tAdapter = new TestAdapter(async (context) => {
            let userCount = await userProperty.get(context);
            assert(userCount === 100, `default value for PropertyAccessor was not used.`);
        });
        tAdapter.use(middleware);

        tAdapter.receiveActivity(`Hello world!`);
        done();
    });

    it(`should return undefined when default value is not assigned.`, function (done) {
        const NO_DEFAULT_VALUE = 'noValue';
        const testProperty = middleware.createProperty(NO_DEFAULT_VALUE);

        const tAdapter = new TestAdapter(async (context) => {
            let testValue = await testProperty.get(context);
            assert(testValue === undefined, `PropertyAccessor's value was not undefined.`);
        });
        tAdapter.use(middleware);

        tAdapter.receiveActivity(`Hello world!`);
        done();
    });

    it(`should save changes to registered Property multiple times.`, function (done) {
        const MESSAGE_COUNT = 'messageCount';
        const messageProperty = middleware.createProperty(MESSAGE_COUNT, 0);
        
        const tAdapter = new TestAdapter(async (context) => {
            let messageCount = await messageProperty.get(context);
            messageCount++;
            await messageProperty.set(context, messageCount);
            await context.sendActivity(messageCount.toString());
        });
        tAdapter.use(middleware);

        tAdapter.test(`Hello world!`, `1`, `messageCount was not incremented.`)
            .test(`Hello world!`, `2`, `messageCount was not properly saved.`);
            done();
    });

    it(`should delete property value on state.`, function (done) {
        const BOOLEAN_PROPERTY = 'booleanProperty';
        const booleanProperty = middleware.createProperty(BOOLEAN_PROPERTY);
        
        const tAdapter = new TestAdapter(async (context) => {
            // Retrieve the property value, change it to true, then set it in state.
            let booleanValue = await booleanProperty.get(context);
            booleanValue = true;
            await booleanProperty.set(context, booleanValue);

            // Retrieve the property value which should be true.
            let retrievedValue = await booleanProperty.get(context);
            assert(booleanValue, `value for PropertyAccessor was not properly saved.`);

            // Delete the value from state, and verify that the value is now undefined.
            await booleanProperty.delete(context);
            let noPropertyValue = await booleanProperty.get(context);
            assert(noPropertyValue === undefined, `value for PropertyAccessor was not properly deleted.`);
            done();
        });
        tAdapter.use(middleware);
        tAdapter.receiveActivity(`Hello world!`);
    });
});