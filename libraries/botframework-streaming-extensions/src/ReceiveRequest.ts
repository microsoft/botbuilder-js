/**
 * @module botframework-streaming-extensions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { ContentStream } from './ContentStream';

export class ReceiveRequest {
  /// Request verb, null on responses
  /// </summary>
  public Verb: string;

  /// <summary>
  /// Request path; null on responses
  /// </summary>
  public Path: string;

  public Streams: ContentStream[];

  constructor() {
    this.Streams = [];
  }
}
