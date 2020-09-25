/**
 * @module botframework-streaming
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { SubscribableStream } from './subscribableStream';
import { generateGuid } from './utilities/protocol-base';
import { IHttpContentHeaders } from './interfaces/IHttpContentHeaders';

/**
 * An attachment contained within a StreamingRequest's stream collection,
 * which itself contains any form of media item.
 */
export class HttpContentStream {
    public readonly id: string;
    public readonly content: HttpContent;
    public description: { id: string; type: string; length: number; };

    /**
     * Initializes a new instance of the `HttpContentStream` class.
     * @param content The content to assign to the `HttpContentStream`.
     */
    public constructor(content: HttpContent) {
        this.id = generateGuid();
        this.content = content;
        this.description = {id: this.id, type: (this.content.headers) ? this.content.headers.type : 'unknown', length: (this.content.headers) ? this.content.headers.contentLength : 0};
    }
}

/**
 * The HttpContent class that contains a SubscribableStream.
 */
export class HttpContent {
    public headers: IHttpContentHeaders;
    private readonly stream: SubscribableStream;

    /**
     * Initializes a new instance of the `HttpContent` class.
     * @param headers The Streaming Http content header definition.
     * @param stream The stream of buffered data.
     */
    public constructor(headers: IHttpContentHeaders, stream: SubscribableStream) {
        this.headers = headers;
        this.stream = stream;
    }

    /**
     * Gets the data contained within this `HttpContent`.
     */
    public getStream(): SubscribableStream {
        return this.stream;
    }
}
