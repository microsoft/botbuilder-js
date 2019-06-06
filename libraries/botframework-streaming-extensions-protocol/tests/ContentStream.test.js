const  ContentStream  = require('../lib/ContentStream');
const  ContentStreamAssembler  = require('../lib/Payloads/Assemblers/ContentStreamAssembler');
const  chai  = require('chai');
const StreamManager = require('../lib/Payloads/StreamManager');
const protocol = require('../lib');
var expect = chai.expect;

class TestContentStreamAssembler{
    constructor(content){
        this.stream1 = new protocol.Stream();
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
        let csa = new ContentStreamAssembler.ContentStreamAssembler(new StreamManager.StreamManager(), 'csa1', 'stream', 42);
        let cs = new ContentStream.ContentStream('1', csa);

        expect(cs.id)
            .equal('1');
    });

    it('throws if no assembler is passed in on construction', () => {
        // expect.assertions(1);
        expect(() => new ContentStream.ContentStream('1', undefined))
            .throws('Null Argument Exception');
    });

    it('can return payload type', () => {
        let cs = new ContentStream.ContentStream('1', new ContentStreamAssembler.ContentStreamAssembler(new StreamManager.StreamManager(), 'csa1', 'stream', 42));

        expect(cs.type)
            .equal('stream');
    });

    it('can return length', () => {
        let cs = new ContentStream.ContentStream('1', new ContentStreamAssembler.ContentStreamAssembler(new StreamManager.StreamManager(), 'csa1', 'stream', 42));

        expect(cs.length)
            .equal(42);
    });

    it('can return ID', () => {
        let cs = new ContentStream.ContentStream('1', new ContentStreamAssembler.ContentStreamAssembler(new StreamManager.StreamManager(), 'csa1', 'stream', 42));

        expect(cs.id)
            .equal('1');
    });

    it('does not return the stream when it is is undefined', () => {
        let cs = new ContentStream.ContentStream('1', new ContentStreamAssembler.ContentStreamAssembler(new StreamManager.StreamManager(), 'csa1', 'stream', 42));

        expect(cs.getStream())
            .to
            .not
            .be
            .undefined;
    });

    it('reads a stream of length 0 and returns an empty string', () => {
        let cs = new ContentStream.ContentStream('1', new ContentStreamAssembler.ContentStreamAssembler(new StreamManager.StreamManager(), 'csa1', 'stream', 0));

        return cs.readAsString()
            .then(data => {
                expect(data)
                    .equal('');
            });
    });

    it('throws when reading an empty stream as JSON', () => {
        //  expect.assertions(1);
        let cs = new ContentStream.ContentStream('1', new ContentStreamAssembler.ContentStreamAssembler(new StreamManager.StreamManager(), 'csa1', 'stream', 0));

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
        let cs = new protocol.ContentStream('cs1', new TestContentStreamAssembler());
        let result = cs.readAsString();

        result.then(function(data) {
            expect(data).to.equal('hello');
        
        });
    });

    it('reads a stream as a json',  () => {
        let cs = new protocol.ContentStream('cs1', new TestContentStreamAssembler('{"message":"hello"}'));
        let result = cs.readAsJson();

        result.then(function(data) {
            expect(data.message).to.equal('hello');
        
        });
    });

    it('reads a stream before receiving all the bits',  () => {
        let tcsa = new TestContentStreamAssembler();
        tcsa.contentLength = 10;
        let cs = new protocol.ContentStream('cs1', tcsa);
        let result = cs.readAsString();

        result.then(function(data) {
            expect(data).to.equal('hello');
        
        });
    });

    it('reads a stream as a buffer',  () => {
        let cs = new protocol.ContentStream('cs1', new TestContentStreamAssembler());
        let result = cs.readAsBuffer();

        result.then(function(data) {
            expect(data).to.be.instanceOf(Buffer);
        
        });
    });

    it('can cancel',  () => {
        let cs = new protocol.ContentStream('cs1', new TestContentStreamAssembler());
        let result = cs.readAsString();

        expect(cs.cancel()).to.not.throw;                
    });
});
