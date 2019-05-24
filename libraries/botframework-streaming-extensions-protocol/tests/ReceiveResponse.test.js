const MockStreamManager = require( '../lib/__mocks__/MockStreamManager');
const ContentStream = require( '../lib/ContentStream');
const ContentStreamAssembler = require( '../lib/Payloads/Assemblers/ContentStreamAssembler');
const ReceiveResponse = require( '../lib/ReceiveResponse');
const chai = require( 'chai');
var expect = chai.expect;

describe('ReceiveResponse', () => {

    it('assigns an empty array to streams when constructed', () => {
        let rr = new ReceiveResponse.ReceiveResponse();
        expect(rr.Streams)
            .to
            .be
            .an('array')
            .that
            .is
            .empty;
    });

    it('can update the value of statuscode', () => {
        let rr = new ReceiveResponse.ReceiveResponse();
        rr.StatusCode = 200;

        expect(rr.StatusCode)
            .equal(200);
    });

    it('can update the value of streams', () => {
        let rr = new ReceiveResponse.ReceiveResponse();
        let stream1 = new ContentStream.ContentStream('1', new ContentStreamAssembler.ContentStreamAssembler(MockStreamManager, '1', undefined, undefined));
        let stream2 = new ContentStream.ContentStream('2', new ContentStreamAssembler.ContentStreamAssembler(MockStreamManager, '2', undefined, undefined));
        rr.Streams = [stream1, stream2];
    
        expect(rr.Streams)
            .to
            .be
            .an('array');

        expect(rr.Streams)
            .to
            .have
            .lengthOf(2);

        expect(rr.Streams[0])
            .to
            .deep
            .equal(stream1);

        expect(rr.Streams[1])
            .to
            .deep
            .equal(stream2);
    });
});
