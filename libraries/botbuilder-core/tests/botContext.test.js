const assert = require('assert');
const { BotAdapter, BotContext } = require('../');

const testMessage = {
    type: 'message', 
    id: '1234',
    text: 'test',
    from: { id: 'user', name: 'User Name' },
    recipient: { id: 'bot', name: 'Bot Name' },
    conversation: { id: 'convo', name: 'Convo Name' },
    channelId: 'UnitTest',
    serviceUrl: 'https://example.org'
};

class SimpleAdapter extends BotAdapter {
    sendActivity(activities) {
        const responses = [];
        assert(activities, `SimpleAdapter.sendActivity: missing activities.`);
        assert(Array.isArray(activities), `SimpleAdapter.sendActivity: activities not array.`);
        assert(activities.length > 0, `SimpleAdapter.sendActivity: empty activities array.`);
        activities.forEach((a, i) => {
            assert(typeof a === 'object', `SimpleAdapter.sendActivity: activity[${i}] not an object.`);
            assert(typeof a.type === 'string', `SimpleAdapter.sendActivity: activity[${i}].type missing or invalid.`);
            responses.push({ id: '5678' });
        });
        return Promise.resolve(responses);
    }

    updateActivity(activity) {
        assert(activity, `SimpleAdapter.updateActivity: missing activity.`);
        return Promise.resolve();
    }

    deleteActivity(reference) {
        assert(reference, `SimpleAdapter.deleteActivity: missing reference.`);
        assert(reference.activityId === '1234', `SimpleAdapter.deleteActivity: invalid activityId of "${reference.activityId}".`);
        return Promise.resolve();
    }
}

describe(`BotContext`, function () {
    this.timeout(5000);

    const context = new BotContext(new SimpleAdapter(), testMessage);
    it(`should have adapter.`, function (done) {
        assert(context.adapter, `missing property.`);
        assert(context.adapter.deleteActivity, `invalid property.`);
        done();
    });

    it(`should have request.`, function (done) {
        assert(context.request, `missing property.`);
        assert(context.request.type === 'message', `invalid property.`);
        done();
    });

    it(`should clone a passed in context.`, function (done) {
        const ctx = new BotContext(context);
        assert(ctx._adapter === context._adapter, `_adapter not cloned.`);
        assert(ctx._request === context._request, `_request not cloned.`);
        assert(ctx._cache === context._cache, `_cache not cloned.`);
        assert(ctx._onDeleteActivity === context._onDeleteActivity, `_onDeleteActivity not cloned.`);
        assert(ctx._onSendActivity === context._onSendActivity, `_onSendActivity not cloned.`);
        assert(ctx._onUpdateActivity === context._onUpdateActivity, `_onUpdateActivity not cloned.`);
        assert(ctx._respondedRef === context._respondedRef, `_respondedRef not cloned.`);
        done();
    });

    it(`responded should start as 'false'.`, function (done) {
        assert(context.responded === false, `invalid value.`);
        done();
    });

    it(`should set responded.`, function (done) {
        const ctx = new BotContext(new SimpleAdapter(), testMessage);
        ctx.responded = true;
        assert(ctx.responded === true, `responded not set.`);
        done();
    });
    
    it(`should throw if you set responded to false.`, function (done) {
        try {
            const ctx = new BotContext(new SimpleAdapter(), testMessage);
            ctx.responded = true;
            ctx.responded = false;
            assert(false, `responded didn't throw when set to false.`);
        } catch (err) {
            done();
        }
    });

    it(`should cache a value using set() and get().`, function (done) {
        assert(context.get('foo') === undefined, `invalid initial state.`);
        context.set('foo', 'bar');
        assert(context.get('foo') === 'bar', `invalid value of "${context.get('foo')}" after set().`);
        done();
    });

    it(`should inspect a value using has().`, function (done) {
        assert(!context.has('bar'), `invalid initial state for has().`);
        context.set('bar', 'foo');
        assert(context.has('bar'), `invalid initial state for has() after set().`);
        context.set('bar', undefined);
        assert(context.has('bar'), `invalid initial state for has() after set(undefined).`);
        done();
    });

    it(`should be able to use a Symbol with set(), get(), and has().`, function (done) {
        const key = Symbol('foo');
        assert(!context.has(key), `invalid initial state for has().`);
        context.set(key, 'bar');
        assert(context.get(key) === 'bar', `invalid value of "${context.get(key)}" after set().`);
        context.set(key, undefined);
        assert(context.has(key), `invalid initial state for has() after set(undefined).`);
        done();
    });

    it(`should sendActivity() and set responded.`, function (done) {
        assert(context.responded === false, `invalid initial state for context.responded.`);        
        context.sendActivity(testMessage).then((responses) => {
            assert(Array.isArray(responses), `responses isn't an array.`);
            assert(responses.length === 1, `empty or invalid responses array returned.`);
            assert(responses[0].id === '5678', `invalid response id of "${responses[0].id}" sent back.`);
            assert(context.responded === true, `context.responded not set after send.`);        
            done();
        });
    });

    it(`should send a text message via sendActivity().`, function (done) {
        context.sendActivity('test').then((responses) => {
            assert(Array.isArray(responses), `responses isn't an array.`);
            assert(responses.length === 1, `empty or invalid responses array returned.`);
            assert(responses[0].id === '5678', `invalid response id of "${responses[0].id}" sent back.`);
            done();
        });
    });

    it(`should send multiple activities via sendActivity().`, function (done) {
        context.sendActivity('foo', testMessage, 'bar').then((responses) => {
            assert(Array.isArray(responses), `responses isn't an array.`);
            assert(responses.length > 0, `empty responses array returned.`);
            assert(responses.length === 3, `invalid responses array length of "${responses.length}" returned.`);
            assert(responses[0].id === '5678', `invalid response id of "${responses[0].id}" sent back.`);
            done();
        });
    });
    
    it(`should call onSendActivity() hook before delivery.`, function (done) {
        let count = 0;
        context.onSendActivity((ctx, activities, next) => {
            assert(ctx, `context not passed to hook`);
            assert(activities, `activity not passed to hook`);
            count = activities.length;
            return next();
        });
        context.sendActivity(testMessage).then((responses) => {
            assert(count === 1, `send hook not called.`);        
            done();
        });
    });

    it(`should allow interception of delivery in onSendActivity() hook.`, function (done) {
        context.onSendActivity((ctx, activities, next) => {
            return [];
        });
        context.sendActivity(testMessage).then((responses) => {
            assert(responses.length === 0, `call not intercepted.`);        
            done();
        });
    });
    
    it(`should call onUpdateActivity() hook before update.`, function (done) {
        let called = false;
        context.onUpdateActivity((ctx, activity, next) => {
            assert(ctx, `context not passed to hook`);
            assert(activity, `activity not passed to hook`);
            called = true;
            return next();
        });
        context.updateActivity(testMessage).then((responses) => {
            assert(called, `update hook not called.`);        
            done();
        });
    });

    it(`should call onDeleteActivity() hook before delete by "id".`, function (done) {
        let called = false;
        context.onDeleteActivity((ctx, reference, next) => {
            assert(ctx, `context not passed to hook`);
            assert(reference, `missing reference`);
            assert(reference.activityId === '1234', `invalid activityId passed to hook`);
            called = true;
            return next();
        });
        context.deleteActivity('1234').then((responses) => {
            assert(called, `delete hook not called.`);        
            done();
        });
    });

    it(`should call onDeleteActivity() hook before delete by "reference".`, function (done) {
        let called = false;
        context.onDeleteActivity((ctx, reference, next) => {
            assert(reference, `missing reference`);
            assert(reference.activityId === '1234', `invalid activityId passed to hook`);
            called = true;
            return next();
        });
        context.deleteActivity({ activityId: '1234' }).then((responses) => {
            assert(called, `delete hook not called.`);        
            done();
        });
    });
    
    it(`should map an exception raised by a hook to a rejection.`, function (done) {
        let called = false;
        context.onDeleteActivity((ctx, reference, next) => {
            throw new Error('failed');
        });
        context.deleteActivity('1234')
            .then((responses) => {
                assert(false, `exception swallowed.`);        
            })
            .catch((err) => {
                assert(err, `invalid exception returned.`);        
                done();
            });
    });

    it(`should round trip a conversation reference using getConversationReference() and applyConversationRefernce().`, function (done) {
        // Convert to reference
        const reference = BotContext.getConversationReference(testMessage);
        assert(reference.activityId, `reference missing activityId.`);
        assert(reference.bot, `reference missing bot.`);
        assert(reference.bot.id === testMessage.recipient.id, `reference bot.id doesn't match recipient.id.`);
        assert(reference.channelId, `reference missing channelId.`);
        assert(reference.conversation, `reference missing conversation.`);
        assert(reference.serviceUrl, `reference missing serviceUrl.`);
        assert(reference.user, `reference missing user.`);
        assert(reference.user.id === testMessage.from.id, `reference user.id doesn't match from.id.`);
        
        // Round trip back to outgoing activity
        const activity = BotContext.applyConversationReference({ text: 'foo', type: 'message' }, reference);
        assert(activity.text, `activity missing text`);
        assert(activity.type, `activity missing type`);
        assert(activity.replyToId, `activity missing replyToId`);
        assert(activity.from, `activity missing from`);
        assert(activity.from.id === reference.bot.id, `activity from.id doesn't match bot.id`);
        assert(activity.channelId, `activity missing channelId`);
        assert(activity.conversation, `activity missing conversation`);
        assert(activity.serviceUrl, `activity missing serviceUrl`);
        assert(activity.recipient, `activity missing recipient`);
        assert(activity.recipient.id === reference.user.id, `activity recipient.id doesn't match user.id`);

        // Round trip back to incoming activity
        const activity2 = BotContext.applyConversationReference({ text: 'foo', type: 'message' }, reference, true);
        assert(activity2.id, `activity2 missing id`);
        assert(activity2.from, `activity2 missing from`);
        assert(activity2.from.id === reference.user.id, `activity2 from.id doesn't match user.id`);
        assert(activity2.recipient, `activity2 missing recipient`);
        assert(activity2.recipient.id === reference.bot.id, `activity2 recipient.id doesn't match bot.id`);
        
        // Round trip outgoing activity without a replyToId
        delete reference.activityId;
        const activity3 = BotContext.applyConversationReference({ text: 'foo', type: 'message' }, reference);
        assert(!activity3.hasOwnProperty('replyToId'), `activity3 has replyToId`);

        // Round trip incoming activity without an id
        delete reference.activityId;
        const activity4 = BotContext.applyConversationReference({ text: 'foo', type: 'message' }, reference, true);
        assert(!activity4.hasOwnProperty('id'), `activity4 has id`);
        done();
    });
});