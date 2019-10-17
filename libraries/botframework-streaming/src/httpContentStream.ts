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

export class HttpContentStream {
    public readonly id: string;
    public readonly content: HttpContent;
    public description: { id: string; type: string; length: number; };

    public constructor(content: HttpContent) {
        this.id = generateGuid();
        this.content = content;
        this.description = {id: this.id, type: (this.content.headers) ? this.content.headers.type : 'unknown', length: (this.content.headers) ? this.content.headers.contentLength : 0};
    }
}

export class HttpContent {
    public headers: IHttpContentHeaders;
    private readonly stream: SubscribableStream;

    public constructor(headers: IHttpContentHeaders, stream: SubscribableStream) {
        this.headers = headers;
        this.stream = stream;
    }

    public getStream(): SubscribableStream {
        return this.stream;
    }
}
