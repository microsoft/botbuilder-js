/**
 * @module botframework-streaming-extensions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { CancellationToken } from './CancellationToken';
import { ReceiveResponse } from './ReceiveResponse';
import { StreamingRequest } from './StreamingRequest';

export interface IStreamingTransportClient {
  connectAsync(): Promise<void>;
  disconnect(): void;
  sendAsync(request: StreamingRequest, cancellationToken: CancellationToken): Promise<ReceiveResponse>;
}
