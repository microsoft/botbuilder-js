const SubscribableStream = require('../lib/SubscribableStream');
const chai = require('chai');
const StreamManager = require('../lib/Payloads/StreamManager');
const PayloadTypes = require('../lib/Payloads/PayloadTypes');
const PayloadAssembler = require('../lib/Assemblers/PayloadAssembler');
const PayloadAssemblerManager = require('../lib/Payloads/PayloadAssemblerManager');
var expect = chai.expect;

describe('ReceiveRequestAssembler', () => {

});

describe('PayloadAssembler', () => {
    it('constructs correctly.', () => {
        let header = {PayloadType: PayloadTypes.PayloadTypes.request, PayloadLength: '42', Id: '100', End: true};
        let sm = new StreamManager.StreamManager();
        let rra = new PayloadAssembler.PayloadAssembler(sm, {header: header});

        expect(rra.id).equals('100');
        expect(rra._streamManager).equals(sm);
    });

    it('closes without throwing', () => {
        let header = {PayloadType: PayloadTypes.PayloadTypes.request, PayloadLength: '42', Id: '100', End: true};
        let sm = new StreamManager.StreamManager();

        let rra = new PayloadAssembler.PayloadAssembler(sm, {header: header});

        expect(() => {rra.close();}).to.not.throw;
    });

    it('returns a new stream.', () => {
        let header = {PayloadType: PayloadTypes.PayloadTypes.response, PayloadLength: '42', Id: '100', End: true};
        let sm = new StreamManager.StreamManager();

        let rra = new PayloadAssembler.PayloadAssembler(sm, {header: header});

        expect(rra.createPayloadStream()).to.be.instanceOf(SubscribableStream.SubscribableStream);
    });

    it('processes a Request without throwing.', (done) => {
        let header = {PayloadType: PayloadTypes.PayloadTypes.request, PayloadLength: '5', Id: '100', End: true};
        let sm = new StreamManager.StreamManager();
        let s = new SubscribableStream.SubscribableStream();
        s.write('12345');
        let rp = {verb: 'POST', path: '/some/path'};
        rp.streams = s;
        let rra = new PayloadAssembler.PayloadAssembler(sm, {header: header, onCompleted: function() {done();} });
        rra.onReceive(header, s, 5);
        rra.close();     
    });

    it('processes a Response without throwing.', (done) => {
        let header = {PayloadType: PayloadTypes.PayloadTypes.response, PayloadLength: '5', Id: '100', End: true};
        let sm = new StreamManager.StreamManager();
        let s = new SubscribableStream.SubscribableStream();
        s.write('12345');
        let rp = {statusCode: 200};
        rp.streams = s;
        let rra = new PayloadAssembler.PayloadAssembler(sm, {header: header, onCompleted: function() {done();} });
        rra.onReceive(header, s, 5);        
    });

    it('assigns values when constructed', () => {
        let header = {PayloadType: PayloadTypes.PayloadTypes.stream, PayloadLength: 50, Id: '1', End: undefined};
        let csa = new PayloadAssembler.PayloadAssembler(new StreamManager.StreamManager(), {header: header});
        expect(csa.id)
            .equals('1');
        expect(csa.contentLength)
            .equals(50);
        expect(csa.payloadType)
            .equals('S');
        expect(csa.end)
            .equals(undefined);
    });

    it('returns a Stream', () => {
        let header = {PayloadType: PayloadTypes.PayloadTypes.stream, PayloadLength: 50, Id: '1', End: true};
        let csa = new PayloadAssembler.PayloadAssembler(new StreamManager.StreamManager(), {header: header});
        expect(csa.createPayloadStream())
            .instanceOf(SubscribableStream.SubscribableStream);
    });

    it('closes a Stream', () => {
        let header = {PayloadType: PayloadTypes.PayloadTypes.stream, PayloadLength: 50, Id: '1', End: true};
        let csa = new PayloadAssembler.PayloadAssembler(new StreamManager.StreamManager(), {header: header});
        expect(csa.createPayloadStream())
            .instanceOf(SubscribableStream.SubscribableStream);
        expect(csa.close()).to.not.throw;
    });
});

describe('PayloadAssemblerManager', () => {
    it('cretes a response stream', (done) => {
        let p = new PayloadAssemblerManager.PayloadAssemblerManager(new StreamManager.StreamManager(), () => done(), () => done());
        let head = {PayloadType: PayloadTypes.PayloadTypes.response, PayloadLength: '42', Id: '100', End: true};
        expect(p.getPayloadStream(head)).to.be.instanceOf(SubscribableStream.SubscribableStream);
        done();
    });

    
    it('cretes a request stream', (done) => {
        let p = new PayloadAssemblerManager.PayloadAssemblerManager(new StreamManager.StreamManager(), () => done(), () => done());
        let head = {PayloadType: PayloadTypes.PayloadTypes.request, PayloadLength: '42', Id: '100', End: true};
        expect(p.getPayloadStream(head)).to.be.instanceOf(SubscribableStream.SubscribableStream);
        done();
    });

    it('does not throw when receiving a request', (done) => {
        let p = new PayloadAssemblerManager.PayloadAssemblerManager(new StreamManager.StreamManager(), () => done(), () => done());
        let head = {PayloadType: PayloadTypes.PayloadTypes.request, PayloadLength: '42', Id: '100', End: true};
        let s = p.getPayloadStream(head);
        expect(s).to.be.instanceOf(SubscribableStream.SubscribableStream);
        expect(p.onReceive(head, s, 0)).to.not.throw;
        done();
    });

    it('does not throw when receiving a stream', (done) => {
        let p = new PayloadAssemblerManager.PayloadAssemblerManager(new StreamManager.StreamManager(), () => done(), () => done());
        let head = {PayloadType: PayloadTypes.PayloadTypes.stream, PayloadLength: '42', Id: '100', End: true};
        let s = p.getPayloadStream(head);
        expect(s).to.be.instanceOf(SubscribableStream.SubscribableStream);
        expect(p.onReceive(head, s, 0)).to.not.throw;
        done();
    });

    it('does not throw when receiving a response', (done) => {
        let p = new PayloadAssemblerManager.PayloadAssemblerManager(new StreamManager.StreamManager(), () => done(), () => done());
        let head = {PayloadType: PayloadTypes.PayloadTypes.response, PayloadLength: '42', Id: '100', End: true};
        let s = p.getPayloadStream(head);
        expect(s).to.be.instanceOf(SubscribableStream.SubscribableStream);
        expect(p.onReceive(head, s, 0)).to.not.throw;
        done();
    });

    it('returns undefined when asked to create an existing stream', (done) => {
        let p = new PayloadAssemblerManager.PayloadAssemblerManager(new StreamManager.StreamManager(), () => done(), () => done());
        let head = {PayloadType: PayloadTypes.PayloadTypes.request, PayloadLength: '42', Id: '100', End: true};
        let s = p.getPayloadStream(head);
        expect(s).to.be.instanceOf(SubscribableStream.SubscribableStream);
        expect(p.getPayloadStream(head)).to.be.undefined;
        done();
    });
});
