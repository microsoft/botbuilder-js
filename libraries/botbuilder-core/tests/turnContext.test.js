const assert = require('assert');
const { BotAdapter, TurnContext } = require('../');

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

const testTraceMessage = {
    type: 'trace', 
    name: 'TestTrace',
    valueType: 'https://example.org/test/trace',
    label: 'Test Trace'
};

class SimpleAdapter extends BotAdapter {
    sendActivities(context, activities) {
        const responses = [];
        assert(context, `SimpleAdapter.sendActivities: missing context.`);
        assert(activities, `SimpleAdapter.sendActivities: missing activities.`);
        assert(Array.isArray(activities), `SimpleAdapter.sendActivities: activities not array.`);
        assert(activities.length > 0, `SimpleAdapter.sendActivities: empty activities array.`);
        activities.forEach((a, i) => {
            assert(typeof a === 'object', `SimpleAdapter.sendActivities: activity[${i}] not an object.`);
            assert(typeof a.type === 'string', `SimpleAdapter.sendActivities: activity[${i}].type missing or invalid.`);
            responses.push({ id: '5678' });
        });
        return Promise.resolve(responses);
    }

    updateActivity(context, activity) {
        assert(context, `SimpleAdapter.updateActivity: missing context.`);
        assert(activity, `SimpleAdapter.updateActivity: missing activity.`);
        return Promise.resolve();
    }

    deleteActivity(context, reference) {
        assert(context, `SimpleAdapter.deleteActivity: missing context.`);
        assert(reference, `SimpleAdapter.deleteActivity: missing reference.`);
        assert(reference.activityId === '1234', `SimpleAdapter.deleteActivity: invalid activityId of "${reference.activityId}".`);
        return Promise.resolve();
    }
}

describe(`TurnContext`, function () {
    this.timeout(5000);

    it(`should have adapter.`, function (done) {
        const context = new TurnContext(new SimpleAdapter(), testMessage);
        assert(context.adapter, `missing property.`);
        assert(context.adapter.deleteActivity, `invalid property.`);
        done();
    });

    it(`should have activity.`, function (done) {
        const context = new TurnContext(new SimpleAdapter(), testMessage);
        assert(context.activity, `missing property.`);
        assert(context.activity.type === 'message', `invalid property.`);
        done();
    });

    it(`should clone a passed in context.`, function (done) {
        const context = new TurnContext(new SimpleAdapter(), testMessage);
        const ctx = new TurnContext(context);
        assert(ctx._adapter === context._adapter, `_adapter not cloned.`);
        assert(ctx._activity === context._activity, `_activity not cloned.`);
        assert(ctx._services === context._services, `_services not cloned.`);
        assert(ctx._onDeleteActivity === context._onDeleteActivity, `_onDeleteActivity not cloned.`);
        assert(ctx._onSendActivities === context._onSendActivities, `_onSendActivities not cloned.`);
        assert(ctx._onUpdateActivity === context._onUpdateActivity, `_onUpdateActivity not cloned.`);
        assert(ctx._respondedRef === context._respondedRef, `_respondedRef not cloned.`);
        done();
    });

    it(`responded should start as 'false'.`, function (done) {
        const context = new TurnContext(new SimpleAdapter(), testMessage);
        assert(context.responded === false, `invalid value.`);
        done();
    });

    it(`should set responded.`, function (done) {
        const context = new TurnContext(new SimpleAdapter(), testMessage);
        context.responded = true;
        assert(context.responded === true, `responded not set.`);
        done();
    });
    
    it(`should throw if you set responded to false.`, function (done) {
        try {
            const context = new TurnContext(new SimpleAdapter(), testMessage);
            context.responded = true;
            context.responded = false;
            assert(false, `responded didn't throw when set to false.`);
        } catch (err) {
            done();
        }
    });

    it(`should cache a value using services.set() and services.get().`, function (done) {
        const context = new TurnContext(new SimpleAdapter(), testMessage);
        assert(context.turnState.get('foo') === undefined, `invalid initial state.`);
        context.turnState.set('foo', 'bar');
        assert(context.turnState.get('foo') === 'bar', `invalid value of "${context.turnState.get('foo')}" after set().`);
        done();
    });

    it(`should inspect a value using has().`, function (done) {
        const context = new TurnContext(new SimpleAdapter(), testMessage);
        assert(!context.turnState.has('bar'), `invalid initial state for has().`);
        context.turnState.set('bar', 'foo');
        assert(context.turnState.has('bar'), `invalid initial state for has() after set().`);
        context.turnState.set('bar', undefined);
        assert(context.turnState.has('bar'), `invalid initial state for has() after set(undefined).`);
        done();
    });

    it(`should be able to use a Symbol with set(), get(), and has().`, function (done) {
        const key = Symbol('foo');
        const context = new TurnContext(new SimpleAdapter(), testMessage);
        assert(!context.turnState.has(key), `invalid initial state for has().`);
        context.turnState.set(key, 'bar');
        assert(context.turnState.get(key) === 'bar', `invalid value of "${context.turnState.get(key)}" after set().`);
        context.turnState.set(key, undefined);
        assert(context.turnState.has(key), `invalid initial state for has() after set(undefined).`);
        done();
    });

    it(`should sendActivity() and set responded.`, function (done) {
        const context = new TurnContext(new SimpleAdapter(), testMessage);
        context.sendActivity(testMessage).then((response) => {
            assert(response, `response is missing.`);
            assert(response.id === '5678', `invalid response id of "${response.id}" sent back.`);
            assert(context.responded === true, `context.responded not set after send.`);        
            done();
        });
    });

    it(`should send a text message via sendActivity().`, function (done) {
        const context = new TurnContext(new SimpleAdapter(), testMessage);
        context.sendActivity('test').then((response) => {
            assert(response, `response is missing.`);
            assert(response.id === '5678', `invalid response id of "${response.id}" sent back.`);
            done();
        });
    });

    it(`should send a text message with speak and inputHint added.`, function (done) {
        const context = new TurnContext(new SimpleAdapter(), testMessage);
        context.onSendActivities((ctx, activities, next) => {
            assert(Array.isArray(activities), `activities not array.`);
            assert(activities.length === 1, `invalid count of activities.`);
            assert(activities[0].text === 'test', `text wrong.`);
            assert(activities[0].speak === 'say test', `speak worng.`);
            assert(activities[0].inputHint === 'ignoringInput', `inputHint wrong.`);
            return[];
        });
        context.sendActivity('test', 'say test', 'ignoringInput').then(() => done());
    });
    
    it(`should send multiple activities via sendActivities().`, function (done) {
        const context = new TurnContext(new SimpleAdapter(), testMessage);
        context.sendActivities([testMessage, testMessage, testMessage]).then((responses) => {
            assert(Array.isArray(responses), `responses isn't an array.`);
            assert(responses.length > 0, `empty responses array returned.`);
            assert(responses.length === 3, `invalid responses array length of "${responses.length}" returned.`);
            assert(responses[0].id === '5678', `invalid response id of "${responses[0].id}" sent back.`);
            done();
        });
    });
    
    it(`should call onSendActivity() hook before delivery.`, function (done) {
        let count = 0;
        const context = new TurnContext(new SimpleAdapter(), testMessage);
        context.onSendActivities((ctx, activities, next) => {
            assert(ctx, `context not passed to hook`);
            assert(activities, `activity not passed to hook`);
            count = activities.length;
            return next();
        });
        context.sendActivity(testMessage).then((response) => {
            assert(count === 1, `send hook not called.`);        
            done();
        });
    });

    it(`should allow interception of delivery in onSendActivity() hook.`, function (done) {
        const context = new TurnContext(new SimpleAdapter(), testMessage);
        context.onSendActivities((ctx, activities, next) => {
            return [];
        });
        context.sendActivity(testMessage).then((response) => {
            assert(response === undefined, `call not intercepted.`);        
            done();
        });
    });
    
    it(`should call onUpdateActivity() hook before update.`, function (done) {
        let called = false;
        const context = new TurnContext(new SimpleAdapter(), testMessage);
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
        const context = new TurnContext(new SimpleAdapter(), testMessage);
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
        const context = new TurnContext(new SimpleAdapter(), testMessage);
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
        const context = new TurnContext(new SimpleAdapter(), testMessage);
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
        const reference = TurnContext.getConversationReference(testMessage);
        assert(reference.activityId, `reference missing activityId.`);
        assert(reference.bot, `reference missing bot.`);
        assert(reference.bot.id === testMessage.recipient.id, `reference bot.id doesn't match recipient.id.`);
        assert(reference.channelId, `reference missing channelId.`);
        assert(reference.conversation, `reference missing conversation.`);
        assert(reference.serviceUrl, `reference missing serviceUrl.`);
        assert(reference.user, `reference missing user.`);
        assert(reference.user.id === testMessage.from.id, `reference user.id doesn't match from.id.`);
        
        // Round trip back to outgoing activity
        const activity = TurnContext.applyConversationReference({ text: 'foo', type: 'message' }, reference);
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
        const activity2 = TurnContext.applyConversationReference({ text: 'foo', type: 'message' }, reference, true);
        assert(activity2.id, `activity2 missing id`);
        assert(activity2.from, `activity2 missing from`);
        assert(activity2.from.id === reference.user.id, `activity2 from.id doesn't match user.id`);
        assert(activity2.recipient, `activity2 missing recipient`);
        assert(activity2.recipient.id === reference.bot.id, `activity2 recipient.id doesn't match bot.id`);
        
        // Round trip outgoing activity without a replyToId
        delete reference.activityId;
        const activity3 = TurnContext.applyConversationReference({ text: 'foo', type: 'message' }, reference);
        assert(!activity3.hasOwnProperty('replyToId'), `activity3 has replyToId`);

        // Round trip incoming activity without an id
        delete reference.activityId;
        const activity4 = TurnContext.applyConversationReference({ text: 'foo', type: 'message' }, reference, true);
        assert(!activity4.hasOwnProperty('id'), `activity4 has id`);
        done();
    });

    it(`should not set TurnContext.responded to true if Trace activity is sent.`, function (done) {
        const context = new TurnContext(new SimpleAdapter(), testMessage);
        context.sendActivities([testTraceMessage]).then((responses) => {
            assert(context.responded === false, `responded was set to true.`);
            done();
        });
    });

    it(`should not set TurnContext.responded to true if multiple Trace activities are sent.`, function (done) {
        const context = new TurnContext(new SimpleAdapter(), testMessage);
        context.sendActivities([testTraceMessage, testTraceMessage]).then((responses) => {
            assert(context.responded === false, `responded was set to true.`);
            done();
        });
    });

    it(`should set TurnContext.responded to true if Trace and message activities are sent.`, function (done) {
        const context = new TurnContext(new SimpleAdapter(), testMessage);
        context.sendActivities([testTraceMessage, testTraceMessage]).then((responses) => {
            assert(context.responded === false, `responded was set to true.`);
        }).then(() => {
            context.sendActivities([testMessage]).then((responses) => {
                assert(context.responded, `responded was not set to true.`);
                done();
            });
        });
    });

    it(`should get a conversation reference from a sent activity using getReplyConversationReference.`, function(done) {

        const context = new TurnContext(new SimpleAdapter(), testMessage);
        context.sendActivity({text: 'test'}).then((reply) => {
            assert(reply.id,'reply has an id');

            const reference = TurnContext.getReplyConversationReference(context.activity, reply);

            assert(reference.activityId,'reference has an activity id');
            assert(reference.activityId === reply.id,'reference id matches outgoing reply id');
            done();
        });
    });

});