/**
 * @module botframework-streaming
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { IReceiveResponse } from './IReceiveResponse';
import { StreamingRequest } from '../StreamingRequest';

/// <summary>
/// Interface implemented by StreamingTransportClient classes for each transport type.
/// </summary>
export interface IStreamingTransportClient {
    connect(): Promise<void>;
    disconnect(): void;
    send(request: StreamingRequest): Promise<IReceiveResponse>;
}
