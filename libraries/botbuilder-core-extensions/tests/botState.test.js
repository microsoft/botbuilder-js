const assert = require('assert');
const { BotContext, ActivityTypes } = require('botbuilder-core');
const { BotState, MemoryStorage, TestAdapter } = require('../');

const receivedMessage = { text: 'received', type: 'message' };
const cacheKey = 'cacheKey';
const storageKey = 'stateKey';

function cachedState(context) {
    const cached = context.get(cacheKey);
    return cached ? cached.state : undefined;
}

describe(`BotState`, function () {
    this.timeout(5000);

    const storage = new MemoryStorage();
    const adapter = new TestAdapter();
    const context = new BotContext(adapter, receivedMessage);
    const middleware = new BotState(storage, cacheKey, (context) => {
        assert(context, `context not passed into storage stateKey factory.`);
        return storageKey;
    });
    it(`should load and save state from storage.`, function (done) {
        middleware.onProcessRequest(context, () => {
            const state = cachedState(context);
            assert(state, `State not loaded`);
            state.test = 'foo';
        })
        .then(() => storage.read([storageKey]))
        .then((items) => {
            assert(items.hasOwnProperty(storageKey), `Saved state not found in storage.`);
            assert(items[storageKey].test === 'foo', `Missing test value in stored state.`);
            done();
        });
    });

    it(`should force read() of state from storage.`, function (done) {
        middleware.onProcessRequest(context, () => {
            assert(cachedState(context).test === 'foo', `invalid initial state`);
            delete cachedState(context).test === 'foo';
            return middleware.read(context, true).then(() => {
                assert(cachedState(context).test === 'foo', `state not reloaded`);
            });
        }).then(() => done());
    });
    
    it(`should clear() state storage.`, function (done) {
        middleware.onProcessRequest(context, () => {
            assert(cachedState(context).test === 'foo', `invalid initial state`);
            middleware.clear(context);
            assert(!cachedState(context).hasOwnProperty('test'), `state not cleared on context.`);
        })
        .then(() => storage.read([storageKey]))
        .then((items) => {
            assert(!items[storageKey].hasOwnProperty('test'), `state not cleared from storage.`);
            done();
        });
    });

    it(`should force immediate write() of state to storage.`, function (done) {
        middleware.onProcessRequest(context, () => {
            assert(!cachedState(context).hasOwnProperty('foo'), `invalid initial state`);
            cachedState(context).test = 'foo';
            return middleware.write(context, true)
                .then(() => storage.read([storageKey]))
                .then((items) => {
                    assert(items[storageKey].test === 'foo', `state not immediately flushed.`);
                });
        }).then(() => done());
    });

    it(`should read() from storage if cached state missing.`, function (done) {
        context.set(cacheKey, undefined);
        middleware.read(context).then((state) => {
            assert(state.test === 'foo', `state not loaded.`);
            done();
        });
    });

    it(`should read() from storage if cached.state missing.`, function (done) {
        context.set(cacheKey, {});
        middleware.read(context).then((state) => {
            assert(state.test === 'foo', `state not loaded.`);
            done();
        });
    });

    it(`should read() from cache.`, function (done) {
        middleware.read(context).then((state) => {
            assert(state.test === 'foo', `state not loaded.`);
            done();
        });
    });

    it(`should force write() to storage of an empty state object.`, function (done) {
        context.set(cacheKey, undefined);
        middleware.write(context, true).then(() => done());
    });

    it(`should no-op calls to clear() when nothing cached.`, function (done) {
        context.set(cacheKey, undefined);
        middleware.clear(context);
        done();
    });
});
