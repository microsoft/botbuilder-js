const assert = require('assert');
const { TurnContext, ActivityTypes, PrivateConversationState, MemoryStorage, TestAdapter } = require('../');

const receivedMessage = { text: 'received', type: 'message', channelId: 'test', conversation: { id: 'convo' }, from: { id: 'user' }  };
const missingChannelId = { text: 'received', type: 'message', conversation: { id: 'convo' }, from: { id: 'user' }  };
const missingConversation = { text: 'received', type: 'message', channelId: 'test', from: { id: 'user' }  };
const missingFrom = { text: 'received', type: 'message', channelId: 'test', conversation: { id: 'convo' },};
const endOfConversation = { type: 'endOfConversation', channelId: 'test', conversation: { id: 'convo' } };

describe(`PrivateConversationState`, function () {
    this.timeout(5000);

    const storage = new MemoryStorage();
    const adapter = new TestAdapter();
    const context = new TurnContext(adapter, receivedMessage);
    const middleware = new PrivateConversationState(storage);
    it(`should load and save state from storage.`, function (done) {
        let key;
        middleware.onTurn(context, () => {
            key = middleware.getStorageKey(context);
            const state = middleware.get(context);
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

    it(`should ignore any activities that aren't "endOfConversation".`, function (done) {
        let key;
        middleware.onTurn(context, () => {
            key = middleware.getStorageKey(context);
            assert(middleware.get(context).test === 'foo', `invalid initial state`);
            return context.sendActivity({ type: ActivityTypes.Message, text: 'foo' });
        })
        .then(() => storage.read([key]))
        .then((items) => {
            assert(items[key].hasOwnProperty('test'), `state cleared and shouldn't have been.`);
            done();
        });
    });

    it(`should reject with error if channelId missing.`, function (done) {
        const ctx = new TurnContext(adapter, missingChannelId);
        middleware.onTurn(ctx, () => {
            assert(false, `shouldn't have called next.`);
        })
        .then(() => {
            assert(false, `shouldn't have completed.`);
        })
        .catch((err) => {
            assert(err, `error object missing.`);
            done();
        });
    });

    it(`should reject with error if conversation missing.`, function (done) {
        const ctx = new TurnContext(adapter, missingConversation);
        middleware.onTurn(ctx, () => {
            assert(false, `shouldn't have called next.`);
        })
        .then(() => {
            assert(false, `shouldn't have completed.`);
        })
        .catch((err) => {
            assert(err, `error object missing.`);
            done();
        });
    });

    it(`should reject with error if from missing.`, function (done) {
        const ctx = new TurnContext(adapter, missingFrom);
        middleware.onTurn(ctx, () => {
            assert(false, `shouldn't have called next.`);
        })
        .then(() => {
            assert(false, `shouldn't have completed.`);
        })
        .catch((err) => {
            assert(err, `error object missing.`);
            done();
        });
    });

    it(`should throw install exception if get() called without a cached entry.`, function (done) {
        context.turnState.set('privateConversationState', undefined);
        try {
            middleware.get(context);
            assert(false, `exception not thrown.`);
        } catch (err) {
            done();
        }
    });
});
