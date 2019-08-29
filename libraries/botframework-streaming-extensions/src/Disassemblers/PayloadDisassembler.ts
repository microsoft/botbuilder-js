/**
 * @module botframework-streaming-extensions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { IHeader } from '../interfaces/iHeader';
import { PayloadTypes } from '../payloads/payloadTypes';
import { PayloadSender } from '../payloadtransport/payloadSender';
import { SubscribableStream } from '../subscribableStream';
import { IStreamWrapper } from '../interfaces/iStreamWrapper';

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

    protected static serialize<T>(item: T): IStreamWrapper {
        let stream: SubscribableStream = new SubscribableStream();

        stream.write(JSON.stringify(item));
        stream.end();

        return {stream: stream, streamLength: stream.length};
    }

    public abstract async getStream(): Promise<IStreamWrapper>;

    public async disassemble(): Promise<void> {
        let w: IStreamWrapper = await this.getStream();

        this.stream = w.stream;
        this.streamLength = w.streamLength;

        return this.send();
    }

    private async send(): Promise<void> {
        let header: IHeader ={ payloadType: this.payloadType, payloadLength: this.streamLength, id: this.id, end: true}
        this.sender.sendPayload(header, this.stream, undefined);
    }
}
