/**
 * @module botframework-streaming
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { IHeader } from '../interfaces/IHeader';
import { PayloadConstants } from './payloadConstants';

/**
 * Streaming header serializer
 */
export class HeaderSerializer {
    public static readonly Delimiter = '.';
    public static readonly Terminator = '\n';
    public static readonly End = '1';
    public static readonly NotEnd = '0';
    public static readonly TypeOffset: number = 0;
    public static readonly TypeDelimiterOffset = 1;
    public static readonly LengthOffset = 2;
    public static readonly LengthLength = 6;
    public static readonly LengthDelimeterOffset = 8;
    public static readonly IdOffset = 9;
    public static readonly IdLength = 36;
    public static readonly IdDelimeterOffset = 45;
    public static readonly EndOffset = 46;
    public static readonly TerminatorOffset = 47;
    public static readonly Encoding = 'utf8';

    /**
     * Serializes the header into a buffer
     *
     * @param header The header to serialize.
     * @param buffer The buffer into which to serialize the header.
     */
    public static serialize(header: IHeader, buffer: Buffer): void {
        buffer.write(header.payloadType, this.TypeOffset, 1,  this.Encoding);
        buffer.write(this.Delimiter, this.TypeDelimiterOffset, 1, this.Encoding);
        buffer.write(this.headerLengthPadder(header.payloadLength, this.LengthLength, '0'), this.LengthOffset, this.LengthLength, this.Encoding);
        buffer.write(this.Delimiter, this.LengthDelimeterOffset, 1, this.Encoding);
        buffer.write(header.id, this.IdOffset);
        buffer.write(this.Delimiter, this.IdDelimeterOffset, 1, this.Encoding);
        buffer.write(header.end ? this.End : this.NotEnd, this.EndOffset);
        buffer.write(this.Terminator, this.TerminatorOffset);
    }

    /**
     * Deserializes a buffer containing header information.
     *
     * @param buffer The buffer from which to obtain the data to deserialize.
     * @returns The deserialized header from the buffer.
     */
    public static deserialize(buffer: Buffer): IHeader {
        let jsonBuffer = buffer.toString(this.Encoding);
        let headerArray = jsonBuffer.split(this.Delimiter);

        if (headerArray.length !== 4) {
            throw Error('Cannot parse header, header is malformed.');
        }

        const [payloadType, length, id, headerEnd] = headerArray;

        const end = headerEnd === '1\n';
        const payloadLength = Number(length);
        
        const header: IHeader = { end, payloadLength, payloadType, id };

        if (!(header.payloadLength <= PayloadConstants.MaxPayloadLength && header.payloadLength >= PayloadConstants.MinLength)) {
            throw Error('Header Length is missing or malformed.');
        }

        if (header.payloadType.length !== this.TypeDelimiterOffset) {
            throw Error('Header Type is missing or malformed.');
        }

        if (!header.id || !header.id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i) || header.id.length !==  this.IdLength) {
            throw Error('Header ID is missing or malformed.');
        }

        if (!(headerEnd === '0\n' || headerEnd === '1\n')) {
            throw Error('Header End is missing or not a valid value.');
        }

        return header;
    }

    public static headerLengthPadder(lengthValue: number, totalLength: number, padChar: string): string {
        let result = Array(totalLength + 1)
            .join(padChar);

        let lengthString = lengthValue.toString();

        return (result + lengthString).slice(lengthString.length);
    }
}
