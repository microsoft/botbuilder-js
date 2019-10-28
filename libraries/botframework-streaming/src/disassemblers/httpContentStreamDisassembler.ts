/**
 * @module botframework-streaming
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { HttpContentStream } from '../httpContentStream';
import { PayloadSender } from '../payloadTransport/payloadSender';
import { SubscribableStream } from '../subscribableStream';
import { PayloadTypes } from '../payloads/payloadTypes';
import { PayloadDisassembler } from './payloadDisassembler';
import { IStreamWrapper } from '../interfaces/IStreamWrapper';

/**
 * Disassembler for Http content stream
 */
export class HttpContentStreamDisassembler extends PayloadDisassembler {
    public readonly contentStream: HttpContentStream;
    public payloadType: PayloadTypes = PayloadTypes.stream;

    public constructor(sender: PayloadSender, contentStream: HttpContentStream) {
        super(sender, contentStream.id);
        this.contentStream = contentStream;
    }

    public async getStream(): Promise<IStreamWrapper> {
        let stream: SubscribableStream = this.contentStream.content.getStream();

        return {stream, streamLength: stream.length};
    }
}
