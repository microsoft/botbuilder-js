/**
 * @module botframework-streaming-extensions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { ReceiveResponse } from './ReceiveResponse';
import { StreamingRequest } from './StreamingRequest';

/// <summary>
/// Interface implemented by StreamingTransportClient classes for each transport type.
/// </summary>
export interface IStreamingTransportClient {
  connectAsync(): Promise<void>;
  disconnect(): void;
  sendAsync(request: StreamingRequest): Promise<ReceiveResponse>;
}
