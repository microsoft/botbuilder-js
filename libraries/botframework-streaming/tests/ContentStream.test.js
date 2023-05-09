const { ContentStream } = require('../lib/contentStream');
const { PayloadAssembler } = require('../lib/assemblers');
const { PayloadTypes } = require('../lib/payloads/payloadTypes');
const { StreamManager } = require('../lib/payloads/streamManager');
const { SubscribableStream } = require('../lib/subscribableStream');
const { expect } = require('chai');

class TestPayloadAssembler {
    constructor(content) {
        this.stream1 = new SubscribableStream();
        if (content) {
            this.stream1.write(content);
        } else {
            this.stream1.write('hello');
        }

        this.contentType = 'application/text';
        this.contentLength = 5;
    }

    getPayloadStream() {
        return this.stream1;
    }

    close() {}
}

describe('Streaming Extensions ContentStream Tests ', function () {
    const streamManager = new StreamManager();

    const header = {
        payloadType: PayloadTypes.stream,
        payloadLength: 42,
        id: '68e999ca-a651-40f4-ad8f-3aaf781862b4',
        end: true,
    };

    it('assigns ID when constructed', function () {
        const csa = new PayloadAssembler(streamManager, { id: 'csa1' });
        const cs = new ContentStream('1', csa);

        expect(cs.id).equal('1');
    });

    it('throws if no assembler is passed in on construction', function () {
        expect(() => new ContentStream('1', undefined)).throws('Null Argument Exception');
    });

    it('can return payload type', function () {
        const cs = new ContentStream('1', new PayloadAssembler(streamManager, { id: 'csa1', header: header }));

        expect(cs.contentType).equal('S');
    });

    it('can return length', function () {
        const cs = new ContentStream('1', new PayloadAssembler(streamManager, { id: 'csa1', header: header }));

        expect(cs.length).equal(42);
    });

    it('can return ID', function () {
        const cs = new ContentStream('1', new PayloadAssembler(streamManager, { id: 'csa1', header: header }));

        expect(cs.id).equal('1');
    });

    it('does not return the stream when it is is undefined', function () {
        const cs = new ContentStream('1', new PayloadAssembler(streamManager, { id: 'csa1', header: header }));

        expect(cs.getStream()).to.not.be.undefined;
    });

    it('reads a stream of length 0 and returns an empty string', function () {
        const cs = new ContentStream(
            '1',
            new PayloadAssembler(streamManager, {
                id: 'csa1',
                header: { ...header, payloadLength: 0 },
            })
        );

        return cs.readAsString().then((data) => {
            expect(data).equal('');
        });
    });

    it('throws when reading an empty stream as JSON', function () {
        const assemblerHeader = { ...header, PayloadLength: 0 };
        delete assemblerHeader.payloadLength;

        const cs = new ContentStream(
            '1',
            new PayloadAssembler(streamManager, {
                id: 'csa1',
                header: assemblerHeader,
            })
        );

        return cs
            .readAsJson()
            .then((data) => {
                expect(data).to.not.be.undefined;
            })
            .catch((err) => {
                expect(err.toString()).to.equal('SyntaxError: Unexpected end of JSON input');
            });
    });

    it('reads a stream as a string', async function () {
        const cs = new ContentStream('cs1', new TestPayloadAssembler());
        const data = await cs.readAsString();
        expect(data).to.equal('hello');
    });

    it('reads a stream as a json', async function () {
        const cs = new ContentStream('cs1', new TestPayloadAssembler('{"message":"hello"}'));
        const data = await cs.readAsJson();
        expect(data.message).to.equal('hello');
    });

    it('reads a stream before receiving all the bits', function () {
        const tcsa = new TestPayloadAssembler();
        tcsa.contentLength = 10;
        const cs = new ContentStream('cs1', tcsa);
        const result = cs.readAsString();

        result.then(function (data) {
            console.log('hello');
            expect(data).to.equal('hello');
        });
    });

    it('can cancel', function () {
        const cs = new ContentStream('cs1', new TestPayloadAssembler());
        cs.readAsString();

        expect(() => cs.cancel()).to.not.throw();
    });
});
