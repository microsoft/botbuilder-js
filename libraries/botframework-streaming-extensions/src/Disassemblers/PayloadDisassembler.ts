/**
 * @module botframework-streaming-extensions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { IHeader } from '../Interfaces/IHeader';
import { PayloadTypes } from '../Payloads/PayloadTypes';
import { PayloadSender } from '../PayloadTransport/PayloadSender';
import { SubscribableStream } from '../SubscribableStream';
import { IStreamWrapper } from '../Interfaces/IStreamWrapper';

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

        return {stream, streamLength: stream.length};
    }

    public abstract async getStream(): Promise<IStreamWrapper>;

    public async disassemble(): Promise<void> {
        let { stream, streamLength }: IStreamWrapper = await this.getStream();

        this.stream = stream;
        this.streamLength = streamLength;

        return this.send();
    }

    private async send(): Promise<void> {
        let header: IHeader = {payloadType: this.payloadType, payloadLength: this.streamLength, id: this.id, end: true}
        this.sender.sendPayload(header, this.stream);
    }
}
