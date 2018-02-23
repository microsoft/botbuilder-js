const assert = require('assert');
const { ActivityTypes } = require('botbuilder-core');
const { TestAdapter } = require('../');

const receivedMessage = { text: 'received', type: 'message' };

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
        }).receiveActivity('test');
    });

    it(`should call bot logic when send() is called.`, function (done) {
        const adapter = new TestAdapter((context) => {
            done();
        }).send('test');
    });

    it(`should return a message to assertReply().`, function (done) {
        const adapter = new TestAdapter((context) => {
            return context.sendActivities([receivedMessage]);
        })
        .send('test')
        .assertReply('received')
        .then(() => done());
    });
});