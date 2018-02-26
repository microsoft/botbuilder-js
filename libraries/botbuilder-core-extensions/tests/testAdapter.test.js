const assert = require('assert');
const { ActivityTypes } = require('botbuilder-core');
const { TestAdapter } = require('../');

const receivedMessage = { text: 'received', type: 'message' };
const updatedActivity = { text: 'update', type: 'message' };
const deletedActivityId = '1234';

describe(`TestAdapter`, function () {
    this.timeout(5000);

    it(`should call bot logic when receiveActivity() is called.`, function (done) {
        const adapter = new TestAdapter((context) => {
            assert(context, `context not passed to bot logic.`);
            assert(context.request, `request not passed through.`);
            assert(context.request.type === ActivityTypes.Message, `wrong type.`);
            assert(context.request.text === 'test', `wrong text.`);
            assert(context.request.id, `missing id.`);
            assert(context.request.from, `missing from.`);
            assert(context.request.recipient, `missing recipient.`);
            assert(context.request.conversation, `missing conversation.`);
            assert(context.request.channelId, `missing channelId.`);
            assert(context.request.serviceUrl, `missing serviceUrl.`);
            done();
        });
        adapter.receiveActivity('test');
    });

    it(`should call bot logic when send() is called.`, function (done) {
        const adapter = new TestAdapter((context) => {
            done();
        }).send('test');
    });

    it(`should return a message to assertReply().`, function (done) {
        const adapter = new TestAdapter((context) => {
            return context.sendActivities([receivedMessage]);
        });
        adapter.send('test')
        .assertReply('received')
        .then(() => done());
    });

    it(`should send and receive when test() is called.`, function (done) {
        const adapter = new TestAdapter((context) => {
            return context.sendActivities([receivedMessage]);
        });
        adapter.test('test', 'received')
        .then(() => done());
    });

    it(`should support multiple calls to test().`, function (done) {
        let count = 0;
        const adapter = new TestAdapter((context) => {
            count++;
            return context.sendActivities([receivedMessage]);
        });
        adapter.test('test', 'received')
        .test('test', 'received')
        .test('test', 'received')
        .test('test', 'received')
        .test('test', 'received')
        .then(() => {
            assert(count == 5, `incorrect count of "${count}".`);
            done();
        });
    });

    it(`should support context.updateActivity() calls.`, function (done) {
        const adapter = new TestAdapter((context) => {
            return context.updateActivity(updatedActivity)
                .then(() => context.sendActivities([receivedMessage]));
        });
        adapter.test('test', 'received')
        .then(() => {
            assert(adapter.updatedActivities.length === 1, `no activities updated.`);
            assert(adapter.updatedActivities[0].text === updatedActivity.text, `invalid update activity.`);
            done();
        });
    });

    it(`should support context.deleteActivity() calls.`, function (done) {
        const adapter = new TestAdapter((context) => {
            return context.deleteActivity(deletedActivityId)
                .then(() => context.sendActivities([receivedMessage]));
        });
        adapter.test('test', 'received')
        .then(() => {
            assert(adapter.deletedActivities.length === 1, `no activities deleted.`);
            assert(adapter.deletedActivities[0] === deletedActivityId, `invalid deleted activity id.`);
            done();
        });
    });
});