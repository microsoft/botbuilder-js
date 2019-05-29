const ProtocolAdapter = require('../lib/ProtocolAdapter');
const RequestManager = require('../lib/Payloads/RequestManager');
const PayloadSender = require('../lib/PayloadTransport/PayloadSender');
const PaylaodReceiver = require('../lib/PayloadTransport/PayloadReceiver');
const RequestHandler = require('../lib/RequestHandler');
const Response = require('../lib/Response');
const Request = require('../lib/Request');
const ReceiveResponse = require('../lib/ReceiveResponse');
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

    it('processes requests.', (done) => {
                let requestHandler = new TestRequestHandler();
                let requestManager = new RequestManager.RequestManager();
                let payloadSender = new PayloadSender.PayloadSender();
                let paylaodReceiver = new PaylaodReceiver.PayloadReceiver();
                let protocolAdapter = new ProtocolAdapter.ProtocolAdapter(
                    requestHandler,
                    requestManager,
                    payloadSender,
                    paylaodReceiver);

                protocolAdapter.onReceiveRequest('42', new ReceiveResponse.ReceiveResponse());
                done();
    });

    it('sends requests.', (done) => {
        let requestHandler = new TestRequestHandler();
        let requestManager = new RequestManager.RequestManager();
        let payloadSender = new PayloadSender.PayloadSender();
        let paylaodReceiver = new PaylaodReceiver.PayloadReceiver();
        let protocolAdapter = new ProtocolAdapter.ProtocolAdapter(
            requestHandler,
            requestManager,
            payloadSender,
            paylaodReceiver);

        protocolAdapter.sendRequestAsync(new Request.Request());
        done();
});
});