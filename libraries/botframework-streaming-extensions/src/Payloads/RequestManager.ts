/**
 * @module botframework-streaming-extensions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { ReceiveResponse } from '../ReceiveResponse';

class PendingRequest {
  public requestId: string;
  public resolve: (response: ReceiveResponse) => void;
  public reject: (reason?: any) => void;
}

export class RequestManager {
  private readonly _pendingRequests = {};

  public pendingRequestCount(): number {
    return Object.keys(this._pendingRequests).length;
  }

  public async signalResponse(requestId: string, response: ReceiveResponse): Promise<boolean> {
    let pendingRequest = this._pendingRequests[requestId];

    if (pendingRequest) {
      pendingRequest.resolve(response);

      /* tslint:disable:no-dynamic-delete */
      delete this._pendingRequests[requestId];

      return Promise.resolve(true);
    }

    return Promise.resolve(false);
  }

  public async getResponseAsync(requestId: string): Promise<ReceiveResponse> {
    let pendingRequest = this._pendingRequests[requestId];

    if (pendingRequest) {
      return Promise.reject('requestId already exists in RequestManager');
    }

    pendingRequest = new PendingRequest();
    pendingRequest.requestId = requestId;

    let promise = new Promise<ReceiveResponse>((resolve, reject) => {
      pendingRequest.resolve = resolve;
      pendingRequest.reject = reject;
    });

    this._pendingRequests[requestId] = pendingRequest;

    return promise;
  }
}
