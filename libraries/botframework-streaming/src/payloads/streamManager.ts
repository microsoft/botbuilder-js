/**
 * @module botframework-streaming
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { IHeader } from '../interfaces/IHeader';
import { SubscribableStream } from '../subscribableStream';
import { PayloadAssembler } from '../assemblers/payloadAssembler';

/**
 * Orchestrates and manages streams.
 */
export class StreamManager {
    private readonly activeAssemblers = [];
    private readonly onCancelStream: Function;

    /**
     * Initializes a new instance of the `StreamManager` class.
     * @param onCancelStream Function to trigger if the managed stream is cancelled.
     */
    public constructor(onCancelStream: Function) {
        this.onCancelStream = onCancelStream;
    }

    /**
     * Retrieves a `PayloadAssembler` with the given ID if one exists, otherwise a new instance is created and assigned the given ID.
     * @param id The ID of the `PayloadAssembler` to retrieve or create.
     * @returns The `PayloadAssembler` with the given ID.
     */
    public getPayloadAssembler(id: string): PayloadAssembler {
        if (!this.activeAssemblers[id]) {
            // A new id has come in, kick off the process of tracking it.
            let assembler = new PayloadAssembler(this, {id: id});
            this.activeAssemblers[id] = assembler;

            return assembler;
        } else {

            return this.activeAssemblers[id];
        }
    }

    /**
     * Retrieves the `SubscribableStream` from the `PayloadAssembler` this manager manages.
     * @param header The Header of the `SubscribableStream` to retrieve.
     * @returns The `SubscribableStream` with the given header.
     */
    public getPayloadStream(header: IHeader): SubscribableStream {
        let assembler = this.getPayloadAssembler(header.id);

        return assembler.getPayloadStream();
    }

    /**
     * Used to set the behavior of the managed `PayloadAssembler` when data is received.
     * @param header The Header of the stream.
     * @param contentStream The `SubscribableStream` to write incoming data to.
     * @param contentLength The amount of data to write to the contentStream.
     */
    public onReceive(header: IHeader, contentStream: SubscribableStream, contentLength: number): void {
        if (!this.activeAssemblers[header.id]) {
            return;
        }
        this.activeAssemblers[header.id].onReceive(header, contentStream, contentLength);
    }

    /**
     * Closes the `PayloadAssembler` assigned to the `SubscribableStream` with the given ID.
     * @param id The ID of the `SubscribableStream` to close.
     */
    public closeStream(id: string): void {
        if (!this.activeAssemblers[id]) {
            return;
        } else {
            let assembler: PayloadAssembler = this.activeAssemblers[id];
            this.activeAssemblers.splice(this.activeAssemblers.indexOf(id), 1);
            let targetStream = assembler.getPayloadStream();
            if ((assembler.contentLength && targetStream.length < assembler.contentLength) || !assembler.end) {
                this.onCancelStream(assembler);
            }
        }
    }
}
