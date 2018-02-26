const assert = require('assert');
const { BotContext, ActivityTypes } = require('botbuilder-core');
const { ConversationState, MemoryStorage, TestAdapter } = require('../');

const receivedMessage = { text: 'received', type: 'message', channelId: 'test', conversation: { id: 'convo' } };
const missingChannelId = { text: 'received', type: 'message', conversation: { id: 'convo' } };
const missingConversation = { text: 'received', type: 'message', channelId: 'test' };

describe(`ConversationState`, function () {
    this.timeout(5000);

    const storage = new MemoryStorage();
    const adapter = new TestAdapter();
    const context = new BotContext(adapter, receivedMessage);
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

    it(`should ignore any activities that aren't "endOfConversation".`, function (done) {
        let key;
        middleware.onProcessRequest(context, () => {
            key = ConversationState.key(context);
            assert(ConversationState.get(context).test === 'foo', `invalid initial state`);
            return context.sendActivities({ type: ActivityTypes.Message, text: 'foo' });
        })
        .then(() => storage.read([key]))
        .then((items) => {
            assert(items[key].hasOwnProperty('test'), `state cleared and shouldn't have been.`);
            done();
        });
    });
    
    it(`should automatically clear() state storage when "endOfConversation" activity sent.`, function (done) {
        let key;
        middleware.onProcessRequest(context, () => {
            key = ConversationState.key(context);
            assert(ConversationState.get(context).test === 'foo', `invalid initial state`);
            return context.sendActivities({ type: ActivityTypes.EndOfConversation });
        })
        .then(() => storage.read([key]))
        .then((items) => {
            assert(!items[key].hasOwnProperty('test'), `state not cleared from storage.`);
            done();
        });
    });


    it(`should reject with error if channelId missing.`, function (done) {
        const ctx = new BotContext(adapter, missingChannelId);
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
        const ctx = new BotContext(adapter, missingConversation);
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

    it(`should throw install exception if get() called without a cached entry.`, function (done) {
        context.set('conversationState', undefined);
        try {
            ConversationState.get(context);
            assert(false, `exception not thrown.`);
        } catch (err) {
            done();
        }
    });
});
