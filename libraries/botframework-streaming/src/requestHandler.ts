/**
 * @module botframework-streaming
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { IReceiveRequest } from './Interfaces/IReceiveRequest';
import { StreamingResponse } from './streamingResponse';

/**
 * Implemented by classes used to process incoming streaming requests sent over an [IStreamingTransport](xref:botbuilder-streaming.IStreamingTransport).
 */
export abstract class RequestHandler {

    /**
     * The method that must be implemented in order to handle incoming requests.
     * 
     * @param request A receipt request for this handler to process.
     * @returns A promise that will produce a streaming response on successful completion.
     */
    public abstract processRequest(request: IReceiveRequest): Promise<StreamingResponse>;
}
