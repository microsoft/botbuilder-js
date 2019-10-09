const PayloadAssembler = require('../lib/Assemblers/PayloadAssembler');
const ProtocolAdapter = require('../lib/ProtocolAdapter');
const RequestManager = require('../lib/Payloads/RequestManager');
const PayloadSender = require('../lib/PayloadTransport/PayloadSender');
const PayloadReceiver = require('../lib/PayloadTransport/PayloadReceiver');
const PayloadConstants = require('../lib/Payloads/PayloadConstants');
const SubscribableStream = require('../lib/SubscribableStream');
const RequestHandler = require('../lib/RequestHandler');
const Response = require('../lib/StreamingResponse');
const Request = require('../lib/StreamingRequest');
const StreamManager = require('../lib/Payloads/StreamManager');
const  chai  = require('chai');
var sinon = require('sinon');
var expect = chai.expect;

class TestRequestHandler extends RequestHandler.RequestHandler {
    constructor(){
        super();
    }
    processRequest(request, logger) {
        let response = new Response.StreamingResponse();
        response.statusCode = 111;
        response.setBody('Test body.');

        return response;
    }
}

class TestRequestManager {
    constructor(){ }
    getResponse() {
        let response = {statusCode: 200};
        return response;
    }
}

class TestPayloadSender {
    constructor() {}
    sendPayload(){
        return;
    }
}

describe('Streaming Extensions ProtocolAdapter', () => {
    it('constructs properly.', () => {
        let requestHandler = new RequestHandler.RequestHandler();
        let requestManager = new RequestManager.RequestManager();
        let payloadSender = new PayloadSender.PayloadSender();
        let paylaodReceiver = new PayloadReceiver.PayloadReceiver();
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

    it('processes requests.', async () => {
        let requestHandler = new TestRequestHandler();
        let requestManager = new RequestManager.RequestManager();
        let payloadSender = new PayloadSender.PayloadSender();
        let paylaodReceiver = {
            subscribe: function(){},
        };
        let protocolAdapter = new ProtocolAdapter.ProtocolAdapter(
            requestHandler,
            requestManager,
            payloadSender,
            paylaodReceiver);

        var requestHandlerSpy = sinon.spy(requestHandler, 'processRequest');

        protocolAdapter.onReceiveRequest('42', {verb: 'POST', path: '/api/messages', streams: [] });
        expect(requestHandlerSpy.called).to.be.true;
    });

    it('processes responses.', async () => {
        let requestHandler = new TestRequestHandler();
        let requestManager = new RequestManager.RequestManager();
        let payloadSender = new PayloadSender.PayloadSender();
        let paylaodReceiver = {
            subscribe: function(){},
        };
        let protocolAdapter = new ProtocolAdapter.ProtocolAdapter(
            requestHandler,
            requestManager,
            payloadSender,
            paylaodReceiver);

        var requestManagerSpy = sinon.spy(requestManager, 'signalResponse');

        protocolAdapter.onReceiveResponse('42', {statusCode: '200', streams: [] });
        expect(requestManagerSpy.called).to.be.true;
    });

    it('does not throw when processing a cancellation for an already processed stream', async () => {
        let requestHandler = new TestRequestHandler();
        let requestManager = new RequestManager.RequestManager();
        let payloadSender = new PayloadSender.PayloadSender();
        let paylaodReceiver = {
            subscribe: function(){},
        };
        let protocolAdapter = new ProtocolAdapter.ProtocolAdapter(
            requestHandler,
            requestManager,
            payloadSender,
            paylaodReceiver);
        let header = {payloadType: 'A', payloadLength: '5', id: '100', end: true};
        let assembler = new PayloadAssembler.PayloadAssembler(new StreamManager.StreamManager(), {header: header, onCompleted: function() {} });

        expect(protocolAdapter.onCancelStream(assembler)).to.not.throw;
    });

    it('sends requests.', async (done) => {
        let requestHandler = new TestRequestHandler();
        let requestManager = new TestRequestManager();
        let payloadSender = new TestPayloadSender();
        let paylaodReceiver = new PayloadReceiver.PayloadReceiver();
        let protocolAdapter = new ProtocolAdapter.ProtocolAdapter(
            requestHandler,
            requestManager,
            payloadSender,
            paylaodReceiver);

        expect(protocolAdapter.sendRequest(new Request.StreamingRequest()))
            .to.not.throw;
        done();
    });

    it('payloadreceiver responds with an error when told to connect twice', () => {
        let pa = new PayloadReceiver.PayloadReceiver();
        let buffer =Buffer.alloc(Number(PayloadConstants.PayloadConstants.MaxHeaderLength));
        buffer.write('A.000168.68e999ca-a651-40f4-ad8f-3aaf781862b4.1\n');
        let receiver = {

            receive: function(){return buffer;},
            close: function(){throw new Error('Test error!');},

        };
        let s = new SubscribableStream.SubscribableStream();
        s.write('{"statusCode": "12345","streams": [{"id": "1","contentType": "text","length": "2"},{"id": "2","contentType": "text","length": "2"},{"id": "3","contentType": "text","length": "2"}]}');
        let rp = {verb: 'POST', path: '/some/path'};
        rp.streams = [];
        rp.streams.push(s);


        pa.connect(receiver);

        expect(pa.isConnected).to.be.true;
        try
        {
            pa.connect(receiver);
        } catch(result) {
            expect(result.message).to.equal('Already connected.');
        }

        pa.disconnect();
    });
});
