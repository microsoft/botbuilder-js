const SubscribableStream = require('../lib/subscribableStream');
const HttpContentStream = require('../lib/httpContentStream');
const StreamingResponse = require('../lib/streamingResponse');
const  chai  = require('chai');
var expect = chai.expect;

describe('Streaming Extensions Response Tests', () => {

    it('creates a new instance', () => {
        let stream1 = new SubscribableStream.SubscribableStream();
        stream1.write('hello');
        let headers = {contentLength: '5', contentType: 'text/plain'};
        let hc = new HttpContentStream.HttpContent(headers, stream1);
        let r = StreamingResponse.StreamingResponse.create(200, hc);

        expect(r).to.be.instanceOf(StreamingResponse.StreamingResponse);
        expect(r.statusCode).to.equal(200);
    });

    it('can set the response body', () => {
        let stream1 = new SubscribableStream.SubscribableStream();
        stream1.write('hello');
        let headers = {contentLength: '5', contentType: 'text/plain'};
        let hc = new HttpContentStream.HttpContent(headers, stream1);
        let r = StreamingResponse.StreamingResponse.create(200, hc);
        r.setBody('This is a new body.');

        expect(r).to.be.instanceOf(StreamingResponse.StreamingResponse);
        expect(r.streams[1].content.stream.bufferList[0].toString()).to.contain('This is a new body.');
        expect(r.statusCode).to.equal(200);
    });
});
