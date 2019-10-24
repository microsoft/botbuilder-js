const StreamingRequest = require( '../lib/streamingRequest');
const HttpContent = require('../lib/httpContentStream');
const SubscribableStream = require('../lib/subscribableStream');
const chai = require( 'chai');
var expect = chai.expect;


describe('Streaming Extensions Request tests', () => {
    it('creates a new request with undefined properties', () => {
        let r = new StreamingRequest.StreamingRequest();
        expect(r.path)
            .equal(undefined);
        expect(r.verb)
            .equal(undefined);
    });

    it('creates a new instance and a new stream', () => {
        let stream1 = new SubscribableStream.SubscribableStream();
        stream1.write('hello');
        let headers = {contentLength: '5', contentType: 'text/plain'};
        let hc = new HttpContent.HttpContent(headers, stream1);
        let r = StreamingRequest.StreamingRequest.create('POST', 'some/where', 'hello');

        expect(r).to.be.instanceOf(StreamingRequest.StreamingRequest);
        expect(r.verb).to.equal('POST');
        expect(r.path).to.equal('some/where');
    });

    it('creates a new instance with an existing stream', () => {
        let stream1 = new SubscribableStream.SubscribableStream();
        stream1.write('hello');
        let headers = {contentLength: '5', contentType: 'text/plain'};
        let hc = new HttpContent.HttpContent(headers, stream1);
        let r = StreamingRequest.StreamingRequest.create('POST', 'some/where', hc);

        expect(r).to.be.instanceOf(StreamingRequest.StreamingRequest);
        expect(r.verb).to.equal('POST');
        expect(r.path).to.equal('some/where');
    });

    it('throws when adding an undefined stream to an existing request', () => {
        let stream1 = new SubscribableStream.SubscribableStream();
        stream1.write('hello');
        let headers = {contentLength: '5', contentType: 'text/plain'};
        let hc = new HttpContent.HttpContent(headers, stream1);
        let r = StreamingRequest.StreamingRequest.create('POST', 'some/where', 'hello');

        expect(r).to.be.instanceOf(StreamingRequest.StreamingRequest);
        expect(r.verb).to.equal('POST');
        expect(r.path).to.equal('some/where');

        try{
            r.addStream(undefined);
        }
        catch(err) {
            expect(err.message).to.equal('Argument Undefined Exception: content undefined.');
        }
    });

    it('throws when attempting to add undefined streams', () => {
        let r = new StreamingRequest.StreamingRequest();

        expect(() => { r.addStream(undefined); })
            .throws;
    });

    it('is able to add streams to the request', () => {
        let r = new StreamingRequest.StreamingRequest();
        let h;
        let s = new SubscribableStream.SubscribableStream();
        let c = new HttpContent.HttpContent(h, s);

        r.addStream(c);

        expect(r.streams.length)
            .equals(1);
        expect(r.streams[0].content.getStream())
            .equals(c.getStream());
    });

    it('creates the right verb', () => {
        let r = StreamingRequest.StreamingRequest.create('GET');

        expect(r.verb)
            .equals('GET');
    });

    it('creates the right path', () => {
        let r = StreamingRequest.StreamingRequest.create('GET', 'happy');

        expect(r.path)
            .equals('happy');
    });

    it('gets the unaltered stream', () => {
        let h = {contentType: 'stuff'};
        let s = new SubscribableStream.SubscribableStream();
        s.push('text');
        let b = new HttpContent.HttpContent(h, s);
        let r = StreamingRequest.StreamingRequest.create('POST');
        r.addStream(b);

        expect(b.getStream())
            .equals(s);
    });

    it('can create a request with a body', () => {
        let h = {contentType: 'stuff'};
        let s = new SubscribableStream.SubscribableStream();
        s.push('text');
        let b = new HttpContent.HttpContent(h, s);
        let sb = JSON.stringify(b);
        let r = StreamingRequest.StreamingRequest.create('POST');
        r.addStream(b);
        let c = new HttpContent.HttpContentStream(b);

        expect(r.streams[0].content.getStream())
            .equals(b.getStream());
    });
});
