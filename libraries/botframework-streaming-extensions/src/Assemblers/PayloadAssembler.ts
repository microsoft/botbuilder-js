/**
 * @module botframework-streaming-extensions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Header } from '../Models/Header';
import { Stream } from '../Stream';

export abstract class PayloadAssembler {
    public id: string;
    public end: boolean;
    private stream: Stream;

    public constructor(id: string) {
        this.id = id;
    }

    public getPayloadStream(): Stream {
        if (!this.stream) {
            this.stream = this.createPayloadStream();
        }

        return this.stream;
    }

    public abstract createPayloadStream(): Stream;

    public onReceive(header: Header, stream?: Stream, contentLength?: number): void {
        this.end = header.End;
    }

    public abstract close(): void;
}
