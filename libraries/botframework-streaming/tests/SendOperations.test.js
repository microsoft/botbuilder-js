const { HttpContent, StreamingRequest, StreamingResponse, SubscribableStream } = require('..');
const { PayloadSender } = require('../lib/payloadTransport');
const { SendOperations } = require('../lib/payloads');
const importSync= require('import-sync');
const { expect } = importSync('chai');

describe('SendOperations', function () {
    it('constructs a new instance', function () {
        const ps = new PayloadSender();
        const so = new SendOperations(ps);

        expect(so).to.be.instanceOf(SendOperations);
    });

    let ps = new PayloadSender();
    let so = new SendOperations(ps);
    let headers = { contentLength: '5', contentType: 'text/plain' };
    let subscribableStream = new SubscribableStream();

    this.beforeEach(function () {
        ps = new PayloadSender();
        so = new SendOperations(ps);
        headers = { contentLength: '5', contentType: 'text/plain' };
        subscribableStream = new SubscribableStream();
    });

    this.afterEach(function () {
        ps = null;
        so = null;
        headers = null;
        subscribableStream = null;
    });

    it('processes a send request operation', async function () {
        const r = new StreamingRequest();
        subscribableStream.write('hello');
        r.addStream(new HttpContent(headers, subscribableStream));
        await so.sendRequest('test1', r);
    });

    it('processes a send response with streams operation', async function () {
        subscribableStream.write('hello');
        const r = StreamingResponse.create(200, new HttpContent(headers, subscribableStream));
        r.setBody('This is a new body.');
        expect(r.streams[1].content.stream.bufferList[0].toString()).to.contain('This is a new body.');

        await so.sendResponse('test1', r);
    });

    it('processes a send response with no streams operation', async function () {
        subscribableStream.write('hello');
        const r = StreamingResponse.create(200, new HttpContent(headers, subscribableStream));

        await so.sendResponse('test1', r);
    });

    it('processes a cancel stream operation', async function () {
        await so.sendCancelStream('test1');
    });
});
