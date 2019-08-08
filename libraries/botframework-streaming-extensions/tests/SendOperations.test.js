const HttpContent = require('../lib/HttpContentStream');
const PayloadSender = require('../lib/PayloadTransport/PayloadSender');
const SubscribableStream = require('../lib/SubscribableStream');
const SendOperations = require('../lib/Payloads/SendOperations');
const StreamingRequest = require('../lib/StreamingRequest');
const  chai  = require('chai');
var expect = chai.expect;

describe('Streaming Extension SendOperations Tests', () => {
    it('constructs a new instance', () => {
        let ps = new PayloadSender.PayloadSender();
        let so = new SendOperations.SendOperations(ps);

        expect(so).to.be.instanceOf(SendOperations.SendOperations);
    });

    it('processes a send request operation', async (done) => {
        let ps = new PayloadSender.PayloadSender();
        let so = new SendOperations.SendOperations(ps);
        let r = new StreamingRequest.StreamingRequest();
        let stream1 = new SubscribableStream.SubscribableStream();
        stream1.write('hello');
        let headers = {contentLength: '5', contentType: 'text/plain'};
        let hc = new HttpContent.HttpContent(headers, stream1);
        r.addStream(hc);
        expect(so).to.be.instanceOf(SendOperations.SendOperations);
        so.sendRequest('test1', r).then(done());
    });

    it('processes a cancel stream operation', async (done) => {
        let ps = new PayloadSender.PayloadSender();
        let so = new SendOperations.SendOperations(ps);

        so.sendCancelStream('test1').then(done());
    });
});