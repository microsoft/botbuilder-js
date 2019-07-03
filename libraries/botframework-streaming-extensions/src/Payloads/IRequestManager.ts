/**
 * @module botframework-streaming-extensions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { CancellationToken } from '../CancellationToken';
import { ReceiveResponse } from '../ReceiveResponse';

export interface IRequestManager {
  signalResponse(requestId: string, response: ReceiveResponse): Promise<boolean>;

  getResponseAsync(requestId: string, cancellationToken: CancellationToken): Promise<ReceiveResponse>;
}
