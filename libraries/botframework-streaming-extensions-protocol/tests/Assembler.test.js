const Header = require('../lib/Payloads/Models/Header');
const Stream = require('../lib/Stream');
const  chai  = require('chai');
const StreamManager = require('../lib/Payloads/StreamManager');
const PayloadTypes = require('../lib/Payloads/Models/PayloadTypes');
const  ContentStreamAssembler = require( '../lib/Payloads/Assemblers/ContentStreamAssembler');
const ReceiveRequestAssembler = require('../lib/Payloads/Assemblers/ReceiveRequestAssembler');
const ReceiveResponseAssembler = require('../lib/Payloads/Assemblers/ReceiveResponseAssembler');
const PayloadAssembler = require('../lib/Payloads/Assemblers/PayloadAssembler');
var expect = chai.expect;

describe('PayloadAssembler', () => {

});

describe('ReceiveRequestAssembler', () => {
    it('constructs correctly.', () => {
        let header = new Header.Header(PayloadTypes.PayloadTypes.request, '42', '100', true);
        let sm = new StreamManager.StreamManager();

        let rra = new ReceiveRequestAssembler.ReceiveRequestAssembler(header, sm, undefined);

        expect(rra.id).equals('100');
        expect(rra._streamManager).equals(sm);
    })
});

describe('ReceiveResponseAssembler', () => {
    it('constructs correctly.', () => {

    })
});

describe('ContentStreamAssembler', () => {
    it('assigns values when constructed', () => {
        let csa = new ContentStreamAssembler.ContentStreamAssembler(new StreamManager.StreamManager(), '1', 'stream', 50);
        expect(csa.id)
            .equals('1');
        expect(csa.contentLength)
            .equals(50);
        expect(csa.contentType)
            .equals('stream');
        expect(csa.end)
            .equals(undefined);
    });

    it('returns a Stream', () => {
        let csa = new ContentStreamAssembler.ContentStreamAssembler(new StreamManager.StreamManager(), '1', 'stream', 50);
        expect(csa.createPayloadStream())
            .instanceOf(Stream.Stream);
    });
});