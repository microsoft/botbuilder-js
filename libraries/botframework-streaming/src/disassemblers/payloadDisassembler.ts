/**
 * @module botframework-streaming
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { PayloadTypes } from '../payloads';
import { PayloadSender } from '../payloadTransport';
import { SubscribableStream } from '../subscribableStream';
import { IStreamWrapper } from '../interfaces';

/**
 * Base class streaming payload disassembling.
 */
export abstract class PayloadDisassembler {
    abstract payloadType: PayloadTypes;
    private stream: SubscribableStream;
    private streamLength?: number;

    /**
     * Initializes a new instance of the [PayloadDisassembler](xref:botframework-streaming.PayloadDisassembler) class.
     *
     * @param sender The [PayloadSender](xref:botframework-streaming.PayloadSender) used to send the disassembled payload chunks.
     * @param id The ID of this disassembler.
     */
    constructor(private readonly sender: PayloadSender, private readonly id: string) {}

    /**
     * Serializes the item into the [IStreamWrapper](xref:botframework-streaming.IStreamWrapper) that exposes the stream and length of the result.
     *
     * @param item The item to be serialized.
     * @returns The stream containing the serialized item and the length of the stream.
     */
    protected static serialize<T>(item: T): IStreamWrapper {
        const stream: SubscribableStream = new SubscribableStream();

        stream.write(JSON.stringify(item));
        stream.end();

        return { stream, streamLength: stream.length };
    }

    /**
     * Gets the stream this disassembler is operating on.
     *
     * @returns An [IStreamWrapper](xref:botframework-streaming.IStreamWrapper) with a Subscribable Stream.
     */
    abstract getStream(): Promise<IStreamWrapper>;

    /**
     * Begins the process of disassembling a payload and sending the resulting chunks to the [PayloadSender](xref:botframework-streaming.PayloadSender) to dispatch over the transport.
     *
     * @returns A completed Promise after the disassembled payload has been sent.
     */
    async disassemble(): Promise<void> {
        const { stream, streamLength } = await this.getStream();

        this.stream = stream;
        this.streamLength = streamLength;

        return this.send();
    }

    /**
     * Begins the process of disassembling a payload and signals the [PayloadSender](xref:botframework-streaming.PayloadSender).
     */
    private async send(): Promise<void> {
        const header = {
            payloadType: this.payloadType,
            payloadLength: this.streamLength,
            id: this.id,
            end: true,
        };
        this.sender.sendPayload(header, this.stream);
    }
}
