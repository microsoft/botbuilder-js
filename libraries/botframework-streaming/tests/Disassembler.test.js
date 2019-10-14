const Disassemblers = require('../lib/disassemblers/requestDisassembler');
const PayloadSender = require('../lib/payloadTransport/payloadSender');
const Request = require('../lib/streamingRequest');
const HttpContentStream = require('../lib/httpContentStream');
const Stream = require('../lib/subscribableStream');
const CancelDisassembler = require('../lib/disassemblers/cancelDisassembler');
const PayloadTypes = require('../lib/payloads/payloadTypes');
const  chai  = require('chai');
var expect = chai.expect;

describe('RequestDisassembler', () => {

    it('resolves calls to get stream.', (done) => {
        let sender = new PayloadSender.PayloadSender();
        let req = new Request.StreamingRequest();
        let headers = {contentLength: 40, contentType: 'A'};
        let stream = new Stream.SubscribableStream();
        stream.write('This is the data inside of the stream.', 'UTF-8');
        let content = new HttpContentStream.HttpContent(headers, stream);
        let contentStream = new HttpContentStream.HttpContentStream(content);
        contentStream.content.headers = headers;

        req.addStream(contentStream);
        let rd = new Disassemblers.RequestDisassembler(sender,'42', req);

        let result = rd.getStream()
            .then(done());
    });
});

describe('CancelDisassembler', () => {

    it('constructs correctly.', () => {
        let sender = new PayloadSender.PayloadSender();
        let payloadType = PayloadTypes.PayloadTypes.cancelStream;
        let cd = new CancelDisassembler.CancelDisassembler(sender, '42', payloadType);

        expect(cd.id).to.equal('42');
        expect(cd.payloadType).to.equal(payloadType);
        expect(cd.sender).to.equal(sender);
    });

    it('sends payload without throwing.', () => {
        let sender = new PayloadSender.PayloadSender();
        let payloadType = PayloadTypes.PayloadTypes.cancelStream;
        let cd = new CancelDisassembler.CancelDisassembler(sender, '42', payloadType);

        expect(cd.id).to.equal('42');
        expect(cd.payloadType).to.equal(payloadType);
        expect(cd.sender).to.equal(sender);

        expect(cd.disassemble()).to.not.throw;
    });
});
