const PayloadAssembler = require('../lib/assemblers');
const ProtocolAdapter = require('../lib/protocolAdapter');
const RequestManager = require('../lib/payloads/requestManager');
const PayloadSender = require('../lib/payloadTransport/payloadSender');
const PayloadReceiver = require('../lib/payloadTransport/payloadReceiver');
const PayloadConstants = require('../lib/payloads/payloadConstants');
const SubscribableStream = require('../lib/subscribableStream');
const RequestHandler = require('../lib/requestHandler');
const Response = require('../lib/streamingResponse');
const Request = require('../lib/streamingRequest');
const StreamManager = require('../lib/payloads/streamManager');
const { expect } = require('chai');
const sinon = require('sinon');

class TestRequestHandler extends RequestHandler.RequestHandler {
    constructor() {
        super();
    }
    processRequest(_request, _logger) {
        const response = new Response.StreamingResponse();
        response.statusCode = 111;
        response.setBody('Test body.');

        return response;
    }
}

class TestRequestManager {
    constructor() {}
    getResponse() {
        const response = { statusCode: 200 };
        return response;
    }
}

class TestPayloadSender {
    constructor() {}
    sendPayload() {
        return;
    }
}

describe('Streaming Extensions ProtocolAdapter', function () {
    it('constructs properly.', function () {
        const requestHandler = new RequestHandler.RequestHandler();
        const requestManager = new RequestManager.RequestManager();
        const payloadSender = new PayloadSender.PayloadSender();
        const payloadReceiver = new PayloadReceiver.PayloadReceiver();
        const protocolAdapter = new ProtocolAdapter.ProtocolAdapter(
            requestHandler,
            requestManager,
            payloadSender,
            payloadReceiver,
        );

        expect(protocolAdapter.assemblerManager).to.not.equal(undefined);

        expect(protocolAdapter.payloadReceiver).to.not.equal(undefined);

        expect(protocolAdapter.payloadSender).to.not.equal(undefined);

        expect(protocolAdapter.sendOperations).to.not.equal(undefined);

        expect(protocolAdapter.streamManager).to.not.equal(undefined);

        expect(protocolAdapter.requestHandler).to.not.equal(undefined);

        expect(protocolAdapter.requestManager).to.not.equal(undefined);
    });

    it('processes requests.', async function () {
        const requestHandler = new TestRequestHandler();
        const requestManager = new RequestManager.RequestManager();
        const payloadSender = new PayloadSender.PayloadSender();
        const payloadReceiver = {
            subscribe: function () {},
        };
        const protocolAdapter = new ProtocolAdapter.ProtocolAdapter(
            requestHandler,
            requestManager,
            payloadSender,
            payloadReceiver,
        );

        const requestHandlerSpy = sinon.spy(requestHandler, 'processRequest');

        protocolAdapter.onReceiveRequest('42', { verb: 'POST', path: '/api/messages', streams: [] });
        expect(requestHandlerSpy.called).to.equal(true);
    });

    it('processes responses.', async function () {
        const requestHandler = new TestRequestHandler();
        const requestManager = new RequestManager.RequestManager();
        const payloadSender = new PayloadSender.PayloadSender();
        const payloadReceiver = {
            subscribe: function () {},
        };
        const protocolAdapter = new ProtocolAdapter.ProtocolAdapter(
            requestHandler,
            requestManager,
            payloadSender,
            payloadReceiver,
        );

        const requestManagerSpy = sinon.spy(requestManager, 'signalResponse');

        protocolAdapter.onReceiveResponse('42', { statusCode: '200', streams: [] });
        expect(requestManagerSpy.called).to.equal(true);
    });

    it('does not throw when processing a cancellation for an already processed stream', async function () {
        const requestHandler = new TestRequestHandler();
        const requestManager = new RequestManager.RequestManager();
        const payloadSender = new PayloadSender.PayloadSender();
        const payloadReceiver = {
            subscribe: function () {},
        };
        const protocolAdapter = new ProtocolAdapter.ProtocolAdapter(
            requestHandler,
            requestManager,
            payloadSender,
            payloadReceiver,
        );
        const header = { payloadType: 'A', payloadLength: '5', id: '100', end: true };
        const assembler = new PayloadAssembler.PayloadAssembler(new StreamManager.StreamManager(), {
            header: header,
            onCompleted: function () {},
        });

        expect(() => protocolAdapter.onCancelStream(assembler)).to.not.throw();
    });

    it('sends requests.', async function () {
        const requestHandler = new TestRequestHandler();
        const requestManager = new TestRequestManager();
        const payloadSender = new TestPayloadSender();
        const payloadReceiver = new PayloadReceiver.PayloadReceiver();
        const protocolAdapter = new ProtocolAdapter.ProtocolAdapter(
            requestHandler,
            requestManager,
            payloadSender,
            payloadReceiver,
        );

        expect(() => protocolAdapter.sendRequest(new Request.StreamingRequest())).to.not.throw();
    });

    it('payloadreceiver ignores duplicate connections', function () {
        const pa = new PayloadReceiver.PayloadReceiver();
        const buffer = Buffer.alloc(Number(PayloadConstants.PayloadConstants.MaxHeaderLength));
        buffer.write('A.000168.68e999ca-a651-40f4-ad8f-3aaf781862b4.1\n');
        const receiver = {
            receive: function () {
                return buffer;
            },
            close: function () {
                throw new Error('Test error!');
            },
        };
        const s = new SubscribableStream.SubscribableStream();
        s.write(
            '{"statusCode": "12345","streams": [{"id": "1","contentType": "text","length": "2"},{"id": "2","contentType": "text","length": "2"},{"id": "3","contentType": "text","length": "2"}]}',
        );
        const rp = { verb: 'POST', path: '/some/path' };
        rp.streams = [];
        rp.streams.push(s);

        pa.connect(receiver);
        expect(pa.isConnected).to.equal(true);
        expect(() => pa.connect(receiver)).to.not.throw();

        pa.disconnect();
    });
});
