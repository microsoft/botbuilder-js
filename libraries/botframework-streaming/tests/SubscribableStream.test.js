const { SubscribableStream } = require('../lib/subscribableStream');
const { expect } = require('../vendors/chai');

describe('Streaming Extensions Stream Tests', function () {
    it('throws on invalid encoding types', function () {
        const s = new SubscribableStream();

        expect(() => s.write('data', 'supercoolencoding')).to.throw();
    });

    it('does not throw on valid on valid encoding types', function () {
        const s = new SubscribableStream();

        expect(() => s.write('data', 'utf8')).not.to.throw();
    });

    it('subscribes to data events', function (done) {
        const s = new SubscribableStream();
        s.subscribe((_data) => done());

        s._write('hello', 'utf8', () => {});
    });
});
