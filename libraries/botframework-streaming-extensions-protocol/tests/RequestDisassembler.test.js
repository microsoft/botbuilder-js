const Disassemblers = require('../lib/Payloads/Disassemblers/RequestDisassembler');
const PayloadSender = require('../lib/PayloadTransport/PayloadSender');
const Request = require('../lib/Request');
const HttpContentStream = require('../lib/HttpContentStream');
const Stream = require('../lib/Stream');
const CancelDisassembler = require('../lib/Payloads/Disassemblers/CancelDisassembler');
const PayloadTypes = require('../lib/Payloads/Models/PayloadTypes');
const  chai  = require('chai');
var expect = chai.expect;

describe('RequestDisassembler', () => {

    it('resolves calls to get stream.', (done) => {
        let sender = new PayloadSender.PayloadSender();
        let req = new Request.Request();
        let headers = new HttpContentStream.HttpContentHeaders();
        headers.contentLength = 40;
        headers.contentType ='A';
        let stream = new Stream.Stream();
        stream.write("This is the data inside of the stream.", 'UTF-8');
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