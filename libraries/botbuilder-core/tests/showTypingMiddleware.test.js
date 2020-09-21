const assert = require('assert');
const { ActivityTypes, ShowTypingMiddleware, TestAdapter, TestSkillAdapter } = require('../lib');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

describe(`ShowTypingMiddleware`, function () {
    this.timeout(10000);

    const adapter = new TestAdapter(async (context) => {
        await sleep(600);
        await context.sendActivity(`echo:${context.activity.text}`);
    }).use(new ShowTypingMiddleware());

    it('should automatically send a typing indicator', function (done) {
        adapter
            .send('foo')
            .assertReply(activity => assert.strictEqual(activity.type, ActivityTypes.Typing))
            .assertReply('echo:foo')
            .send('bar')
            .assertReply(activity => assert.strictEqual(activity.type, ActivityTypes.Typing))
            .assertReply('echo:bar')
            .then(done);
    });

    const noMiddlewareAdapter = new TestAdapter(async (context) => {
        await context.sendActivity(`echo:${context.activity.text}`);
    });

    it('should NOT automatically send a typing indicator if middleware not applied', function (done) {
        noMiddlewareAdapter
            .send('foo')
            .assertReply('echo:foo')
            .then(done);
    });

    it('should not immediately respond with a message (rather get a typing indicator)', function (done) {
        adapter
            .send('foo')
            .assertReply(activity => assert.notStrictEqual(activity.type, ActivityTypes.Message))
            .then(done);
    });

    it('should immediately respond with a message (rather get a typing indicator) if middleware not applied', function (done) {
        noMiddlewareAdapter
            .send('foo')
            .assertReply(activity => assert.strictEqual(activity.type, ActivityTypes.Message))
            .then(done);
    });

    it('should not emit an uncaught exception when a promise is rejected', function (done) {
        class ShowTypingErrorMiddleware extends ShowTypingMiddleware {
            async sendTypingActivity() {
                throw new Error('uh oh');
            }
        }

        const adapter = new TestAdapter(async (context) => {
            await sleep(100);
            await context.sendActivity(`echo:${context.activity.text}`);
        }).use(new ShowTypingErrorMiddleware(1, 1000));

        adapter.onTurnError = (context, error) => {
            assert.strictEqual(error != null, true);
            assert.strictEqual(error.message, 'uh oh');
            done();
        }

        adapter.send('foo').assertReply(activity => assert.strictEqual(activity.type, ActivityTypes.Message))
    });

    it('should NOT send a typing indicator when bot is running as a skill', function (done) {
        const skillAdapter = new TestSkillAdapter(async context => {
            await sleep(100);
            await context.sendActivity(`echo:${context.activity.text}`);
        }).use(new ShowTypingMiddleware(1, 1000));

        skillAdapter
            .send('foo')
            .assertReply('echo:foo')
            .then(done);
    });
});
