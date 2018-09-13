const assert = require('assert');
const { TurnContext, BotState, MemoryStorage, TestAdapter } = require('../');

const receivedMessage = { text: 'received', type: 'message' };
const storageKey = 'stateKey';

function cachedState(context, stateKey) {
    const cached = context.turnState.get(stateKey);
    return cached ? cached.state : undefined;
}

describe(`BotState`, function () {
    this.timeout(5000);

    const storage = new MemoryStorage();
    const adapter = new TestAdapter();
    const context = new TurnContext(adapter, receivedMessage);
    const botState = new BotState(storage, (context) => {
        assert(context, `context not passed into storage stateKey factory.`);
        return storageKey;
    });
    it(`should return undefined from get() if nothing cached.`, function (done) {
        const state = botState.get(context);
        assert(state === undefined, `state returned.`);
        done();
    });

    it(`should load and save state from storage.`, async function () {
        await botState.load(context);
        let state = cachedState(context, botState.stateKey);
        assert(state, `State not loaded`);
        state.test = 'foo';
        await botState.saveChanges(context);
        
        const items = await storage.read([storageKey]);
        assert(items.hasOwnProperty(storageKey), `Saved state not found in storage.`);
        assert(items[storageKey].test === 'foo', `Missing test value in stored state.`);        
    });

    it(`should force load() of state from storage.`, function (done) {
        botState.load(context, () => {
            const state = cachedState(context, botState.stateKey);
            assert(state.test === 'foo', `invalid initial state`);
            delete state.test === 'foo';
            return botState.load(context, true).then(() => {
                assert(cachedState(context, botState.stateKey).test === 'foo', `state not reloaded`);
            });
        }).then(() => done());
    });

    it(`should clear() state storage.`, async function () {
        await botState.load(context);
        assert(cachedState(context, botState.stateKey).test === 'foo', `invalid initial state`);
        await botState.clear(context);
        await botState.saveChanges(context);
        assert(!cachedState(context, botState.stateKey).hasOwnProperty('test'), `state not cleared on context.`);

        const items = await storage.read([storageKey]);
        assert(!items[storageKey].hasOwnProperty('test'), `state not cleared from storage.`);        
    });

    it(`should force immediate saveChanges() of state to storage.`, function (done) {
        botState.load(context).then(() => {
            const state = cachedState(context, botState.stateKey);
            assert(!state.hasOwnProperty('foo'), `invalid initial state`);
            state.test = 'foo';
            return botState.saveChanges(context, true)
                .then(() => storage.read([storageKey]))
                .then((items) => {
                    assert(items[storageKey].test === 'foo', `state not immediately flushed.`);
                });
        }).then(() => done());
    });

    it(`should load() from storage if cached state missing.`, function (done) {
        context.turnState.set(botState.stateKey, undefined);
        botState.load(context).then((state) => {
            assert(state.test === 'foo', `state not loaded.`);
            done();
        });
    });

    it(`should load() from storage if cached.state missing.`, function (done) {
        context.turnState.set(botState.stateKey, {});
        botState.load(context).then((state) => {
            assert(state.test === 'foo', `state not loaded.`);
            done();
        });
    });

    it(`should load() from cache.`, function (done) {
        botState.load(context).then((state) => {
            assert(state.test === 'foo', `state not loaded.`);
            done();
        });
    });

    it(`should force saveChanges() to storage of an empty state object.`, function (done) {
        context.turnState.set(botState.stateKey, undefined);
        botState.saveChanges(context, true).then(() => done());
    });

    it(`should no-op calls to clear() when nothing cached.`, function (done) {
        context.turnState.set(botState.stateKey, undefined);
        botState.clear(context);
        done();
    });

    it(`should create new PropertyAccessors`, function (done) {
        let count = botState.createProperty('count', 1);
        assert(count !== undefined, `did not successfully create PropertyAccessor.`);
        done();
    });

    it(`should not allow registering of PropertyAccessors with the same name`, function (done) {
        const duplicateName = 'test';
        let testA = botState.createProperty(duplicateName, 0);
        try {
            let testB = botState.createProperty(duplicateName, 0);
        } catch (e) {
            // Checking the error message because JavaScript does not have specific Error types like Python, e.g. ValueError.
            // This message check verifies that the bot threw the correct error, and that not something else is breaking.
            assert(e.message === `BotState.createProperty(): a property named '${duplicateName}' already exists.`, `another error was thrown: "${e.message}".`);
            done();
        }
        throw new Error(`Should have raised a duplicate property name error.`);
        done();
    });
});
