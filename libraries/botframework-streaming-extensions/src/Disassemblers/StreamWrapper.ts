/**
 * @module botframework-streaming-extensions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Stream } from '../Stream';

export class StreamWrapper {
  public stream: Stream;
  public streamLength?: number;

  constructor(stream: Stream, streamLength?: number) {
    this.stream = stream;
    this.streamLength = streamLength;
  }
}
