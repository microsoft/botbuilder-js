/**
 * @module botframework-streaming-extensions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
export class StreamDescription {
  public id: string;
  public type: string;
  public length?: number;

  constructor(id: string) {
    this.id = id;
  }
}
