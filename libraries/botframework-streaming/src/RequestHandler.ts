/**
 * @module botframework-streaming
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { IReceiveRequest } from './Interfaces/IReceiveRequest';
import { StreamingResponse } from './StreamingResponse';
/// <summary>
/// Implemented by classes used to process incoming requests sent over an <see cref="IStreamingTransport"/> and adhering to the Bot Framework Protocol v3 with Streaming Extensions.
/// </summary>
export abstract class RequestHandler {
    /// <summary>
    /// The method that must be implemented in order to handle incoming requests.
    /// </summary>
    /// <param name="request">A <see cref="ReceiveRequest"/> for this handler to process.</param>
    /// <param name="logger">Logger.</param>
    /// <returns>A promise that will produce a <see cref="StreamingResponse"/> on successful completion.</returns>
    public abstract processRequest(request: IReceiveRequest, logger?): Promise<StreamingResponse>;
}
