/**
 * @module botframework-streaming-extensions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Header } from '../Models/Header';
import { SubscribableStream } from '../SubscribableStream';

export abstract class PayloadAssembler {
    public id: string;
    public end: boolean;
    private stream: SubscribableStream;

    public constructor(id: string) {
        this.id = id;
    }

    public getPayloadStream(): SubscribableStream {
        if (!this.stream) {
            this.stream = this.createPayloadStream();
        }

        return this.stream;
    }

    public abstract createPayloadStream(): SubscribableStream;

    public onReceive(header: Header, stream?: SubscribableStream, contentLength?: number): void {
        this.end = header.End;
    }

    public abstract close(): void;
}
