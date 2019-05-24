const chai = require( 'chai');
const HeaderSerializer = require( '../lib/Payloads/HeaderSerializer');
const Header = require( '../lib/Payloads/Models/Header');
const PayloadTypes = require( '../lib/Payloads/Models/PayloadTypes');
const TransportContants = require( '../lib/Transport/TransportConstants');
var expect = chai.expect;

describe('HeaderSerializer', () => {

    it('serializes and deserializes correctly', () => {
      
        let header = new Header.Header(PayloadTypes.request, 168, '68e999ca-a651-40f4-ad8f-3aaf781862b4', true);
        let buffer = Buffer.alloc(Number(TransportContants.MaxHeaderLength));

        HeaderSerializer.HeaderSerializer.serialize(header, buffer);

        let result =  HeaderSerializer.HeaderSerializer.deserialize(buffer);

        expect(result)
            .to
            .deep
            .equal(header);

    });

    it('can parse an ASCII header', () => {
        let buffer =Buffer.alloc(Number(TransportContants.MaxHeaderLength));
        buffer.write('A.000168.68e999ca-a651-40f4-ad8f-3aaf781862b4.1\n');

        let result =  HeaderSerializer.HeaderSerializer.deserialize(buffer);
        expect(result.PayloadType)
            .equal('A');
        expect(result.PayloadLength)
            .equal(168);
        expect(result.Id)
            .equal('68e999ca-a651-40f4-ad8f-3aaf781862b4');
        expect(result.End)
            .equal(true);
    });

    it('deserializes unknown types', () => {
        let buffer = Buffer.alloc(Number(TransportContants.MaxHeaderLength));
        buffer.write('Z.000168.68e999ca-a651-40f4-ad8f-3aaf781862b4.1\n');
        let result =  HeaderSerializer.HeaderSerializer.deserialize(this.buffer);

        expect(result.PayloadType)
            .equal('Z');
    });

    it('throws if the header is missing a part', () => {
        // expect.assertions(1);
        let buffer = Buffer.alloc(Number(TransportContants.MaxHeaderLength));
        buffer.write('A.000168.68e999ca-a651-40f4-ad8f-3aaf781862b4\n');

        expect(() =>  HeaderSerializer.HeaderSerializer.deserialize(buffer))
            .throws('Cannot parse header, header is malformed.');
    });

    it('throws if the header has too many parts', () => {
        // expect.assertions(1);
        let buffer = Buffer.alloc(Number(TransportContants.MaxHeaderLength));
        buffer.write('A.000168.68e999ca-a651-40f4-ad8f-3aaf781862b4.1.2\n');

        expect(() =>  HeaderSerializer.HeaderSerializer.deserialize(buffer))
            .throws('Cannot parse header, header is malformed.');
    });

    it('throws if the header type is too long', () => {
        // expect.assertions(1);
        let buffer = Buffer.alloc(Number(TransportContants.MaxHeaderLength));
        buffer.write('ABCDE.000168.68e999ca-a651-40f4-ad8f-3aaf7b4.1\n');

        expect(() =>  HeaderSerializer.HeaderSerializer.deserialize(buffer))
        .throws('header is malformed.');
    });

    it('throws if the header length is malformed', () => {
        // expect.assertions(1);
        let buffer = Buffer.alloc(Number(TransportContants.MaxHeaderLength));
        buffer.write('A.00b168.68e999ca-a651-40f4-ad8f-3aaf781862b4.1\n');

        expect(() =>  HeaderSerializer.HeaderSerializer.deserialize(buffer))
        .throws('header is malformed.');
    });

    it('throws if the header length is to small', () => {
        // expect.assertions(1);
        let buffer = Buffer.alloc(Number(TransportContants.MaxHeaderLength));
        buffer.write('A.-00168.68e999ca-a651-40f4-ad8f-3aaf781862b4.1\n');

        expect(() =>  HeaderSerializer.HeaderSerializer.deserialize(buffer))
        .throws('header is malformed.');
    });

    it('throws if the header length is to big', () => {
        // expect.assertions(1);
        let buffer = Buffer.alloc(Number(TransportContants.MaxHeaderLength));
        buffer.write('A.1111111.8e999ca-a651-40f4-ad8f-3aaf781862b4.1\n');

        expect(() =>  HeaderSerializer.HeaderSerializer.deserialize(buffer))
        .throws('header is malformed.');
    });

    it('throws if the header terminator is malformed', () => {
        // expect.assertions(1);
        let buffer = Buffer.alloc(Number(TransportContants.MaxHeaderLength));
        buffer.write('A.000168.68e999ca-a651-40f4-ad8f-3aaf781862b4.2\n');

        expect(() =>  HeaderSerializer.HeaderSerializer.deserialize(buffer))
        .throws('header is malformed.');
    });

    it('throws if the header ID is malformed', () => {
        //  expect.assertions(1);
        let buffer = Buffer.alloc(Number(TransportContants.MaxHeaderLength));
        buffer.write('A.000168.68e9p9ca-a651-40f4-ad8f-3aaf781862b4.1\n');

        expect(() =>  HeaderSerializer.HeaderSerializer.deserialize(buffer))
            .throws('header is malformed.');
    });

});
