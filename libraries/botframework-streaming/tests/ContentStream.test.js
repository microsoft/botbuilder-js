const  ContentStream  = require('../lib/contentStream');
const  PayloadAssembler  = require('../lib/assemblers/payloadAssembler');
const  chai  = require('chai');
const StreamManager = require('../lib/payloads/streamManager');
const SubscribableStream = require('../lib/subscribableStream');
const PayloadTypes = require('../lib/payloads/payloadTypes');
const protocol = require('../lib');
var expect = chai.expect;

class TestPayloadAssembler{
    constructor(content){
        this.stream1 = new SubscribableStream.SubscribableStream();
        if(content){
            this.stream1.write(content);
        } else {
            this.stream1.write('hello');
        }

        this.contentType = 'application/text';
        this.contentLength = 5;
    }

    getPayloadStream(){
        return this.stream1;
    }

    close(){}
}

describe('Streaming Extensions ContentStream Tests ', () => {
    it('assigns ID when constructed', () => {
        let csa = new PayloadAssembler.PayloadAssembler(new StreamManager.StreamManager(), {id:'csa1'});
        let cs = new ContentStream.ContentStream('1', csa);

        expect(cs.id)
            .equal('1');
    });

    it('throws if no assembler is passed in on construction', () => {
        expect(() => new ContentStream.ContentStream('1', undefined))
            .throws('Null Argument Exception');
    });

    it('can return payload type', () => {
        let header = {payloadType: PayloadTypes.PayloadTypes.stream, payloadLength: 42, id: '68e999ca-a651-40f4-ad8f-3aaf781862b4', end: true};
        let cs = new ContentStream.ContentStream('1', new PayloadAssembler.PayloadAssembler(new StreamManager.StreamManager(), {id:'csa1', header: header}));

        expect(cs.contentType)
            .equal('S');
    });

    it('can return length', () => {
        let header = {payloadType: PayloadTypes.PayloadTypes.stream, payloadLength: 42, id: '68e999ca-a651-40f4-ad8f-3aaf781862b4', end: true};
        let cs = new ContentStream.ContentStream('1', new PayloadAssembler.PayloadAssembler(new StreamManager.StreamManager(), {id:'csa1', header: header}));

        expect(cs.length)
            .equal(42);
    });

    it('can return ID', () => {
        let header = {payloadType: PayloadTypes.PayloadTypes.stream, payloadLength: 42, id: '68e999ca-a651-40f4-ad8f-3aaf781862b4', end: true};
        let cs = new ContentStream.ContentStream('1', new PayloadAssembler.PayloadAssembler(new StreamManager.StreamManager(), {id:'csa1', header: header}));

        expect(cs.id)
            .equal('1');
    });

    it('does not return the stream when it is is undefined', () => {
        let header = {PayloadType: PayloadTypes.PayloadTypes.stream, payloadLength: 42, id: '68e999ca-a651-40f4-ad8f-3aaf781862b4', end: true};
        let cs = new ContentStream.ContentStream('1', new PayloadAssembler.PayloadAssembler(new StreamManager.StreamManager(), {id:'csa1', header: header}));

        expect(cs.getStream())
            .to
            .not
            .be
            .undefined;
    });

    it('reads a stream of length 0 and returns an empty string', () => {
        let header = {payloadType: PayloadTypes.PayloadTypes.stream, payloadLength: 0, id: '68e999ca-a651-40f4-ad8f-3aaf781862b4', end: true};
        let cs = new ContentStream.ContentStream('1', new PayloadAssembler.PayloadAssembler(new StreamManager.StreamManager(), {id:'csa1', header: header}));

        return cs.readAsString()
            .then(data => {
                expect(data)
                    .equal('');
            });
    });

    it('throws when reading an empty stream as JSON', () => {
        let header = {payloadType: PayloadTypes.PayloadTypes.stream, PayloadLength: 0, id: '68e999ca-a651-40f4-ad8f-3aaf781862b4', end: true};
        let cs = new ContentStream.ContentStream('1', new PayloadAssembler.PayloadAssembler(new StreamManager.StreamManager(), {id:'csa1', header: header}));

        return cs.readAsJson()
            .then(data => {
                expect(data)
                    .to
                    .not
                    .be
                    .undefined;
            })
            .catch(err => {
                expect(err.toString())
                    .to
                    .equal('SyntaxError: Unexpected end of JSON input');
            });
    });

    it('reads a stream as a string',  () => {
        let cs = new ContentStream.ContentStream('cs1', new TestPayloadAssembler());
        let result = cs.readAsString();

        result.then(function(data) {
            expect(data).to.equal('hello');

        });
    });

    it('reads a stream as a json',  () => {
        let cs = new ContentStream.ContentStream('cs1', new TestPayloadAssembler('{"message":"hello"}'));
        let result = cs.readAsJson();

        result.then(function(data) {
            expect(data.message).to.equal('hello');

        });
    });

    it('reads a stream before receiving all the bits',  () => {
        let tcsa = new TestPayloadAssembler();
        tcsa.contentLength = 10;
        let cs = new ContentStream.ContentStream('cs1', tcsa);
        let result = cs.readAsString();

        result.then(function(data) {
            expect(data).to.equal('hello');

        });
    });

    it('can cancel',  () => {
        let cs = new ContentStream.ContentStream('cs1', new TestPayloadAssembler());
        let result = cs.readAsString();

        expect(cs.cancel()).to.not.throw;
    });
});
