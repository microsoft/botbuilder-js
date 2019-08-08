const SubscribableStream = require('../lib/SubscribableStream');
const HttpContentStream = require('../lib/HttpContentStream');
const StreamingResponse = require('../lib/StreamingResponse');
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
});