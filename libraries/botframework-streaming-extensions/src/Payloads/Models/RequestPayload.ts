/**
 * @module botframework-streaming-extensions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { StreamDescription } from './StreamDescription';

export class RequestPayload {
  public verb: string;
  public path: string;
  public streams: StreamDescription[];

  constructor(verb: string, path: string) {
    this.verb = verb;
    this.path = path;
  }
}
