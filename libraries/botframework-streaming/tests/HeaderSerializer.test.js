const { HeaderSerializer, PayloadTypes } = require('../lib/payloads');
const { PayloadConstants } = require('../lib/payloads/payloadConstants');
const importSync= require('import-sync');
const { expect } = importSync('chai/lib/chai');

describe('HeaderSerializer', function () {
    it('serializes and deserializes correctly', function () {
        const header = {
            payloadType: PayloadTypes.request,
            payloadLength: 168,
            id: '68e999ca-a651-40f4-ad8f-3aaf781862b4',
            end: true,
        };
        const buffer = Buffer.alloc(Number(PayloadConstants.MaxHeaderLength));

        HeaderSerializer.serialize(header, buffer);

        const result = HeaderSerializer.deserialize(buffer);

        expect(result).to.deep.equal(header);
    });

    it('can parse an ASCII header', function () {
        const buffer = Buffer.alloc(Number(PayloadConstants.MaxHeaderLength));
        buffer.write('A.000168.68e999ca-a651-40f4-ad8f-3aaf781862b4.1\n');

        const result = HeaderSerializer.deserialize(buffer);
        expect(result.payloadType).equal('A');
        expect(result.payloadLength).equal(168);
        expect(result.id).equal('68e999ca-a651-40f4-ad8f-3aaf781862b4');
        expect(result.end).equal(true);
    });

    it('deserializes unknown types', function () {
        const buffer = Buffer.alloc(Number(PayloadConstants.MaxHeaderLength));
        buffer.write('Z.000168.68e999ca-a651-40f4-ad8f-3aaf781862b4.1\n');
        const result = HeaderSerializer.deserialize(buffer);

        expect(result.payloadType).equal('Z');
    });

    it('throws if the header is missing a part', function () {
        const buffer = Buffer.alloc(Number(PayloadConstants.MaxHeaderLength));
        buffer.write('A.000168.68e999ca-a651-40f4-ad8f-3aaf781862b4\n');

        expect(() => HeaderSerializer.deserialize(buffer)).throws('Cannot parse header, header is malformed.');
    });

    it('throws if the header has too many parts', function () {
        const buffer = Buffer.alloc(Number(PayloadConstants.MaxHeaderLength));
        buffer.write('A.000168.68e999ca-a651-40f4-ad8f-3aaf781862b4.1.2\n');

        expect(() => HeaderSerializer.deserialize(buffer)).throws('Cannot parse header, header is malformed.');
    });

    it('throws if the header type is too long', function () {
        const buffer = Buffer.alloc(Number(PayloadConstants.MaxHeaderLength));
        buffer.write('ABCDE.000168.68e999ca-a651-40f4-ad8f-3aaf7b4.1\n');

        expect(() => HeaderSerializer.deserialize(buffer)).throws("Header type '5' is missing or malformed.");
    });

    it('throws if the header length is malformed', function () {
        const buffer = Buffer.alloc(Number(PayloadConstants.MaxHeaderLength));
        buffer.write('A.00b168.68e999ca-a651-40f4-ad8f-3aaf781862b4.1\n');

        expect(() => HeaderSerializer.deserialize(buffer)).throws('Header length of NaN is missing or malformed');
    });

    it('throws if the header length is too small', function () {
        const buffer = Buffer.alloc(Number(PayloadConstants.MaxHeaderLength));
        buffer.write('A.-100000.68e999ca-a651-40f4-ad8f-3aaf781862b4.1\n');

        expect(() => HeaderSerializer.deserialize(buffer)).throws('Header length of -100000 is missing or malformed');
    });

    it('throws if the header length is too big', function () {
        const buffer = Buffer.alloc(Number(PayloadConstants.MaxHeaderLength));
        buffer.write('A.1111111.8e999ca-a651-40f4-ad8f-3aaf781862b4.1\n');

        expect(() => HeaderSerializer.deserialize(buffer)).throws('Header length of 1111111 is missing or malformed');
    });

    it('throws if the header terminator is malformed', function () {
        const buffer = Buffer.alloc(Number(PayloadConstants.MaxHeaderLength));
        buffer.write('A.000168.68e999ca-a651-40f4-ad8f-3aaf781862b4.2\n');

        expect(() => HeaderSerializer.deserialize(buffer)).throws('Header End is missing or not a valid value.');
    });

    it('throws if the header ID is malformed', function () {
        const headerId = '68e9p9ca-a651-40f4-ad8f-3aaf781862b4';
        const header = `A.000168.${headerId}.1\n`;

        const buffer = Buffer.alloc(Number(PayloadConstants.MaxHeaderLength));
        buffer.write(header);

        expect(() => HeaderSerializer.deserialize(buffer)).throws(`Header ID '${headerId}' is missing or malformed.`);
    });

    it('accepts nil GUIDs as valid header IDs', function () {
        const buffer = Buffer.alloc(Number(PayloadConstants.MaxHeaderLength));
        buffer.write('A.000168.00000000-0000-0000-0000-000000000000.1\n');

        const result = HeaderSerializer.deserialize(buffer);

        expect(result.id).to.deep.equal('00000000-0000-0000-0000-000000000000');
    });
});
