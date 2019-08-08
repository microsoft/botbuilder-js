const Stream = require( '../lib/SubscribableStream');
const chai = require( 'chai');
var expect = chai.expect;

describe('Streaming Extensions Stream Tests', () => {
    it('throws on invalid encoding types', () => {
        //  expect.assertions(1);
        let s = new Stream.SubscribableStream();

        expect(() => s.write('data', 'supercoolencoding'))
            .to
            .throw();

    });

    it('does not throw on valid on valid encoding types', () => {
        //  expect.assertions(1);
        let s = new Stream.SubscribableStream();

        expect(() => s.write('data', 'utf8'))
            .not
            .to
            .throw();

    });

    it('subscribes to data events', (done) => {
        let s = new Stream.SubscribableStream();
        s.subscribe((data) => done());

        s._write('hello', 'utf8', () => {});
    })
});
