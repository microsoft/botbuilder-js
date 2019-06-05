const protocol = require('../lib');
const  chai  = require('chai');
var expect = chai.expect;

describe('Streaming Extensions Response Tests', () => {

    it('creates a new instance', () => {
        let stream1 = new protocol.Stream();
        stream1.write('hello');
        let headers = new protocol.HttpContentHeaders();
        headers.contentLength = '5';
        headers.contentType = 'text/plain'; 
        let hc = new protocol.HttpContent(headers, stream1);
        let r = protocol.Response.create(200, hc);

        expect(r).to.be.instanceOf(protocol.Response);
        expect(r.statusCode).to.equal(200);
    });
});