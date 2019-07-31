/**
 * @module botframework-streaming-extensions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { ContentStreamAssembler } from '../Assemblers/ContentStreamAssembler';
import { Header } from '../Models/Header';
import { SubscribableStream } from '../Stream';

export class StreamManager {
    private readonly activeAssemblers = [];
    private readonly onCancelStream: Function;

    public constructor(onCancelStream: Function) {
        this.onCancelStream = onCancelStream;
    }

    public getPayloadAssembler(id: string): ContentStreamAssembler {
        if (this.activeAssemblers[id] === undefined) {
            // A new id has come in, kick off the process of tracking it.
            let assembler = new ContentStreamAssembler(this, id);
            this.activeAssemblers[id] = assembler;

            return assembler;
        } else {

            return this.activeAssemblers[id];
        }
    }

    public getPayloadStream(header: Header): SubscribableStream {
        let assembler = this.getPayloadAssembler(header.Id);

        return assembler.getPayloadStream();
    }

    public onReceive(header: Header, contentStream: SubscribableStream, contentLength: number): void {
        if (this.activeAssemblers[header.Id] === undefined) {
            return;
        } else {
            this.activeAssemblers[header.Id].onReceive(header, contentStream, contentLength);
        }
    }

    public closeStream(id: string): void {
        if (this.activeAssemblers[id] === undefined) {
            return;
        } else {
            let assembler: ContentStreamAssembler;
            assembler = this.activeAssemblers[id];
            this.activeAssemblers.splice(this.activeAssemblers.indexOf(id), 1);
            let targetStream = assembler.getPayloadStream();
            if ((assembler.contentLength !== undefined
        && targetStream.length < assembler.contentLength)
        || !assembler.end) {
                this.onCancelStream(assembler);
            }
        }
    }
}
