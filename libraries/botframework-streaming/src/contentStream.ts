/**
 * @module botframework-streaming
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { INodeBuffer } from './interfaces/INodeBuffer';
import type { PayloadAssembler } from './assemblers';
import { PayloadTypes } from './payloads';
import type { SubscribableStream } from './subscribableStream';

/**
 * A stream of fixed or infinite length containing content to be decoded.
 */
export class ContentStream {
    id: string;
    private readonly assembler: PayloadAssembler;
    private stream: SubscribableStream;

    /**
     * Initializes a new instance of the [ContentStream](xref:botframework-streaming.ContentStream) class.
     *
     * @param id The ID assigned to this instance.
     * @param assembler The [PayloadAssembler](xref:botframework-streaming.PayloadAssembler) assigned to this instance.
     */
    constructor(id: string, assembler: PayloadAssembler) {
        if (!assembler) {
            throw Error('Null Argument Exception');
        }
        this.id = id;
        this.assembler = assembler;
    }

    /**
     * Gets the name of the type of the object contained within this [ContentStream](xref:botframework-streaming.ContentStream).
     *
     * @returns The [PayloadType](xref:botframework-streaming.PayloadType) of this [ContentStream](xref:botframework-streaming.ContentStream).
     */
    get contentType(): string | PayloadTypes {
        return this.assembler.payloadType;
    }

    /**
     * Gets the length of this [ContentStream](xref:botframework-streaming.ContentStream).
     *
     * @returns A number representing the length of this [ContentStream](xref:botframework-streaming.ContentStream).
     */
    get length(): number {
        return this.assembler.contentLength;
    }

    /**
     * Gets the data contained within this [ContentStream](xref:botframework-streaming.ContentStream).
     *
     * @returns This [ContentStream's](xref:botframework-streaming.ContentStream) [SubscribableStream](xref:botframework-streaming.SubscribableStream).
     */
    getStream(): SubscribableStream {
        if (!this.stream) {
            this.stream = this.assembler.getPayloadStream();
        }

        return this.stream;
    }

    /**
     * Closes the assembler.
     */
    cancel(): void {
        this.assembler.close();
    }

    /**
     * Gets the [SubscribableStream](xref:botframework-streaming.SubscribableStream) content as a string.
     *
     * @returns A string Promise with [SubscribableStream](xref:botframework-streaming.SubscribableStream) content.
     */
    async readAsString(): Promise<string> {
        const { bufferArray } = await this.readAll();
        return (bufferArray || []).map((result) => result.toString('utf8')).join('');
    }

    /**
     * Gets the [SubscribableStream](xref:botframework-streaming.SubscribableStream) content as a typed JSON object.
     *
     * @returns A typed object Promise with `SubscribableStream` content.
     */
    async readAsJson<T>(): Promise<T> {
        const stringToParse = await this.readAsString();
        return <T>JSON.parse(stringToParse);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private async readAll(): Promise<Record<string, any>> {
        // do a read-all
        const allData: INodeBuffer[] = [];
        let count = 0;
        const stream = this.getStream();

        // populate the array with any existing buffers
        while (count < stream.length) {
            const chunk = stream.read(stream.length);
            allData.push(chunk);
            count += (chunk as INodeBuffer).length;
        }

        if (count < this.length) {
            const readToEnd = new Promise<boolean>((resolve): void => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const callback = (cs: ContentStream) => (chunk: any): void => {
                    allData.push(chunk);
                    count += (chunk as INodeBuffer).length;
                    if (count === cs.length) {
                        resolve(true);
                    }
                };

                stream.subscribe(callback(this));
            });

            await readToEnd;
        }

        return { bufferArray: allData, size: count };
    }
}
