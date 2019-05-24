const  chai = require( 'chai');
const  Stream = require( 'stream');
const  MockStreamManager = require( '../lib/__mocks__/MockStreamManager');
const  ContentStreamAssembler = require( '../lib/Payloads/Assemblers/ContentStreamAssembler');
var expect = chai.expect;

describe('ContentStreamAssembler', () => {
    it('assigns values when constructed', () => {
        let csa = new ContentStreamAssembler.ContentStreamAssembler(MockStreamManager, '1', 'stream', 50);
        expect(csa.id)
            .equals('1');
        expect(csa.contentLength)
            .equals(50);
        expect(csa.contentType)
            .equals('stream');
        expect(csa.end)
            .equals(undefined);
    });

    it('returns a Stream', () => {
        let csa = new ContentStreamAssembler.ContentStreamAssembler(MockStreamManager, '1', 'stream', 50);
        expect(csa.createPayloadStream())
            .instanceOf(Stream);
    });
});
