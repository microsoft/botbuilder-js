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
const protocol = require('../lib');
const  chai  = require('chai');
var expect = chai.expect;

class TestRequestHandler extends RequestHandler.RequestHandler {
    constructor(){
        super();
    }
    processRequest(request, logger) {
        let response = new Response.StreamingResponse();
        response.statusCode = 111;
        response.setBody("Test body.");

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

    // it('processes requests.', async (done) => {
    //     let requestHandler = new TestRequestHandler();
    //     let requestManager = new RequestManager.RequestManager();
    //     let payloadSender = new PayloadSender.PayloadSender();
    //     let paylaodReceiver = {
    //         subscribe: function(){},
    //     };
    //     let protocolAdapter = new ProtocolAdapter.ProtocolAdapter(
    //         requestHandler,
    //         requestManager,
    //         payloadSender,
    //         paylaodReceiver);

    //     paylaodReceiver
    // });

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

    // it('cancels a stream', () => {
    //     let requestHandler = new TestRequestHandler();
    //     let requestManager = new RequestManager.RequestManager();
    //     let payloadSender = new PayloadSender.PayloadSender();
    //     let paylaodReceiver = new PayloadReceiver.PayloadReceiver();
    //     let protocolAdapter = new ProtocolAdapter.ProtocolAdapter(
    //         requestHandler,
    //         requestManager,
    //         payloadSender,
    //         paylaodReceiver);

    //     let pa = new PayloadAssembler.PayloadAssembler('stream1');
    //     expect(protocolAdapter.onCancelStream(pa)).to.not.throw;
    // });

    // it('can receive a response', async (done) => {
    //     let requestHandler = new TestRequestHandler();
    //     let requestManager = new RequestManager.RequestManager();
    //     let payloadSender = new PayloadSender.PayloadSender();
    //     let paylaodReceiver = new PayloadReceiver.PayloadReceiver();
    //     let protocolAdapter = new ProtocolAdapter.ProtocolAdapter(
    //         requestHandler,
    //         requestManager,
    //         payloadSender,
    //         paylaodReceiver);

    //     let pa = new PayloadAssembler.PayloadAssembler('stream1');
    //     protocolAdapter.onReceiveResponse('stream1', new protocol.ReceiveResponse()).then(done());
    // });

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