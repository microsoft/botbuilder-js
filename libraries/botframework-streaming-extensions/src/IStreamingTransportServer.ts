/**
 * @module botframework-streaming-extensions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { CancellationToken } from './CancellationToken';
import { ReceiveResponse } from './ReceiveResponse';
import { Request } from './StreamingRequest';

export interface IStreamingTransportServer {
  startAsync(): Promise<string>;
  disconnect(): void;
  sendAsync(request: Request, cancellationToken: CancellationToken): Promise<ReceiveResponse>;
}
