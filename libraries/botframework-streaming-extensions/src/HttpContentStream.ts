/**
 * @module botframework-streaming-extensions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { SubscribableStream } from './SubscribableStream';
import { generateGuid } from './Utilities/protocol-base';
import { IHttpContentHeaders } from './Interfaces';

export class HttpContentStream {
    public readonly id: string;
    public readonly content: HttpContent;

    public constructor(content: HttpContent) {
        this.id = generateGuid();
        this.content = content;
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
