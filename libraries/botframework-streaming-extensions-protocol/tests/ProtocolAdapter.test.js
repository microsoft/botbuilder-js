const ProtocolAdapter = require('../lib/ProtocolAdapter');
const RequestManager = require('../lib/Payloads/RequestManager');
const PayloadSender = require('../lib/PayloadTransport/PayloadSender');
const PaylaodReceiver = require('../lib/PayloadTransport/PayloadReceiver');
const RequestHandler = require('../lib/RequestHandler');
const Response = require('../lib/Response');
const Request = require('../lib/Request');
const ReceiveResponse = require('../lib/ReceiveResponse');
const CancellationToken  = require('../lib/CancellationToken')
const protocol = require('../lib');
const  chai  = require('chai');
var expect = chai.expect;

class TestRequestHandler extends RequestHandler.RequestHandler {
    constructor(){
        super();
    }
    async processRequestAsync(request, logger) {
        let response = new Response.Response();
        response.statusCode = 111;
        response.setBody("Test body.");

        return response;
    }
}

class TestRequestManager {
    constructor(){ }
    getResponseAsync() {
        return new protocol.ReceiveResponse();
    }
}

describe('ProtocolAdapter', () => {
    it('constructs properly.', () => {
        let requestHandler = new RequestHandler.RequestHandler();
        let requestManager = new RequestManager.RequestManager();
        let payloadSender = new PayloadSender.PayloadSender();
        let paylaodReceiver = new PaylaodReceiver.PayloadReceiver();
        let protocolAdapter = new ProtocolAdapter.ProtocolAdapter(
            requestHandler,
            requestManager,
            payloadSender,
            paylaodReceiver);

        expect(protocolAdapter.assemblerManager)
            .to
            .not
            .be
            .undefined;

        expect(protocolAdapter.payloadReceiver)
            .to
            .not
            .be
            .undefined;

        expect(protocolAdapter.payloadSender)
            .to
            .not
            .be
            .undefined;

        expect(protocolAdapter.sendOperations)
            .to
            .not
            .be
            .undefined;

        expect(protocolAdapter.streamManager)
            .to
            .not
            .be
            .undefined;

        expect(protocolAdapter.requestHandler)
            .to
            .not
            .be
            .undefined;

        expect(protocolAdapter.requestManager)
            .to
            .not
            .be
            .undefined;
    });

    it('processes requests.', async (done) => {
        let requestHandler = new TestRequestHandler();
        let requestManager = new RequestManager.RequestManager();
        let payloadSender = new PayloadSender.PayloadSender();
        let paylaodReceiver = new PaylaodReceiver.PayloadReceiver();
        let protocolAdapter = new ProtocolAdapter.ProtocolAdapter(
            requestHandler,
            requestManager,
            payloadSender,
            paylaodReceiver);

        protocolAdapter.onReceiveRequest('42', new ReceiveResponse.ReceiveResponse()).then(done());
    });

    it('sends requests.', async (done) => {
        let requestHandler = new TestRequestHandler();
        let requestManager = new TestRequestManager();
        let payloadSender = new PayloadSender.PayloadSender();
        let paylaodReceiver = new PaylaodReceiver.PayloadReceiver();
        let protocolAdapter = new ProtocolAdapter.ProtocolAdapter(
            requestHandler,
            requestManager,
            payloadSender,
            paylaodReceiver);

        let rr = protocolAdapter.sendRequestAsync(new Request.Request(), new CancellationToken.CancellationToken()).then(done());
        expect(rr).to.be.instanceOf(protocol.ReceiveResponse);
    });

    it('cancels a stream', () => {
        let requestHandler = new TestRequestHandler();
        let requestManager = new RequestManager.RequestManager();
        let payloadSender = new PayloadSender.PayloadSender();
        let paylaodReceiver = new PaylaodReceiver.PayloadReceiver();
        let protocolAdapter = new ProtocolAdapter.ProtocolAdapter(
            requestHandler,
            requestManager,
            payloadSender,
            paylaodReceiver);

        let pa = new protocol.PayloadAssembler('stream1');
        expect(protocolAdapter.onCancelStream(pa)).to.not.throw;
    });

    it('can receive a response', async (done) => {
        let requestHandler = new TestRequestHandler();
        let requestManager = new RequestManager.RequestManager();
        let payloadSender = new PayloadSender.PayloadSender();
        let paylaodReceiver = new PaylaodReceiver.PayloadReceiver();
        let protocolAdapter = new ProtocolAdapter.ProtocolAdapter(
            requestHandler,
            requestManager,
            payloadSender,
            paylaodReceiver);

        let pa = new protocol.PayloadAssembler('stream1');
        protocolAdapter.onReceiveResponse('stream1', new protocol.ReceiveResponse()).then(done());
    });
});