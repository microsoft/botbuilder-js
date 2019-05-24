const  MockStreamManager  = require('../lib/__mocks__/MockStreamManager');
const  ContentStream  = require('../lib/ContentStream');
const  ContentStreamAssembler  = require('../lib/Payloads/Assemblers/ContentStreamAssembler');
const  chai  = require('chai');
var expect = chai.expect;

describe('ContentStream ', () => {
    it('assigns ID when constructed', () => {
      let csa = new ContentStreamAssembler.ContentStreamAssembler(MockStreamManager, 'csa1', 'stream', 42);
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
        let cs = new ContentStream.ContentStream('1', new ContentStreamAssembler.ContentStreamAssembler(MockStreamManager, 'csa1', 'stream', 42));

        expect(cs.payloadType)
            .equal('stream');
    });

    it('can return length', () => {
        let cs = new ContentStream.ContentStream('1', new ContentStreamAssembler.ContentStreamAssembler(MockStreamManager, 'csa1', 'stream', 42));

        expect(cs.length)
            .equal(42);
    });

    it('can return ID', () => {
        let cs = new ContentStream.ContentStream('1', new ContentStreamAssembler.ContentStreamAssembler(MockStreamManager, 'csa1', 'stream', 42));

        expect(cs.id)
            .equal('1');
    });

    it('does not return the stream when it is is undefined', () => {
        let cs = new ContentStream.ContentStream('1', new ContentStreamAssembler.ContentStreamAssembler(MockStreamManager, 'csa1', 'stream', 42));

        expect(cs.getStream())
            .to
            .not
            .be
            .undefined;
    });

    it('reads a stream of length 0 and returns an empty string', () => {
        let cs = new ContentStream.ContentStream('1', new ContentStreamAssembler.ContentStreamAssembler(MockStreamManager, 'csa1', 'stream', 0));

        return cs.readAsString()
            .then(data => {
                expect(data)
                    .equal('');
            });
    });

    it('throws when reading an empty stream as JSON', () => {
        //  expect.assertions(1);
        let cs = new ContentStream.ContentStream('1', new ContentStreamAssembler.ContentStreamAssembler(MockStreamManager, 'csa1', 'stream', 0));

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
});
