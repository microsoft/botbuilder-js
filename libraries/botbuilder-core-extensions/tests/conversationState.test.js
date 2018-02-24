const assert = require('assert');
const { TurnContext, ActivityTypes } = require('botbuilder-core');
const { ConversationState, MemoryStorage, TestAdapter } = require('../');

const receivedMessage = { text: 'received', type: 'message', channelId: 'test', conversation: { id: 'convo' } };
const missingChannelId = { text: 'received', type: 'message', conversation: { id: 'convo' } };
const missingConversation = { text: 'received', type: 'message', channelId: 'test' };

describe(`ConversationState`, function () {
    this.timeout(5000);

    const storage = new MemoryStorage();
    const adapter = new TestAdapter();
    const context = new TurnContext(adapter, receivedMessage);
    const middleware = new ConversationState(storage);
    it(`should load and save state from storage.`, function (done) {
        let key;
        middleware.onProcessRequest(context, () => {
            key = ConversationState.key(context);
            const state = ConversationState.get(context);
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
            key = ConversationState.key(context);
            assert(ConversationState.get(context).test === 'foo', `invalid initial state`);
            delete ConversationState.get(context).test === 'foo';
            return middleware.read(context, true).then(() => {
                assert(ConversationState.get(context).test === 'foo', `state not reloaded`);
            });
        }).then(() => done());
    });
    
    it(`should clear() state storage.`, function (done) {
        let key;
        middleware.onProcessRequest(context, () => {
            key = ConversationState.key(context);
            assert(ConversationState.get(context).test === 'foo', `invalid initial state`);
            middleware.clear(context);
            assert(!ConversationState.get(context).hasOwnProperty('test'), `state not cleared on context.`);
        })
        .then(() => storage.read([key]))
        .then((items) => {
            assert(!items[key].hasOwnProperty('test'), `state not cleared from storage.`);
            done();
        });
    });

    it(`should force immediate write() of state to storage.`, function (done) {
        let key;
        middleware.onProcessRequest(context, () => {
            key = ConversationState.key(context);
            assert(!ConversationState.get(context).hasOwnProperty('foo'), `invalid initial state`);
            ConversationState.get(context).test = 'foo';
            return middleware.write(context, true)
                .then(() => storage.read([key]))
                .then((items) => {
                    assert(items[key].test === 'foo', `state not immediately flushed.`);
                });
        }).then(() => done());
    });
    
    it(`should automatically clear() state storage when "endOfConversation" activity sent.`, function (done) {
        let key;
        middleware.onProcessRequest(context, () => {
            key = ConversationState.key(context);
            assert(ConversationState.get(context).test === 'foo', `invalid initial state`);
            return context.sendActivities([{ type: ActivityTypes.EndOfConversation }]);
        })
        .then(() => storage.read([key]))
        .then((items) => {
            assert(!items[key].hasOwnProperty('test'), `state not cleared from storage.`);
            done();
        });
    });

    it(`should reject with error if channelId missing.`, function (done) {
        const ctx = new TurnContext(adapter, missingChannelId);
        middleware.onProcessRequest(ctx, () => {
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
        middleware.onProcessRequest(ctx, () => {
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
});
