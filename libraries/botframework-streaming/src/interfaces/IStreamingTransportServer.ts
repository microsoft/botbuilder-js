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
 * Abstraction to define the characteristics of a streaming transport server.
 * Example possible implementations include WebSocket transport server or NamedPipe transport server.
 */
export interface IStreamingTransportServer {
    start(onListen?: () => void): Promise<string>;
    disconnect(): void;
    send(request: StreamingRequest): Promise<IReceiveResponse>;
    isConnected?: boolean;
}
