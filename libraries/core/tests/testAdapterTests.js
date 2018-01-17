const assert = require('assert');
const builder = require('../');

describe('test testAdapter', function () {
    this.timeout(5000);
    const testAdapter = new builder.TestAdapter();
    testAdapter.onReceive = (activity) => {
        assert(activity);
        if (activity.text == 'count') {
            testAdapter.post([{ replyToId: activity.id, type: 'message', text: `one` }]);
            testAdapter.post([{ replyToId: activity.id, type: 'message', text: `two` }]);
            testAdapter.post([{ replyToId: activity.id, type: 'message', text: `three` }]);
        }
        else if (activity.text != 'ignore') {
            testAdapter.post([{ replyToId: activity.id, type:'message', text: `echo:${activity.text}` }]);
        }
        return Promise.resolve({ handled: true });
    }

    it('test() works', function (done) {
        testAdapter
            .test('foo', 'echo:foo', 'string test() works')
            .test('foo', { type: 'message', text: 'echo:foo' }, 'activity test() works')
            .test('foo', (a) => assert.equal(a.text, 'echo:foo'), 'validator test() works')
            .then(() => done());
    });

    it('send().assertReply() works', function (done) {
        testAdapter
            .send('foo').assertReply('echo:foo', 'string assertReply() works')
            .send('foo').assertReply({ type: 'message', text: 'echo:foo' }, 'activity assertReply() works')
            .send('foo').assertReply((a) => assert.equal(a.text, 'echo:foo'), 'validator assertReply() works')
            .then(() => done());
    });

    it('assertReplyOneOf() works', function (done) {
        testAdapter.send('foo').assertReplyOneOf(['echo:bar', 'echo:foo', 'echo:blat'])
            .then(() => done());
    });

    it('chaining commands works', function (done) {
        testAdapter.send('foo').assertReply('echo:foo')
            .send('bar').assertReply('echo:bar')
            .then(() => done());
    });

    it('chaining with multiple reply works', function (done) {
        testAdapter.send('foo').assertReply('echo:foo')
            .send('bar').assertReply('echo:bar')
            .send('ignore')
            .send('count')
            .assertReply('one')
            .assertReply('two')
            .assertReply('three')
            .then(() => done());
    });

});

