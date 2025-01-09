const { PayloadAssembler } = require('../lib/assemblers');
const { PayloadTypes, StreamManager } = require('../lib/payloads');
const { SubscribableStream } = require('..');
const { expect } = require('../vendors/chai');

describe('StreamManager', function () {
    it('properly constructs a new instance', function () {
        const sm = new StreamManager();
        expect(sm).to.be.instanceOf(StreamManager);
    });

    it('creates and returns a new assembler when none currently exist', function () {
        const sm = new StreamManager();
        const pa = sm.getPayloadAssembler('bob');

        expect(pa).to.be.instanceOf(PayloadAssembler);
        expect(pa.id).to.equal('bob');
    });

    it('creates and returns a new assembler when others already exist', function () {
        const sm = new StreamManager();
        const pa = sm.getPayloadAssembler('Huey');
        expect(pa.id).to.equal('Huey');

        const pa2 = sm.getPayloadAssembler('Dewey');
        expect(pa2.id).to.equal('Dewey');

        const pa3 = sm.getPayloadAssembler('Louie');
        expect(pa3.id).to.equal('Louie');
    });

    it('looks up the correct assembler and returns the stream', function () {
        const sm = new StreamManager();
        const head = {
            payloadType: PayloadTypes.request,
            payloadLength: '0',
            id: 'bob',
            end: true,
        };
        const ps = sm.getPayloadStream(head);

        expect(ps).to.be.instanceOf(SubscribableStream);

        const pa = sm.getPayloadAssembler('bob');
        expect(pa.id).to.equal('bob');
    });

    it('does not throw when asked to receive on a non-existant stream', function () {
        const sm = new StreamManager();
        const head = {
            payloadType: PayloadTypes.request,
            payloadLength: '0',
            id: 'bob',
            end: true,
        };
        const stream = new SubscribableStream();
        stream.write('hello');
        expect(() => sm.onReceive(head, stream, 5)).to.not.throw();
    });

    it('attempts to receive from an existing stream', function () {
        const sm = new StreamManager();
        const head = {
            payloadType: PayloadTypes.request,
            payloadLength: '0',
            id: 'bob',
            end: true,
        };
        const pa = sm.getPayloadAssembler('bob');
        expect(pa.id).to.equal('bob');
        const stream = new SubscribableStream();
        stream.write('hello');
        expect(() => sm.onReceive(head, stream, 5)).to.not.throw();
    });

    it('can close a stream', function () {
        let called = false;
        const sm = new StreamManager(() => (called = true));
        const pa = sm.getPayloadAssembler('bob');

        expect(pa.id).to.equal('bob');
        const stream = new SubscribableStream();
        stream.write('hello');
        expect(() => sm.closeStream(pa.id)).to.not.throw();
        expect(called).to.equal(true);
    });

    it('does not throw when asked to close a stream that does not exist', function () {
        let called = false;
        const sm = new StreamManager(() => (called = true));
        const head = {
            payloadType: PayloadTypes.request,
            payloadLength: '0',
            id: 'bob',
            end: true,
        };
        expect(() => sm.closeStream(head.id)).to.not.throw();
        expect(called).to.equal(false);
    });
});
