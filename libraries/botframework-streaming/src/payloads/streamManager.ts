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

    public constructor(onCancelStream: Function) {
        this.onCancelStream = onCancelStream;
    }

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

    public getPayloadStream(header: IHeader): SubscribableStream {
        let assembler = this.getPayloadAssembler(header.id);

        return assembler.getPayloadStream();
    }

    public onReceive(header: IHeader, contentStream: SubscribableStream, contentLength: number): void {
        if (!this.activeAssemblers[header.id]) {
            return;
        }
        this.activeAssemblers[header.id].onReceive(header, contentStream, contentLength);
    }

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
