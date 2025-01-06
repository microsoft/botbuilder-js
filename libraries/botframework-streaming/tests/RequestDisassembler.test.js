const { RequestDisassembler } = require('../lib/disassemblers');
const { HttpContentStream } = require('../lib/httpContentStream');
const { HttpContent, StreamingRequest, SubscribableStream } = require('..');
const { PayloadSender } = require('../lib/payloadTransport');

describe('RequestDisassembler', function () {
    it('resolves calls to get stream.', async function () {
        const sender = new PayloadSender();
        const req = new StreamingRequest();
        const headers = { contentLength: 40, contentType: 'A' };
        const stream = new SubscribableStream();
        stream.write('This is the data inside of the stream.', 'UTF-8');
        const content = new HttpContent(headers, stream);
        const contentStream = new HttpContentStream(content);
        contentStream.content.headers = headers;

        req.addStream(contentStream);
        const rd = new RequestDisassembler(sender, '42', req);

        await rd.getStream();
    });
});
