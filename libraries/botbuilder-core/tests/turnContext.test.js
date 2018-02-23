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

class SimpleAdapter extends BotAdapter {
    sendActivities(activities) {
        assert(activities, `SimpleAdapter.sendActivities: missing activities.`);
        assert(Array.isArray(activities), `SimpleAdapter.sendActivities: activities not array.`);
        assert(activities.length > 0, `SimpleAdapter.sendActivities: empty activities array.`);
        return Promise.resolve([{ id: '5678' }]);
    }

    updateActivity(activity) {
        assert(activity, `SimpleAdapter.updateActivity: missing activity.`);
        return Promise.resolve();
    }

    deleteActivity(id) {
        assert(id === '1234', `SimpleAdapter.deleteActivity: invalid id of "${id}".`);
        return Promise.resolve();
    }
}

describe(`turnContext`, function () {
    this.timeout(5000);

    const context = new TurnContext(new SimpleAdapter(), testMessage);
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

    it(`responded should start as 'false'.`, function (done) {
        assert(context.responded === false, `invalid value.`);
        done();
    });

    it(`should set responded.`, function (done) {
        const ctx = new TurnContext(new SimpleAdapter(), testMessage);
        ctx.responded = true;
        assert(ctx.responded === true, `responded not set.`);
        done();
    });
    
    it(`should throw if you set responded to false.`, function (done) {
        try {
            const ctx = new TurnContext(new SimpleAdapter(), testMessage);
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

    it(`should sendActivities() and set responded.`, function (done) {
        assert(context.responded === false, `invalid initial state for context.responded.`);        
        context.sendActivities([testMessage]).then((responses) => {
            assert(Array.isArray(responses), `responses isn't an array.`);
            assert(responses.length > 0, `empty responses array returned.`);
            assert(responses[0].id === '5678', `invalid response id of "${responses[0].id}" sent back.`);
            assert(context.responded === true, `context.responded not set after send.`);        
            done();
        });
    });

    it(`should call onSendActivities() hook before delivery.`, function (done) {
        let count = 0;
        context.onSendActivities((activities, next) => {
            assert(activities, `activity not passed to hook`);
            count = activities.length;
            return next();
        });
        context.sendActivities([testMessage]).then((responses) => {
            assert(count === 1, `send hook not called.`);        
            done();
        });
    });

    it(`should allow interception of delivery in onSendActivities() hook.`, function (done) {
        context.onSendActivities((activities, next) => {
            return [];
        });
        context.sendActivities([testMessage]).then((responses) => {
            assert(responses.length === 0, `call not intercepted.`);        
            done();
        });
    });
    
    it(`should call onUpdateActivity() hook before update.`, function (done) {
        let called = false;
        context.onUpdateActivity((activity, next) => {
            assert(activity, `activity not passed to hook`);
            called = true;
            return next();
        });
        context.updateActivity(testMessage).then((responses) => {
            assert(called, `update hook not called.`);        
            done();
        });
    });

    it(`should call onDeleteActivity() hook before delete.`, function (done) {
        let called = false;
        context.onDeleteActivity((id, next) => {
            assert(id === '1234', `invalid id passed to hook`);
            called = true;
            return next();
        });
        context.deleteActivity('1234').then((responses) => {
            assert(called, `delete hook not called.`);        
            done();
        });
    });
});