const { CancelDisassembler, RequestDisassembler } = require('../lib/disassemblers');
const { HttpContentStream } = require('../lib/httpContentStream');
const { HttpContent, StreamingRequest, SubscribableStream } = require('..');
const { PayloadSender } = require('../lib/payloadTransport');
const { PayloadTypes } = require('../lib/payloads');
const importSync= require('import-sync');
const { expect } = importSync('chai/lib/chai');

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

describe('CancelDisassembler', function () {
    it('constructs correctly.', function () {
        const sender = new PayloadSender();
        const cd = new CancelDisassembler(sender, '42', PayloadTypes.cancelStream);

        expect(cd.id).to.equal('42');
        expect(cd.payloadType).to.equal(PayloadTypes.cancelStream);
        expect(cd.sender).to.equal(sender);
    });

    it('sends payload without throwing.', function () {
        const sender = new PayloadSender();
        const cd = new CancelDisassembler(sender, '42', PayloadTypes.cancelStream);

        expect(cd.id).to.equal('42');
        expect(cd.payloadType).to.equal(PayloadTypes.cancelStream);
        expect(cd.sender).to.equal(sender);

        expect(() => cd.disassemble()).to.not.throw();
    });
});
