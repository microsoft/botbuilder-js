const protocol = require('../lib');
const  chai  = require('chai');
var expect = chai.expect;

describe('Streaming Extension SendOperations Tests', () => {
    it('constructs a new instance', () => {
        let ps = new protocol.PayloadSender();
        let so = new protocol.SendOperations(ps);

        expect(so).to.be.instanceOf(protocol.SendOperations);
    });

    it('processes a send request operation', async (done) => {
        let ps = new protocol.PayloadSender();
        let so = new protocol.SendOperations(ps);
        let r = new protocol.Request();
        let stream1 = new protocol.Stream();
        stream1.write('hello');
        let headers = new protocol.HttpContentHeaders();
        headers.contentLength = '5';
        headers.contentType = 'text/plain'; 
        let hc = new protocol.HttpContent(headers, stream1);
        r.addStream(hc);
        expect(so).to.be.instanceOf(protocol.SendOperations);
        so.sendRequest('test1', r).then(done());
    });

    it('processes a cancel stream operation', async (done) => {
        let ps = new protocol.PayloadSender();
        let so = new protocol.SendOperations(ps);

        so.sendCancelStream('test1').then(done());
    });
});