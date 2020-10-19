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

    /**
     * Initializes a new instance of the [HttpContentStreamDisassembler](xref:botframework-streaming.HttpContentStreamDisassembler) class.
     * @param sender The [PayloadSender](xref:botframework-streaming.PayloadSender) to send the disassembled data to.
     * @param contentStream The [HttpContentStream](xref:botframework-streaming.HttpContentStream) to be disassembled.
     */
    public constructor(sender: PayloadSender, contentStream: HttpContentStream) {
        super(sender, contentStream.id);
        this.contentStream = contentStream;
    }

    /**
     * Gets the stream this disassembler is operating on.
     * @returns An [IStreamWrapper](xref:botframework-streaming.IStreamWrapper) with a Subscribable Strea.
     */
    public async getStream(): Promise<IStreamWrapper> {
        const stream: SubscribableStream = this.contentStream.content.getStream();

        return { stream, streamLength: stream.length };
    }
}
