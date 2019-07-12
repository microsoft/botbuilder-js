/**
 * @module botframework-streaming-extensions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { HttpClient, HttpOperationResponse, WebResource } from '@azure/ms-rest-js';
import { IStreamingTransportServer, StreamingRequest } from '..';

export class StreamingHttpClient implements HttpClient {
    private readonly server: IStreamingTransportServer;

    public constructor(server: IStreamingTransportServer) {
        this.server = server;
    }

    /// <summary>
    /// This function hides the default sendRequest of the HttpClient, replacing it
    /// with a version that takes the WebResource created by the BotFrameworkAdapter
    /// and converting it to a form that can be sent over a streaming transport.
    /// </summary>
    /// <param name="httpRequest">The outgoing request created by the BotframeworkAdapter.</param>
    /// <returns>The streaming transport compatible response to send back to the client.</returns>
    public async sendRequest(httpRequest: WebResource): Promise<HttpOperationResponse> {
        const request = this.mapHttpRequestToProtocolRequest(httpRequest);
        request.Path = request.Path.substring(request.Path.indexOf('/v3'));
        const res = await this.server.send(request);

        return {
            request: httpRequest,
            status: res.StatusCode,
            headers: httpRequest.headers,
            readableStreamBody: res.Streams.length > 0 ? res.Streams[0].getStream() : undefined
        };
    }

    private mapHttpRequestToProtocolRequest(httpRequest: WebResource): StreamingRequest {

        return StreamingRequest.create(httpRequest.method, httpRequest.url, httpRequest.body);
    }
}
