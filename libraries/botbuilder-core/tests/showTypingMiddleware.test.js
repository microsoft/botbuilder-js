const assert = require('assert');
const { ActivityTypes, ShowTypingMiddleware, TestAdapter } = require('../lib');

const receivedMessage = { text: 'received', type: 'message' };

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}


describe(`ShowTypingMiddleware`, function () {
    this.timeout(10000);

    var adapter = new TestAdapter(async (context) => {
        await sleep(600);
        await context.sendActivity(`echo:${context.activity.text}`);
    }).use(new ShowTypingMiddleware());

    it('should automatically send a typing indicator', function(done) {
        adapter
            .send('foo')
            .assertReply(activity => assert.equal(activity.type, ActivityTypes.Typing))
            .assertReply('echo:foo')
            .send('bar')
            .assertReply(activity => assert.equal(activity.type, ActivityTypes.Typing))
            .assertReply('echo:bar')
            .then(done);
    });

    var adapter2 = new TestAdapter(async (context) => {
        await context.sendActivity(`echo:${context.activity.text}`);
    });

    it('should NOT automatically send a typing indicator if middleware not applied', function(done) {
        adapter2
            .send('foo')
            .assertReply('echo:foo')
            .then(done);
    });

    it('should not immediately respond with a message (rather get a typing indicator)', function(done) {
        adapter
            .send('foo')
            .assertReply(activity => assert.notEqual(activity.type, ActivityTypes.Message))
            .then(done);
    });

    it('should immediately respond with a message (rather get a typing indicator) if middleware not applied', function(done) {
        adapter2
            .send('foo')
            .assertReply(activity => assert.equal(activity.type, ActivityTypes.Message))
            .then(done);
    });


});
