/**
 * @module botframework-streaming-extensions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { SubscribableStream } from './SubscribableStream';
import { generateGuid } from './Utilities/protocol-base';
import { IHttpContentHeaders } from './Interfaces/IHttpContentHeaders';

export class HttpContentStream {
    public readonly id: string;
    public readonly content: HttpContent;
    public description: { id: string; type: string; length: number; };

    public constructor(content: HttpContent) {
        this.id = generateGuid();
        this.content = content;
        this.description = {id: this.id, type: (this.content.headers) ? this.content.headers.type : "unknown", length: (this.content.headers) ? this.content.headers.contentLength : 0};
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
