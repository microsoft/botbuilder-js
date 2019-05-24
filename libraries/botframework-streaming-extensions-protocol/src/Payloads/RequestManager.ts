import { CancellationToken } from '../CancellationToken';
import { ReceiveResponse } from '../ReceiveResponse';
import { IRequestManager } from './IRequestManager';

class PendingRequest {
  public requestId: string;
  public cancellationToken: CancellationToken;
  public resolve: (response: ReceiveResponse) => void;
  public reject: (reason?: any) => void;
}

export class RequestManager implements IRequestManager {
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

  public async getResponseAsync(requestId: string, cancellationToken: CancellationToken): Promise<ReceiveResponse> {
    let pendingRequest = this._pendingRequests[requestId];

    if (pendingRequest) {
      return Promise.reject('requestId already exists in RequestManager');
    }

    pendingRequest = new PendingRequest();
    pendingRequest.requestId = requestId;
    pendingRequest.cancellationToken = cancellationToken;

    /* tslint:disable:promise-must-complete */
    let promise = new Promise<ReceiveResponse>((resolve, reject) => {
      pendingRequest.resolve = resolve;
      pendingRequest.reject = reject;
    });

    this._pendingRequests[requestId] = pendingRequest;

    return promise;
  }
}
