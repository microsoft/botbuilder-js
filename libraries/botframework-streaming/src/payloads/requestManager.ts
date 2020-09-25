/**
 * @module botframework-streaming
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { IReceiveResponse } from '../interfaces/IReceiveResponse';

/**
 * A streaming pending request.
 */
class PendingRequest {
    public requestId: string;
    public resolve: (response: IReceiveResponse) => void;
    public reject: (reason?: any) => void;
}

/**
 * Orchestrates and manages pending streaming requests.
 */
export class RequestManager {
    private readonly _pendingRequests = {};

    /**
     * Gets the count of the pending requests.
     * @returns Number with the pending requests count.
     */
    public pendingRequestCount(): number {
        return Object.keys(this._pendingRequests).length;
    }

    /**
     * Signal fired when all response tasks have completed.
     * @param requestId The ID of the StreamingRequest.
     * @param response The ReceiveResponse in response to the request.
     */
    public async signalResponse(requestId: string, response: IReceiveResponse): Promise<boolean> {
        let pendingRequest = this._pendingRequests[requestId];

        if (pendingRequest) {
            pendingRequest.resolve(response);
            delete this._pendingRequests[requestId];

            return true;
        }

        return false;
    }

    /**
     * Constructs and returns a response for this request.
     * @param requestId The ID of the StreamingRequest being responded to.
     * @returns The response to the specified request.
     */
    public getResponse(requestId: string): Promise<IReceiveResponse> {
        let pendingRequest = this._pendingRequests[requestId];

        if (pendingRequest) {
            return Promise.reject(`requestId '${ requestId }' already exists in RequestManager`);
        }

        pendingRequest = new PendingRequest();
        pendingRequest.requestId = requestId;

        let promise = new Promise<IReceiveResponse>((resolve, reject): void => {
            pendingRequest.resolve = resolve;
            pendingRequest.reject = reject;
        });

        this._pendingRequests[requestId] = pendingRequest;

        return promise;
    }
}
