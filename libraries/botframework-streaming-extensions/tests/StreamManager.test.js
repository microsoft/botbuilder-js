const protocol = require('../lib');
const  chai  = require('chai');
var expect = chai.expect;

describe('Streaming Protocol StreamManager Tests', () => {

    it('properly constructs a new instance', () => {
        let sm = new protocol.StreamManager(undefined);
        expect(sm).to.be.instanceOf(protocol.StreamManager);
    });

    it('creates and returns a new assembler when none currently exist', () => {
        let sm = new protocol.StreamManager(undefined);
        expect(sm).to.be.instanceOf(protocol.StreamManager);

        let pa = sm.getPayloadAssembler('bob');

        expect(pa).to.be.instanceOf(protocol.ContentStreamAssembler);
        expect(pa.id).to.equal('bob');
    });
    
    it('creates and returns a new assembler when others already exist', () => {
        let sm = new protocol.StreamManager(undefined);
        expect(sm).to.be.instanceOf(protocol.StreamManager);

        let pa = sm.getPayloadAssembler('Huey');

        expect(pa).to.be.instanceOf(protocol.ContentStreamAssembler);
        expect(pa.id).to.equal('Huey');

        let pa2 = sm.getPayloadAssembler('Dewey');
        expect(pa2).to.be.instanceOf(protocol.ContentStreamAssembler);
        expect(pa2.id).to.equal('Dewey');

        let pa3 = sm.getPayloadAssembler('Louie');
        expect(pa3).to.be.instanceOf(protocol.ContentStreamAssembler);
        expect(pa3.id).to.equal('Louie');
    });

    it('looks up the correct assembler and returns the stream', () => {
        let sm = new protocol.StreamManager(undefined);
        expect(sm).to.be.instanceOf(protocol.StreamManager);

        let head = new protocol.Header(protocol.PayloadTypes.request, 0, 'bob', true);
        let ps = sm.getPayloadStream(head);

        expect(ps).to.be.instanceOf(protocol.Stream);

        let pa = sm.getPayloadAssembler('bob');
        expect(pa).to.be.instanceOf(protocol.ContentStreamAssembler);
        expect(pa.id).to.equal('bob');
    });

    it('does not throw when asked to receive on a non-existant stream', () => {
        let sm = new protocol.StreamManager(undefined);
        expect(sm).to.be.instanceOf(protocol.StreamManager);
        let head = new protocol.Header(protocol.PayloadTypes.request, 0, 'bob', true);
        let stream1 = new protocol.Stream();
        stream1.write('hello');
        expect(sm.onReceive(head, stream1, 5)).to.not.throw;
    });

    it('attempts to receive from an existing stream', () => {
        let sm = new protocol.StreamManager(undefined);
        expect(sm).to.be.instanceOf(protocol.StreamManager);
        let head = new protocol.Header(protocol.PayloadTypes.request, 0, 'bob', true);
        let pa = sm.getPayloadAssembler('bob');
        expect(pa).to.be.instanceOf(protocol.ContentStreamAssembler);
        expect(pa.id).to.equal('bob');
        let stream1 = new protocol.Stream();
        stream1.write('hello');
        expect(sm.onReceive(head, stream1, 5)).to.not.throw;
    });

    it('can close a stream', (done) => {
        let sm = new protocol.StreamManager(done());
        expect(sm).to.be.instanceOf(protocol.StreamManager);
        let head = new protocol.Header(protocol.PayloadTypes.request, 0, 'bob', true);
        let pa = sm.getPayloadAssembler('bob');
        expect(pa).to.be.instanceOf(protocol.ContentStreamAssembler);
        expect(pa.id).to.equal('bob');
        let stream1 = new protocol.Stream();
        stream1.write('hello');
        expect(sm.closeStream(pa.id)).to.not.throw;
    });

    it('does not throw when asked to close a stream that does not exist', (done) => {
        let sm = new protocol.StreamManager(done());
        expect(sm).to.be.instanceOf(protocol.StreamManager);
        let head = new protocol.Header(protocol.PayloadTypes.request, 0, 'bob', true);
        expect(sm.closeStream(head.id)).to.not.throw;
    });
});