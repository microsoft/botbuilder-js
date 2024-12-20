const { SubscribableStream } = require('../lib/subscribableStream');
const { PayloadAssemblerManager, PayloadTypes, StreamManager } = require('../lib/payloads');
const { expect } = require('chai');

const streamManager = new StreamManager();

describe('PayloadAssemblerManager', function () {
    it('creates a response stream', function () {
        const p = new PayloadAssemblerManager(streamManager);
        const head = {
            payloadType: PayloadTypes.response,
            payloadLength: '42',
            id: '100',
            end: true,
        };

        expect(p.getPayloadStream(head)).to.be.instanceOf(SubscribableStream);
    });

    it('creates a request stream', function () {
        const p = new PayloadAssemblerManager(streamManager);
        const head = {
            payloadType: PayloadTypes.request,
            payloadLength: '42',
            id: '100',
            end: true,
        };

        expect(p.getPayloadStream(head)).to.be.instanceOf(SubscribableStream);
    });

    it('does not throw when receiving a request', function () {
        const p = new PayloadAssemblerManager(streamManager);
        const head = {
            payloadType: PayloadTypes.request,
            payloadLength: '42',
            id: '100',
            end: true,
        };
        const s = p.getPayloadStream(head);
        expect(s).to.be.instanceOf(SubscribableStream);
        expect(() => p.onReceive(head, s, 0)).to.not.throw();
    });

    it('does not throw when receiving a stream', function () {
        const p = new PayloadAssemblerManager(streamManager);
        const head = {
            payloadType: PayloadTypes.stream,
            payloadLength: '42',
            id: '100',
            end: true,
        };
        const s = p.getPayloadStream(head);

        expect(s).to.be.instanceOf(SubscribableStream);
        expect(() => p.onReceive(head, s, 0)).to.not.throw();
    });

    it('does not throw when receiving a response', function () {
        const p = new PayloadAssemblerManager(streamManager);
        const head = {
            payloadType: PayloadTypes.response,
            payloadLength: '42',
            id: '100',
            end: true,
        };
        const s = p.getPayloadStream(head);

        expect(s).to.be.instanceOf(SubscribableStream);
        expect(() => p.onReceive(head, s, 0)).to.not.throw();
    });

    it('returns undefined when asked to create an existing stream', function () {
        const p = new PayloadAssemblerManager(streamManager);
        const head = {
            payloadType: PayloadTypes.request,
            payloadLength: '42',
            id: '100',
            end: true,
        };
        const s = p.getPayloadStream(head);

        expect(s).to.be.instanceOf(SubscribableStream);
        expect(p.getPayloadStream(head)).to.equal(undefined);
    });
});
