const Header = require('../lib/Payloads/Models/Header');
const Stream = require('../lib/Stream');
const  chai  = require('chai');
const StreamManager = require('../lib/Payloads/StreamManager');
const PayloadTypes = require('../lib/Payloads/Models/PayloadTypes');
const  ContentStreamAssembler = require( '../lib/Payloads/Assemblers/ContentStreamAssembler');
const ReceiveRequestAssembler = require('../lib/Payloads/Assemblers/ReceiveRequestAssembler');
const ReceiveResponseAssembler = require('../lib/Payloads/Assemblers/ReceiveResponseAssembler');
const PayloadAssembler = require('../lib/Payloads/Assemblers/PayloadAssembler');
const StreamDescription = require('../lib/Payloads/Models/StreamDescription');
const ResponsePayload = require('../lib/Payloads/Models/ResponsePayload');
const RequestPayload = require('../lib/Payloads/Models/RequestPayload');
const PayloadAssemblerManager = require('../lib/Payloads/PayloadAssemblerManager');
var expect = chai.expect;

describe('ReceiveRequestAssembler', () => {
    it('constructs correctly.', () => {
        let header = new Header.Header(PayloadTypes.PayloadTypes.request, '42', '100', true);
        let sm = new StreamManager.StreamManager();

        let rra = new ReceiveRequestAssembler.ReceiveRequestAssembler(header, sm, undefined);

        expect(rra.id).equals('100');
        expect(rra._streamManager).equals(sm);
    });

    it('throws instead of closing.', () => {
        let header = new Header.Header(PayloadTypes.PayloadTypes.request, '42', '100', true);
        let sm = new StreamManager.StreamManager();

        let rra = new ReceiveRequestAssembler.ReceiveRequestAssembler(header, sm, undefined);

        expect(() => {rra.close();}).to.throw('Method not implemented.');
    });

    it('converts json to a RequestPayload.', () => {
        let header = new Header.Header(PayloadTypes.PayloadTypes.request, '42', '100', true);
        let sm = new StreamManager.StreamManager();

        let rra = new ReceiveRequestAssembler.ReceiveRequestAssembler(header, sm, undefined);
        let rp = new RequestPayload.RequestPayload('POST', '/some/path');
        let json = JSON.stringify(rp);
        let result = rra.requestPayloadfromJson(json);

        expect(result.verb).to.equal('POST');
        expect(result.path).to.equal('/some/path');
    });

    it('processes a Request without throwing.', (done) => {
        let header = new Header.Header(PayloadTypes.PayloadTypes.request, '5', '100', true);
        let sm = new StreamManager.StreamManager();
        let s = new Stream.Stream();
        s.write('12345');
        let rp = new RequestPayload.RequestPayload('POST', '/some/path');
        rp.streams = s;
        let rra = new ReceiveRequestAssembler.ReceiveRequestAssembler(header, sm, () => done() );
        rra.processRequest(s);     
    });
});

describe('ReceiveResponseAssembler', () => {
    it('constructs correctly.', () => {
        let header = new Header.Header(PayloadTypes.PayloadTypes.response, '42', '100', true);
        let sm = new StreamManager.StreamManager();

        let rra = new ReceiveResponseAssembler.ReceiveResponseAssembler(header, sm, undefined);

        expect(rra.id).equals('100');
        expect(rra._streamManager).equals(sm);
    });

    it('returns a new stream.', () => {
        let header = new Header.Header(PayloadTypes.PayloadTypes.response, '42', '100', true);
        let sm = new StreamManager.StreamManager();

        let rra = new ReceiveResponseAssembler.ReceiveResponseAssembler(header, sm, undefined);

        expect(rra.createPayloadStream()).to.be.instanceOf(Stream.Stream);
    });

    it('converts json to a ResponsePayload.', () => {
        let header = new Header.Header(PayloadTypes.PayloadTypes.response, '42', '100', true);
        let sm = new StreamManager.StreamManager();

        let rra = new ReceiveResponseAssembler.ReceiveResponseAssembler(header, sm, undefined);
        let rp = new ResponsePayload.ResponsePayload(200);
        let json = JSON.stringify(rp);

        expect(rra.responsePayloadfromJson(json).statusCode).to.equal(200);
    });

    it('throws instead of closing.', () => {
        let header = new Header.Header(PayloadTypes.PayloadTypes.response, '42', '100', true);
        let sm = new StreamManager.StreamManager();

        let rra = new ReceiveResponseAssembler.ReceiveResponseAssembler(header, sm, undefined);

        expect(() => {rra.close();}).to.throw('Method not implemented.');
    });

    it('processes a Response without throwing.', (done) => {
        let header = new Header.Header(PayloadTypes.PayloadTypes.response, '5', '100', true);
        let sm = new StreamManager.StreamManager();
        let s = new Stream.Stream();
        s.write('12345');
        let rp = new ResponsePayload.ResponsePayload(200);
        rp.streams = s;
        let rra = new ReceiveResponseAssembler.ReceiveResponseAssembler(header, sm, () => done());
        rra.onReceive(header, s, 5);        
    });

});

describe('ContentStreamAssembler', () => {
    it('assigns values when constructed', () => {
        let csa = new ContentStreamAssembler.ContentStreamAssembler(new StreamManager.StreamManager(), '1', 'stream', 50);
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
        let csa = new ContentStreamAssembler.ContentStreamAssembler(new StreamManager.StreamManager(), '1', 'stream', 50);
        expect(csa.createPayloadStream())
            .instanceOf(Stream.Stream);
    });
});

describe('PayloadAssemblerManager', () => {
    it('cretes a response stream', (done) => {
        let p = new PayloadAssemblerManager.PayloadAssembleManager(new StreamManager.StreamManager(), () => done(), () => done());
        let head = new Header.Header(PayloadTypes.PayloadTypes.response, '42', '100', true);
        expect(p.getPayloadStream(head)).to.be.instanceOf(Stream.Stream);
        done();
    });

    
    it('cretes a request stream', (done) => {
        let p = new PayloadAssemblerManager.PayloadAssembleManager(new StreamManager.StreamManager(), () => done(), () => done());
        let head = new Header.Header(PayloadTypes.PayloadTypes.request, '42', '100', true);
        expect(p.getPayloadStream(head)).to.be.instanceOf(Stream.Stream);
        done();
    });

    it('does not throw when receiving a request', (done) => {
        let p = new PayloadAssemblerManager.PayloadAssembleManager(new StreamManager.StreamManager(), () => done(), () => done());
        let head = new Header.Header(PayloadTypes.PayloadTypes.request, '42', '100', true);
        let s = p.getPayloadStream(head);
        expect(s).to.be.instanceOf(Stream.Stream);
        expect(p.onReceive(head, s, 0)).to.not.throw;
        done();
    });

    it('does not throw when receiving a stream', (done) => {
        let p = new PayloadAssemblerManager.PayloadAssembleManager(new StreamManager.StreamManager(), () => done(), () => done());
        let head = new Header.Header(PayloadTypes.PayloadTypes.stream, '42', '100', true);
        let s = p.getPayloadStream(head);
        expect(s).to.be.instanceOf(Stream.Stream);
        expect(p.onReceive(head, s, 0)).to.not.throw;
        done();
    });

    it('does not throw when receiving a response', (done) => {
        let p = new PayloadAssemblerManager.PayloadAssembleManager(new StreamManager.StreamManager(), () => done(), () => done());
        let head = new Header.Header(PayloadTypes.PayloadTypes.response, '42', '100', true);
        let s = p.getPayloadStream(head);
        expect(s).to.be.instanceOf(Stream.Stream);
        expect(p.onReceive(head, s, 0)).to.not.throw;
        done();
    });

    it('returns undefined when asked to create an existing stream', (done) => {
        let p = new PayloadAssemblerManager.PayloadAssembleManager(new StreamManager.StreamManager(), () => done(), () => done());
        let head = new Header.Header(PayloadTypes.PayloadTypes.request, '42', '100', true);
        let s = p.getPayloadStream(head);
        expect(s).to.be.instanceOf(Stream.Stream);
        expect(p.getPayloadStream(head)).to.be.undefined;
        done();
    });
});
