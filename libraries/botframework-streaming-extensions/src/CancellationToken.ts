/**
 * @module botframework-streaming-extensions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
export class CancellationToken {
  private cancelled: boolean;

  /// <summary>
  /// Creates a new instance of the CancellationToken class.
  /// </summary>
  constructor() {
    this.cancelled = false;
  }

  /// <summary>
  /// Throws when called if this token has been cancelled.
  /// </summary>
  public throwIfCancelled(): void {
    if (this.isCancelled()) {
      throw new Error('cancelled');
    }
  }

  /// <summary>
  /// Returns true if this token has been cancelled.
  /// </summary>
  public isCancelled(): boolean {
    return this.cancelled === true;
  }

  /// <summary>
  /// Cancel this token.
  /// </summary>
  public cancel(): void {
    this.cancelled = true;
  }
}