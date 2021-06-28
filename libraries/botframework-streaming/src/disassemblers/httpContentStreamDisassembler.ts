/**
 * @module botframework-streaming
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import type { HttpContentStream } from '../httpContentStream';
import { IStreamWrapper } from '../interfaces';
import { PayloadDisassembler } from './payloadDisassembler';
import { PayloadTypes } from '../payloads';
import type { PayloadSender } from '../payloadTransport';
import type { SubscribableStream } from '../subscribableStream';

/**
 * Disassembler for Http content stream
 */
export class HttpContentStreamDisassembler extends PayloadDisassembler {
    readonly contentStream: HttpContentStream;
    payloadType: PayloadTypes = PayloadTypes.stream;

    /**
     * Initializes a new instance of the [HttpContentStreamDisassembler](xref:botframework-streaming.HttpContentStreamDisassembler) class.
     *
     * @param sender The [PayloadSender](xref:botframework-streaming.PayloadSender) to send the disassembled data to.
     * @param contentStream The [HttpContentStream](xref:botframework-streaming.HttpContentStream) to be disassembled.
     */
    constructor(sender: PayloadSender, contentStream: HttpContentStream) {
        super(sender, contentStream.id);
        this.contentStream = contentStream;
    }

    /**
     * Gets the stream this disassembler is operating on.
     *
     * @returns An [IStreamWrapper](xref:botframework-streaming.IStreamWrapper) with a Subscribable Strea.
     */
    async getStream(): Promise<IStreamWrapper> {
        const stream: SubscribableStream = this.contentStream.content.getStream();

        return { stream, streamLength: stream.length };
    }
}
