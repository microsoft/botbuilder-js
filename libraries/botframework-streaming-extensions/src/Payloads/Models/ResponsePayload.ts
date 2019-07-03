/**
 * @module botframework-streaming-extensions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { StreamDescription } from './StreamDescription';

export class ResponsePayload {
  public statusCode: number;
  public streams: StreamDescription[];

  constructor(statusCode: number) {
    this.statusCode = statusCode;
  }
}
