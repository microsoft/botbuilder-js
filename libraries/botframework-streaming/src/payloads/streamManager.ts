/**
 * @module botframework-streaming
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { IHeader } from '../interfaces';
import { SubscribableStream } from '../subscribableStream';
import { PayloadAssembler } from '../assemblers/payloadAssembler';

/**
 * Orchestrates and manages streams.
 */
export class StreamManager {
    private readonly activeAssemblers = [];

    /**
     * Initializes a new instance of the [StreamManager](xref:botframework-streaming.StreamManager) class.
     *
     * @param onCancelStream Function to trigger if the managed stream is cancelled.
     */
    constructor(private readonly onCancelStream: (contentStreamAssembler: PayloadAssembler) => void) {}

    /**
     * Retrieves a [PayloadAssembler](xref:botframework-streaming.PayloadAssembler) with the given ID if one exists, otherwise a new instance is created and assigned the given ID.
     *
     * @param id The ID of the [PayloadAssembler](xref:botframework-streaming.PayloadAssembler) to retrieve or create.
     * @returns The [PayloadAssembler](xref:botframework-streaming.PayloadAssembler) with the given ID.
     */
    getPayloadAssembler(id: string): PayloadAssembler {
        if (!this.activeAssemblers[id]) {
            // A new id has come in, kick off the process of tracking it.
            const assembler = new PayloadAssembler(this, { id });
            this.activeAssemblers[id] = assembler;

            return assembler;
        } else {
            return this.activeAssemblers[id];
        }
    }

    /**
     * Retrieves the [SubscribableStream](xref:botframework-streaming.SubscribableStream) from the [PayloadAssembler](xref:botframework-streaming.PayloadAssembler) this manager manages.
     *
     * @param header The Header of the [SubscribableStream](xref:botframework-streaming.SubscribableStream) to retrieve.
     * @returns The [SubscribableStream](xref:botframework-streaming.SubscribableStream) with the given header.
     */
    getPayloadStream(header: IHeader): SubscribableStream {
        const assembler = this.getPayloadAssembler(header.id);

        return assembler.getPayloadStream();
    }

    /**
     * Used to set the behavior of the managed [PayloadAssembler](xref:botframework-streaming.PayloadAssembler) when data is received.
     *
     * @param header The Header of the stream.
     * @param contentStream The [SubscribableStream](xref:botframework-streaming.SubscribableStream) to write incoming data to.
     * @param contentLength The amount of data to write to the contentStream.
     */
    onReceive(header: IHeader, contentStream: SubscribableStream, contentLength: number): void {
        if (!this.activeAssemblers[header.id]) {
            return;
        }
        this.activeAssemblers[header.id].onReceive(header, contentStream, contentLength);
    }

    /**
     * Closes the [PayloadAssembler](xref:botframework-streaming.PayloadAssembler) assigned to the [SubscribableStream](xref:botframework-streaming.SubscribableStream) with the given ID.
     *
     * @param id The ID of the [SubscribableStream](xref:botframework-streaming.SubscribableStream) to close.
     */
    closeStream(id: string): void {
        if (!this.activeAssemblers[id]) {
            return;
        } else {
            const assembler: PayloadAssembler = this.activeAssemblers[id];
            this.activeAssemblers.splice(this.activeAssemblers.indexOf(id), 1);
            const targetStream = assembler.getPayloadStream();
            if ((assembler.contentLength && targetStream.length < assembler.contentLength) || !assembler.end) {
                this.onCancelStream(assembler);
            }
        }
    }
}
