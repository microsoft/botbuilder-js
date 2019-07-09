/**
 * @module botframework-streaming-extensions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { ReceiveRequest } from './ReceiveRequest';
import { StreamingResponse } from './StreamingResponse';

export abstract class RequestHandler {
  public abstract processRequestAsync(request: ReceiveRequest, logger?): Promise<StreamingResponse>;
}
