/**
 * @module botframework-streaming-extensions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { CancellationToken } from './CancellationToken';

export class CancellationTokenSource {
    public readonly token: CancellationToken;
  
    constructor() {
      this.token = new CancellationToken();
    }
  
    public cancel(): void {
      this.token.cancel();
    }
  
  }