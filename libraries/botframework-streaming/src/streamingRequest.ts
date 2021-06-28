/**
 * @module botframework-streaming
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { HttpContent, HttpContentStream } from './httpContentStream';
import { SubscribableStream } from './subscribableStream';

/**
 * The basic request type sent over Bot Framework Protocol 3 with Streaming Extensions transports, equivalent to HTTP request messages.
 */
export class StreamingRequest {
    /**
     * Request verb, null on responses.
     */
    verb: string;

    /**
     * Request path; null on responses.
     */
    path: string;

    /**
     * List of associated streams.
     */
    streams: HttpContentStream[] = [];

    /**
     * Creates a streaming request with the passed in method, path, and body.
     *
     * @param method The HTTP verb to use for this request.
     * @param path Optional path where the resource can be found on the remote server.
     * @param body Optional body to send to the remote server.
     * @returns On success returns a streaming request with appropriate status code and body.
     */
    static create(method: string, path?: string, body?: HttpContent): StreamingRequest {
        const request = new StreamingRequest();
        request.verb = method;
        request.path = path;
        if (body) {
            request.setBody(body);
        }

        return request;
    }

    /**
     * Adds a new stream attachment to this streaming request.
     *
     * @param content The Http content to include in the new stream attachment.
     */
    addStream(content: HttpContent): void {
        if (!content) {
            throw new Error('Argument Undefined Exception: content undefined.');
        }

        this.streams.push(new HttpContentStream(content));
    }

    /**
     * Sets the contents of the body of this streamingRequest.
     *
     * @param body The JSON text to write to the body of the streamingRequest.
     */
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
    setBody(body: any): void {
        if (typeof body === 'string') {
            const stream = new SubscribableStream();
            stream.write(body, 'utf8');
            this.addStream(
                new HttpContent(
                    {
                        type: 'application/json; charset=utf-8',
                        contentLength: stream.length,
                    },
                    stream
                )
            );
        } else if (typeof body === 'object') {
            this.addStream(body);
        }
    }
}
