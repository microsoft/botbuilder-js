const StreamWrapper = require( '../lib/Payloads/Disassemblers/StreamWrapper');
const Stream = require( '../lib/Stream');
const chai = require( 'chai');
var expect = chai.expect;

describe('StreamWrapper', () => {

    it('assigns correct values when constructed', () => {
        // expect.assertions(2);
        let s = new Stream.Stream();
        s._write('some text', 'utf8', (data) => { });
        let sw = new StreamWrapper.StreamWrapper(s, 9);

        expect(sw.stream)
            .to.equal(s);

        expect(sw.streamLength)
            .to.equal(9);
    });
});
