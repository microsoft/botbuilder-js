const Stream = require( '../lib/Stream');
const chai = require( 'chai');
var expect = chai.expect;

describe('Stream', () => {
    it('throws on invalid encoding types', () => {
        //  expect.assertions(1);
        let s = new Stream.Stream();

        expect(() => s.write('data', 'supercoolencoding'))
            .to
            .throw();

    });

    it('does not throw on valid on valid encoding types', () => {
        //  expect.assertions(1);
        let s = new Stream.Stream();

        expect(() => s.write('data', 'utf8'))
            .not
            .to
            .throw();

    });
});
