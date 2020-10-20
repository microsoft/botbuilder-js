/**
 * @module botframework-streaming
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { SubscribableStream } from './subscribableStream';
import { PayloadAssembler } from './assemblers';
import { INodeBuffer } from './interfaces/INodeBuffer';

/**
 * A stream of fixed or infinite length containing content to be decoded.
 */
export class ContentStream {
    public id: string;
    private readonly assembler: PayloadAssembler;
    private stream: SubscribableStream;

    /**
     * Initializes a new instance of the [ContentStream](xref:botframework-streaming.ContentStream) class.
     * @param id The ID assigned to this instance.
     * @param assembler The [PayloadAssembler](xref:botframework-streaming.PayloadAssembler) assigned to this instance.
     */
    public constructor(id: string, assembler: PayloadAssembler) {
        if (!assembler) {
            throw Error('Null Argument Exception');
        }
        this.id = id;
        this.assembler = assembler;
    }

    /**
     * Gets the name of the type of the object contained within this [ContentStream](xref:botframework-streaming.ContentStream).
     */
    public get contentType(): string {
        return this.assembler.payloadType;
    }

    /**
     * Gets the length of this [ContentStream](xref:botframework-streaming.ContentStream).
     */
    public get length(): number {
        return this.assembler.contentLength;
    }

    /**
     * Gets the data contained within this [ContentStream](xref:botframework-streaming.ContentStream).
     */
    public getStream(): SubscribableStream {
        if (!this.stream) {
            this.stream = this.assembler.getPayloadStream();
        }

        return this.stream;
    }

    /**
     * Closes the assembler.
     */
    public cancel(): void {
        this.assembler.close();
    }

    /**
     * Gets the [SubscribableStream](xref:botframework-streaming.SubscribableStream) content as a string.
     * @returns A string Promise with [SubscribableStream](xref:botframework-streaming.SubscribableStream) content.
     */
    public async readAsString(): Promise<string> {
        const { bufferArray } = await this.readAll();
        return (bufferArray || []).map((result) => result.toString('utf8')).join('');
    }

    /**
     * Gets the [SubscribableStream](xref:botframework-streaming.SubscribableStream) content as a typed JSON object.
     * @returns A typed object Promise with `SubscribableStream` content.
     */
    public async readAsJson<T>(): Promise<T> {
        const stringToParse = await this.readAsString();
        try {
            return <T>JSON.parse(stringToParse);
        } catch (error) {
            throw error;
        }
    }

    /**
     * @private
     */
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
