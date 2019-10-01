const StreamManager = require('../lib/Payloads/StreamManager')
const PayloadTypes = require('../lib/Payloads/PayloadTypes');
const SubscribableStream = require('../lib/SubscribableStream');
const PayloadAssembler = require('../lib/Assemblers/PayloadAssembler');
const  chai  = require('chai');
var expect = chai.expect;

describe('Streaming Protocol StreamManager Tests', () => {

    it('properly constructs a new instance', () => {
        let sm = new StreamManager.StreamManager(undefined);
        expect(sm).to.be.instanceOf(StreamManager.StreamManager);
    });

    it('creates and returns a new assembler when none currently exist', () => {
        let sm = new StreamManager.StreamManager(undefined);
        expect(sm).to.be.instanceOf(StreamManager.StreamManager);

        let pa = sm.getPayloadAssembler('bob');

        expect(pa).to.be.instanceOf(PayloadAssembler.PayloadAssembler);
        expect(pa.id).to.equal('bob');
    });

    it('creates and returns a new assembler when others already exist', () => {
        let sm = new StreamManager.StreamManager(undefined);
        expect(sm).to.be.instanceOf(StreamManager.StreamManager);

        let pa = sm.getPayloadAssembler('Huey');

        expect(pa).to.be.instanceOf(PayloadAssembler.PayloadAssembler);
        expect(pa.id).to.equal('Huey');

        let pa2 = sm.getPayloadAssembler('Dewey');
        expect(pa2).to.be.instanceOf(PayloadAssembler.PayloadAssembler);
        expect(pa2.id).to.equal('Dewey');

        let pa3 = sm.getPayloadAssembler('Louie');
        expect(pa3).to.be.instanceOf(PayloadAssembler.PayloadAssembler);
        expect(pa3.id).to.equal('Louie');
    });

    it('looks up the correct assembler and returns the stream', () => {
        let sm = new StreamManager.StreamManager(undefined);
        expect(sm).to.be.instanceOf(StreamManager.StreamManager);
        let head = {payloadType: PayloadTypes.PayloadTypes.request, payloadLength: '0', id: 'bob', end: true};
        let ps = sm.getPayloadStream(head);

        expect(ps).to.be.instanceOf(SubscribableStream.SubscribableStream);

        let pa = sm.getPayloadAssembler('bob');
        expect(pa).to.be.instanceOf(PayloadAssembler.PayloadAssembler);
        expect(pa.id).to.equal('bob');
    });

    it('does not throw when asked to receive on a non-existant stream', () => {
        let sm = new StreamManager.StreamManager(undefined);
        expect(sm).to.be.instanceOf(StreamManager.StreamManager);
        let head = {payloadType: PayloadTypes.PayloadTypes.request, payloadLength: '0', id: 'bob', end: true};
        let stream1 = new SubscribableStream.SubscribableStream();
        stream1.write('hello');
        expect(sm.onReceive(head, stream1, 5)).to.not.throw;
    });

    it('attempts to receive from an existing stream', () => {
        let sm = new StreamManager.StreamManager(undefined);
        expect(sm).to.be.instanceOf(StreamManager.StreamManager);
        let head = {payloadType: PayloadTypes.PayloadTypes.request, payloadLength: '0', id: 'bob', end: true};
        let pa = sm.getPayloadAssembler('bob');
        expect(pa).to.be.instanceOf(PayloadAssembler.PayloadAssembler);
        expect(pa.id).to.equal('bob');
        let stream1 = new SubscribableStream.SubscribableStream();
        stream1.write('hello');
        expect(sm.onReceive(head, stream1, 5)).to.not.throw;
    });

    it('can close a stream', (done) => {
        let sm = new StreamManager.StreamManager(done());
        expect(sm).to.be.instanceOf(StreamManager.StreamManager);
        let head = {payloadType: PayloadTypes.PayloadTypes.request, payloadLength: '0', id: 'bob', end: true};
        let pa = sm.getPayloadAssembler('bob');
        expect(pa).to.be.instanceOf(PayloadAssembler.PayloadAssembler);
        expect(pa.id).to.equal('bob');
        let stream1 = new SubscribableStream.SubscribableStream();
        stream1.write('hello');
        expect(sm.closeStream(pa.id)).to.not.throw;
    });

    it('does not throw when asked to close a stream that does not exist', (done) => {
        let sm = new StreamManager.StreamManager(done());
        expect(sm).to.be.instanceOf(StreamManager.StreamManager);
        let head = {payloadType: PayloadTypes.PayloadTypes.request, payloadLength: '0', id: 'bob', end: true};
        expect(sm.closeStream(head.id)).to.not.throw;
    });
});
