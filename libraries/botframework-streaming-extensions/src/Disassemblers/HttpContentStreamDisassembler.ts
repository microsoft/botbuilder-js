/**
 * @module botframework-streaming-extensions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { HttpContentStream } from '../HttpContentStream';
import { PayloadSender } from '../PayloadTransport/PayloadSender';
import { SubscribableStream } from '../SubscribableStream';
import { PayloadTypes } from '../Payloads/PayloadTypes';
import { PayloadDisassembler } from './PayloadDisassembler';
import { IStreamWrapper } from '../Interfaces/IStreamWrapper';

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
