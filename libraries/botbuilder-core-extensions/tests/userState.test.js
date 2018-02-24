const assert = require('assert');
const { TurnContext } = require('botbuilder-core');
const { UserState, MemoryStorage, TestAdapter } = require('../');

const receivedMessage = { text: 'received', type: 'message', channelId: 'test', from: { id: 'user' } };

describe(`UserState`, function () {
    this.timeout(5000);

    const storage = new MemoryStorage();
    const context = new TurnContext(new TestAdapter(), receivedMessage);
    const middleware = new UserState(storage);
    it(`should load and save state from storage.`, function (done) {
        let key;
        middleware.onProcessRequest(context, () => {
            key = UserState.key(context);
            const state = UserState.get(context);
            assert(state, `State not loaded`);
            assert(key, `Key not found`);
            state.test = 'foo';
        })
        .then(() => storage.read([key]))
        .then((items) => {
            assert(items.hasOwnProperty(key), `Saved state not found in storage.`);
            assert(items[key].test === 'foo', `Missing test value in stored state.`);
            done();
        });
    });

    it(`should force read() of state from storage.`, function (done) {
        let key;
        middleware.onProcessRequest(context, () => {
            key = UserState.key(context);
            assert(UserState.get(context).test === 'foo', `invalid initial state`);
            delete UserState.get(context).test === 'foo';
            return middleware.read(context, true).then(() => {
                assert(UserState.get(context).test === 'foo', `state not reloaded`);
            });
        }).then(() => done());
    });
    
    it(`should clear() state storage.`, function (done) {
        let key;
        middleware.onProcessRequest(context, () => {
            key = UserState.key(context);
            assert(UserState.get(context).test === 'foo', `invalid initial state`);
            middleware.clear(context);
            assert(!UserState.get(context).hasOwnProperty('test'), `state not cleared on context.`);
        })
        .then(() => storage.read([key]))
        .then((items) => {
            assert(!items[key].hasOwnProperty('test'), `state not cleared from storage.`);
            done();
        });
    });
});
