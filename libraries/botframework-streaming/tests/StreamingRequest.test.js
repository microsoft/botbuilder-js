const StreamingRequest = require('../lib/streamingRequest');
const HttpContent = require('../lib/httpContentStream');
const SubscribableStream = require('../lib/subscribableStream');
const chai = require('chai');
const expect = chai.expect;

describe('Streaming Extensions Request tests', function () {
    it('creates a new request with undefined properties', function () {
        const r = new StreamingRequest.StreamingRequest();
        expect(r.path).equal(undefined);
        expect(r.verb).equal(undefined);
    });

    it('creates a new instance and a new stream', function () {
        const r = StreamingRequest.StreamingRequest.create('POST', 'some/where', 'hello');

        expect(r).to.be.instanceOf(StreamingRequest.StreamingRequest);
        expect(r.verb).to.equal('POST');
        expect(r.path).to.equal('some/where');
    });

    it('creates a new instance with an existing stream', function () {
        const stream1 = new SubscribableStream.SubscribableStream();
        stream1.write('hello');
        const headers = { contentLength: '5', contentType: 'text/plain' };
        const hc = new HttpContent.HttpContent(headers, stream1);
        const r = StreamingRequest.StreamingRequest.create('POST', 'some/where', hc);

        expect(r).to.be.instanceOf(StreamingRequest.StreamingRequest);
        expect(r.verb).to.equal('POST');
        expect(r.path).to.equal('some/where');
    });

    it('throws when adding an undefined stream to an existing request', function () {
        const r = StreamingRequest.StreamingRequest.create('POST', 'some/where', 'hello');

        expect(r).to.be.instanceOf(StreamingRequest.StreamingRequest);
        expect(r.verb).to.equal('POST');
        expect(r.path).to.equal('some/where');

        expect(() => r.addStream(undefined)).to.throw('Argument Undefined Exception: content undefined.');
    });

    it('throws when attempting to add undefined streams', function () {
        const r = new StreamingRequest.StreamingRequest();

        expect(() => {
            r.addStream(undefined);
        }).throws;
    });

    it('is able to add streams to the request', function () {
        const r = new StreamingRequest.StreamingRequest();
        let h;
        const s = new SubscribableStream.SubscribableStream();
        const c = new HttpContent.HttpContent(h, s);

        r.addStream(c);

        expect(r.streams.length).equals(1);
        expect(r.streams[0].content.getStream()).equals(c.getStream());
    });

    it('creates the right verb', function () {
        const r = StreamingRequest.StreamingRequest.create('GET');

        expect(r.verb).equals('GET');
    });

    it('creates the right path', function () {
        const r = StreamingRequest.StreamingRequest.create('GET', 'happy');

        expect(r.path).equals('happy');
    });

    it('gets the unaltered stream', function () {
        const h = { contentType: 'stuff' };
        const s = new SubscribableStream.SubscribableStream();
        s.push('text');
        const b = new HttpContent.HttpContent(h, s);
        const r = StreamingRequest.StreamingRequest.create('POST');
        r.addStream(b);

        expect(b.getStream()).equals(s);
    });

    it('can create a request with a body', function () {
        const h = { contentType: 'stuff' };
        const s = new SubscribableStream.SubscribableStream();
        s.push('text');
        const b = new HttpContent.HttpContent(h, s);
        const r = StreamingRequest.StreamingRequest.create('POST');
        r.addStream(b);

        expect(r.streams[0].content.getStream()).equals(b.getStream());
    });
});
