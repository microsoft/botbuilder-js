/**
 * @module botframework-streaming
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { IHeader, INodeBuffer } from '../interfaces';
import { PayloadConstants } from './payloadConstants';

/**
 * Streaming header serializer
 */
export class HeaderSerializer {
    static readonly Delimiter = '.';
    static readonly Terminator = '\n';
    static readonly End = '1';
    static readonly NotEnd = '0';
    static readonly TypeOffset: number = 0;
    static readonly TypeDelimiterOffset = 1;
    static readonly LengthOffset = 2;
    static readonly LengthLength = 6;
    static readonly LengthDelimeterOffset = 8;
    static readonly IdOffset = 9;
    static readonly IdLength = 36;
    static readonly IdDelimeterOffset = 45;
    static readonly EndOffset = 46;
    static readonly TerminatorOffset = 47;
    static readonly Encoding = 'utf8';

    /**
     * Serializes the header into a buffer
     *
     * @param header The header to serialize.
     * @param buffer The buffer into which to serialize the header.
     */
    static serialize(header: IHeader, buffer: INodeBuffer): void {
        buffer.write(header.payloadType, this.TypeOffset, 1, this.Encoding);
        buffer.write(this.Delimiter, this.TypeDelimiterOffset, 1, this.Encoding);
        buffer.write(
            this.headerLengthPadder(header.payloadLength, this.LengthLength, '0'),
            this.LengthOffset,
            this.LengthLength,
            this.Encoding
        );
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
    static deserialize(buffer: INodeBuffer): IHeader {
        const jsonBuffer = buffer.toString(this.Encoding);
        const headerArray = jsonBuffer.split(this.Delimiter);

        if (headerArray.length !== 4) {
            throw Error(`Cannot parse header, header is malformed. Header: ${jsonBuffer}`);
        }

        const [payloadType, length, id, headerEnd] = headerArray;

        const end = headerEnd === '1\n';
        const payloadLength = Number(length);

        const header: IHeader = { end, payloadLength, payloadType, id };

        if (
            !(
                header.payloadLength <= PayloadConstants.MaxPayloadLength &&
                header.payloadLength >= PayloadConstants.MinLength
            )
        ) {
            throw Error(`Header length of ${header.payloadLength} is missing or malformed`);
        }

        if (header.payloadType.length !== this.TypeDelimiterOffset) {
            throw Error(`Header type '${header.payloadType.length}' is missing or malformed.`);
        }

        if (
            !header.id ||
            !header.id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i) ||
            header.id.length !== this.IdLength
        ) {
            throw Error(`Header ID '${header.id}' is missing or malformed.`);
        }

        if (!(headerEnd === '0\n' || headerEnd === '1\n')) {
            throw Error(`Header End is missing or not a valid value. Header end: '${headerEnd}'`);
        }

        return header;
    }

    /**
     * Creates a padded string based on a length and character to be padded to.
     *
     * @param lengthValue The value to be assingned on the result.
     * @param totalLength The length of the padded string result.
     * @param padChar The character value to use as filling.
     * @returns The padded string.
     */
    static headerLengthPadder(lengthValue: number, totalLength: number, padChar: string): string {
        const result = Array(totalLength + 1).join(padChar);

        const lengthString = lengthValue.toString();

        return (result + lengthString).slice(lengthString.length);
    }
}
