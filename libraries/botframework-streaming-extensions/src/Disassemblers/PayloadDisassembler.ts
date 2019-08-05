/**
 * @module botframework-streaming-extensions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { HttpContentStream } from '../HttpContentStream';
import { IHeader } from '../Interfaces/IHeader';
import { PayloadTypes } from '../Payloads/PayloadTypes';
import { IStreamDescription } from '../Interfaces/IStreamDescription';
import { PayloadSender } from '../PayloadTransport/PayloadSender';
import { SubscribableStream } from '../SubscribableStream';
import { IStreamWrapper } from '../Interfaces/IStreamWrapper';
import { serializeObject } from '@azure/ms-rest-js';

export abstract class PayloadDisassembler {
    public abstract payloadType: PayloadTypes;
    private readonly sender: PayloadSender;
    private stream: SubscribableStream;
    private streamLength?: number;
    private readonly id: string;

    public constructor(sender: PayloadSender, id: string) {
        this.sender = sender;
        this.id = id;
    }

    protected static getStreamDescription(stream: HttpContentStream): IStreamDescription {
        let description: IStreamDescription = {id: stream.id};

        if (stream.content.headers) {
            description.contentType = stream.content.headers.contentType;
            description.length = stream.content.headers.contentLength;
        } else {
            description.contentType = 'unknown';
            description.length = 0;
        }

        return description;
    }

    protected static serialize<T>(item: T): IStreamWrapper {
        let stream: SubscribableStream = new SubscribableStream();

        stream.write(JSON.stringify(item));
        stream.end();

        return {stream: stream, streamLength: stream.length};
    }

    public DescribePayloadStreams(streams: HttpContentStream[]): IStreamDescription[] {
        let result: IStreamDescription[] = [];
        streams.forEach((stream) => {
            result.push(PayloadDisassembler.getStreamDescription(stream));
        });
        
        return result;
    }

    public abstract async getStream(): Promise<IStreamWrapper>;

    public async disassemble(): Promise<void> {
        let w: IStreamWrapper = await this.getStream();

        this.stream = w.stream;
        this.streamLength = w.streamLength;

        return this.send();
    }

    private async send(): Promise<void> {
        let header: IHeader ={ PayloadType: this.payloadType, PayloadLength: this.streamLength, Id: this.id, End: true}
        this.sender.sendPayload(header, this.stream, undefined);
    }
}
