const { HttpContent, StreamingResponse, SubscribableStream } = require('..');
const importSync= require('import-sync');
const { expect } = importSync('chai/lib/chai');

describe('Streaming Extensions Response Tests', function () {
    it('can set the response body', function () {
        const stream = new SubscribableStream();
        stream.write('hello');
        const headers = { contentLength: '5', contentType: 'text/plain' };
        const hc = new HttpContent(headers, stream);
        const r = StreamingResponse.create(200, hc);
        r.setBody('This is a new body.');

        expect(r).to.be.instanceOf(StreamingResponse);
        expect(r.streams[1].content.stream.bufferList[0].toString()).to.contain('This is a new body.');
        expect(r.statusCode).to.equal(200);
    });
});
