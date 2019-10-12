/**
 * @module botframework-streaming
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { HttpContent, HttpContentStream } from './HttpContentStream';
import { SubscribableStream } from './SubscribableStream';

export class StreamingResponse {
    public statusCode: number;
    public streams: HttpContentStream[] = [];

    /// <summary>
    /// Creates a response using the passed in statusCode and optional body.
    /// </summary>
    /// <param name="statusCode">The <see cref="HttpStatusCode"/> to set on the <see cref="StreamingResponse"/>.</param>
    /// <param name="body">An optional body containing additional information.</param>
    /// <returns>A streamingResponse with the appropriate statuscode and passed in body.</returns>
    public static create(statusCode: number, body?: HttpContent): StreamingResponse {
        let response = new StreamingResponse();
        response.statusCode = statusCode;
        if (body) {
            response.addStream(body);
        }

        return response;
    }

    /// <summary>
    /// Adds a new stream attachment to this <see cref="StreamingResponse"/>.
    /// </summary>
    /// <param name="content">The <see cref="HttpContent"/> to include in the new stream attachment.</param>
    public addStream(content: HttpContent): void {
        this.streams.push(new HttpContentStream(content));
    }

    /// <summary>
    /// Sets the contents of the body of this streamingResponse.
    /// </summary>
    /// <param name="body">The JSON text to write to the body of the streamingResponse.</param>
    public setBody(body: any): void {
        let stream = new SubscribableStream();
        stream.write(JSON.stringify(body), 'utf8');
        this.addStream(new HttpContent({
            type: 'application/json; charset=utf-8',
            contentLength: stream.length
        }, stream));
    }
}
