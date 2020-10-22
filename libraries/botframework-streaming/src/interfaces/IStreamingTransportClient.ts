/**
 * @module botframework-streaming
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { IReceiveResponse } from './IReceiveResponse';
import { StreamingRequest } from '../streamingRequest';

/**
 * Abstraction to define the characteristics of a streaming transport client.
 * Example possible implementations include WebSocket transport client or NamedPipe transport client.
 */
export interface IStreamingTransportClient {
    connect(): Promise<void>;
    disconnect(): void;
    send(request: StreamingRequest): Promise<IReceiveResponse>;
}
