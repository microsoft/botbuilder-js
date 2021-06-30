/**
 * @module botframework-streaming
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { generateGuid } from './utilities/protocol-base';
import { IHttpContentHeaders } from './interfaces';
import type { SubscribableStream } from './subscribableStream';

/**
 * An attachment contained within a StreamingRequest's stream collection, which itself contains any form of media item.
 */
export class HttpContentStream {
    readonly id: string;
    description: { id: string; type: string; length: number };

    /**
     * Initializes a new instance of the [HttpContentStream](xref:botframework-streaming.HttpContentStream) class.
     *
     * @param content The [HttpContent](xref:botframework-streaming.HttpContent) to assign to the [HttpContentStream](xref:botframework-streaming.HttpContentStream).
     */
    constructor(readonly content: HttpContent) {
        this.id = generateGuid();
        this.description = {
            id: this.id,
            type: this.content?.headers?.type ?? 'unknown',
            length: this.content?.headers?.contentLength ?? 0,
        };
    }
}

/**
 * The HttpContent class that contains a [SubscribableStream](xref:botframework-streaming.SubscribableStream).
 */
export class HttpContent {
    /**
     * Initializes a new instance of the [HttpContent](xref:botframework-streaming.HttpContent) class.
     *
     * @param headers The Streaming Http content header definition.
     * @param stream The stream of buffered data.
     */
    constructor(public headers: IHttpContentHeaders, private readonly stream: SubscribableStream) {}

    /**
     * Gets the data contained within this [HttpContent](xref:botframework-streaming.HttpContent).
     *
     * @returns This [HttpContent's](xref:botframework-streaming.HttpContent) [SubscribableStream](xref:botframework-streaming.SubscribableStream) member.
     */
    getStream(): SubscribableStream {
        return this.stream;
    }
}
