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
 * The basic response type sent over Bot Framework Protocol 3 with Streaming Extensions transports, equivalent to HTTP response messages.
 */
export class StreamingResponse {
    statusCode: number;
    streams: HttpContentStream[] = [];

    /**
     * Creates a streaming response with the passed in method, path, and body.
     *
     * @param statusCode The HTTP verb to use for this request.
     * @param body Optional body containing additional information.
     * @returns A streaming response with the appropriate statuscode and passed in body.
     */
    static create(statusCode: number, body?: HttpContent): StreamingResponse {
        const response = new StreamingResponse();
        response.statusCode = statusCode;
        if (body) {
            response.addStream(body);
        }

        return response;
    }

    /**
     * Adds a new stream attachment to this streaming request.
     *
     * @param content The Http content to include in the new stream attachment.
     */
    addStream(content: HttpContent): void {
        this.streams.push(new HttpContentStream(content));
    }

    /**
     * Sets the contents of the body of this streaming response.
     *
     * @param body The JSON text to write to the body of the streaming response.
     */
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
    setBody(body: any): void {
        const stream = new SubscribableStream();
        stream.write(JSON.stringify(body), 'utf8');
        this.addStream(
            new HttpContent(
                {
                    type: 'application/json; charset=utf-8',
                    contentLength: stream.length,
                },
                stream
            )
        );
    }
}
