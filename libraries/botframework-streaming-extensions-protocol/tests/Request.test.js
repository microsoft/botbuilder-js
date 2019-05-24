const { ReceiveRequest, Request, HttpContent, HttpContentHeaders, Stream, HttpContentStream } = require( '../lib');
const chai = require( 'chai');
var expect = chai.expect;

describe('ReceiveRequest', function() {
    it('constructs a new ReceiveRequest without streams', () => {
        let r = new ReceiveRequest();
        expect(r.Streams)
            .to
            .be
            .an('array')
            .that
            .is
            .empty;
    });

    it('constructs a new ReceiveRequest with undefined properties', () => {
        let r = new ReceiveRequest();
        expect(r.Path)
            .equal(undefined);
        expect(r.Verb)
            .equal(undefined);
    });
});

describe('Request', () => {
    it('creates a new request with undefined properties', () => {
        let r = new Request();
        expect(r.Path)
            .equal(undefined);
        expect(r.Verb)
            .equal(undefined);
    });

    it('throws when attempting to add undefined streams', () => {
        let r = new Request();

        expect(() => { r.addStream(undefined); })
            .throws;
    });

    it('is able to add streams to the request', () => {
        let r = new Request();
        let h = new HttpContentHeaders();
        let s = new Stream();
        let c = new HttpContent(h, s);

        r.addStream(c);

        expect(r.Streams.length)
            .equals(1);
        expect(r.Streams[0].content.getStream())
            .equals(c.getStream());
    });

    it('creates the right verb', () => {
        let r = Request.create('GET');

        expect(r.Verb)
            .equals('GET');
    });

    it('creates the right path', () => {
        let r = Request.create('GET', 'happy');

        expect(r.Path)
            .equals('happy');
    });

    it('gets the unaltered stream', () => {
        let h = new HttpContentHeaders();
        h.contentType = 'stuff';
        let s = new Stream();
        s.push('text');
        let b = new HttpContent(h, s);
        let r = Request.create('POST');
        r.addStream(b);

        expect(b.getStream())
            .equals(s);
    });

    it('can create a request with a body', () => {
        let h = new HttpContentHeaders();
        h.contentType = 'stuff';
        let s = new Stream();
        s.push('text');
        let b = new HttpContent(h, s);
        let sb = JSON.stringify(b);
        let r = Request.create('POST');
        r.addStream(b);
        let c = new HttpContentStream(b);

        expect(r.Streams[0].content.getStream())
            .equals(b.getStream());
    });
});
