/**
 * @module botframework-streaming
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { IHeader } from '../interfaces/IHeader';
import { PayloadTypes } from '../payloads/payloadTypes';
import { PayloadSender } from '../payloadTransport/payloadSender';
import { SubscribableStream } from '../subscribableStream';
import { IStreamWrapper } from '../interfaces/IStreamWrapper';

/**
 * Base class streaming payload disassembling.
 */
export abstract class PayloadDisassembler {
    public abstract payloadType: PayloadTypes;
    private readonly sender: PayloadSender;
    private stream: SubscribableStream;
    private streamLength?: number;
    private readonly id: string;

    /**
     * Initializes a new instance of the `PayloadDisassembler` class.
     * @param sender The `PayloadSender` used to send the disassembled payload chunks.
     * @param id The ID of this disassembler.
     */
    public constructor(sender: PayloadSender, id: string) {
        this.sender = sender;
        this.id = id;
    }

    /**
     * Serializes the item into the `IStreamWrapper` that exposes the stream and length of the result.
     * @param item The item to be serialized.
     */
    protected static serialize<T>(item: T): IStreamWrapper {
        let stream: SubscribableStream = new SubscribableStream();

        stream.write(JSON.stringify(item));
        stream.end();

        return {stream, streamLength: stream.length};
    }

    /**
     * Gets the stream this disassembler is operating on.
     * @returns An `IStreamWrapper` with a Subscribable Stream.
     */
    public abstract async getStream(): Promise<IStreamWrapper>;

    /**
     * Begins the process of disassembling a payload and sending the resulting chunks to the `PayloadSender` to dispatch over the transport.
     */
    public async disassemble(): Promise<void> {
        let { stream, streamLength }: IStreamWrapper = await this.getStream();

        this.stream = stream;
        this.streamLength = streamLength;

        return this.send();
    }

    /**
     * Begins the process of disassembling a payload and signals the `PayloadSender`.
     */
    private async send(): Promise<void> {
        let header: IHeader = {payloadType: this.payloadType, payloadLength: this.streamLength, id: this.id, end: true};
        this.sender.sendPayload(header, this.stream);
    }
}
