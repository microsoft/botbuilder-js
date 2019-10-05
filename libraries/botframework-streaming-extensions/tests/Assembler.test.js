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
        let header = {payloadType: PayloadTypes.PayloadTypes.request, payloadLength: '42', id: '100', end: true};
        let sm = new StreamManager.StreamManager();
        let rra = new PayloadAssembler.PayloadAssembler(sm, {header: header});

        expect(rra.id).equals('100');
        expect(rra._streamManager).equals(sm);
    });

    it('closes without throwing', () => {
        let header = {payloadType: PayloadTypes.PayloadTypes.request, payloadLength: '42', id: '100', end: true};
        let sm = new StreamManager.StreamManager();

        let rra = new PayloadAssembler.PayloadAssembler(sm, {header: header});

        expect(() => {rra.close();}).to.not.throw;
    });

    it('returns a new stream.', () => {
        let header = {payloadType: PayloadTypes.PayloadTypes.response, payloadLength: '42', id: '100', end: true};
        let sm = new StreamManager.StreamManager();

        let rra = new PayloadAssembler.PayloadAssembler(sm, {header: header});

        expect(rra.createPayloadStream()).to.be.instanceOf(SubscribableStream.SubscribableStream);
    });

    it('processes a Request without throwing.', (done) => {
        let header = {payloadType: PayloadTypes.PayloadTypes.request, payloadLength: '5', id: '100', end: true};
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
        let header = {payloadType: PayloadTypes.PayloadTypes.response, payloadLength: '5', id: '100', end: true};
        let sm = new StreamManager.StreamManager();
        let s = new SubscribableStream.SubscribableStream();
        s.write('12345');
        let rp = {statusCode: 200};
        rp.streams = s;
        let rra = new PayloadAssembler.PayloadAssembler(sm, {header: header, onCompleted: function() {done();} });
        rra.onReceive(header, s, 5);
    });

    it('assigns values when constructed', () => {
        let header = {payloadType: PayloadTypes.PayloadTypes.stream, payloadLength: 50, id: '1', end: undefined};
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
        let header = {payloadType: PayloadTypes.PayloadTypes.stream, payloadLength: 50, id: '1', end: true};
        let csa = new PayloadAssembler.PayloadAssembler(new StreamManager.StreamManager(), {header: header});
        expect(csa.createPayloadStream())
            .instanceOf(SubscribableStream.SubscribableStream);
    });

    it('closes a Stream', () => {
        let header = {payloadType: PayloadTypes.PayloadTypes.stream, payloadLength: 50, id: '1', end: true};
        let csa = new PayloadAssembler.PayloadAssembler(new StreamManager.StreamManager(), {header: header});
        expect(csa.createPayloadStream())
            .instanceOf(SubscribableStream.SubscribableStream);
        expect(csa.close()).to.not.throw;
    });
});

describe('PayloadAssemblerManager', () => {
    it('cretes a response stream', (done) => {
        let p = new PayloadAssemblerManager.PayloadAssemblerManager(new StreamManager.StreamManager(), () => done(), () => done());
        let head = {payloadType: PayloadTypes.PayloadTypes.response, payloadLength: '42', id: '100', end: true};
        expect(p.getPayloadStream(head)).to.be.instanceOf(SubscribableStream.SubscribableStream);
        done();
    });


    it('cretes a request stream', (done) => {
        let p = new PayloadAssemblerManager.PayloadAssemblerManager(new StreamManager.StreamManager(), () => done(), () => done());
        let head = {payloadType: PayloadTypes.PayloadTypes.request, payloadLength: '42', id: '100', end: true};
        expect(p.getPayloadStream(head)).to.be.instanceOf(SubscribableStream.SubscribableStream);
        done();
    });

    it('does not throw when receiving a request', (done) => {
        let p = new PayloadAssemblerManager.PayloadAssemblerManager(new StreamManager.StreamManager(), () => done(), () => done());
        let head = {payloadType: PayloadTypes.PayloadTypes.request, payloadLength: '42', id: '100', end: true};
        let s = p.getPayloadStream(head);
        expect(s).to.be.instanceOf(SubscribableStream.SubscribableStream);
        expect(p.onReceive(head, s, 0)).to.not.throw;
        done();
    });

    it('does not throw when receiving a stream', (done) => {
        let p = new PayloadAssemblerManager.PayloadAssemblerManager(new StreamManager.StreamManager(), () => done(), () => done());
        let head = {payloadType: PayloadTypes.PayloadTypes.stream, payloadLength: '42', id: '100', end: true};
        let s = p.getPayloadStream(head);
        expect(s).to.be.instanceOf(SubscribableStream.SubscribableStream);
        expect(p.onReceive(head, s, 0)).to.not.throw;
        done();
    });

    it('does not throw when receiving a response', (done) => {
        let p = new PayloadAssemblerManager.PayloadAssemblerManager(new StreamManager.StreamManager(), () => done(), () => done());
        let head = {payloadType: PayloadTypes.PayloadTypes.response, payloadLength: '42', id: '100', end: true};
        let s = p.getPayloadStream(head);
        expect(s).to.be.instanceOf(SubscribableStream.SubscribableStream);
        expect(p.onReceive(head, s, 0)).to.not.throw;
        done();
    });

    it('returns undefined when asked to create an existing stream', (done) => {
        let p = new PayloadAssemblerManager.PayloadAssemblerManager(new StreamManager.StreamManager(), () => done(), () => done());
        let head = {payloadType: PayloadTypes.PayloadTypes.request, payloadLength: '42', id: '100', end: true};
        let s = p.getPayloadStream(head);
        expect(s).to.be.instanceOf(SubscribableStream.SubscribableStream);
        expect(p.getPayloadStream(head)).to.be.undefined;
        done();
    });

    it('throws if not given an ID', () => {
        let header = {payloadType: PayloadTypes.PayloadTypes.request, payloadLength: '5', id: undefined, end: true};
        let sm = new StreamManager.StreamManager();
        try{
            let rra = new PayloadAssembler.PayloadAssembler(sm, {header: header, onCompleted: function() {done();} });
        } catch(result) {
            expect(result.message).to.equal('An ID must be supplied when creating an assembler.');
        }
    });

    it('processes a response with streams without throwing.', (done) => {
        let header = {payloadType: PayloadTypes.PayloadTypes.response, payloadLength: '5', id: '100', end: true};
        let sm = new StreamManager.StreamManager();
        let s = new SubscribableStream.SubscribableStream();
        s.write('{"statusCode": "12345","streams": [{"id": "1","contentType": "text","length": "2"},{"id": "2","contentType": "text","length": "2"},{"id": "3","contentType": "text","length": "2"}]}');
        let rp = {verb: 'POST', path: '/some/path'};
        rp.streams = [];
        rp.streams.push(s);

        let rra = new PayloadAssembler.PayloadAssembler(sm, {header: header, onCompleted: function() {done();} });
        rra.onReceive(header, s, 5);
        rra.close();
    });
});
