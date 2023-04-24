/**
 * @module botframework-streaming
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { IReceiveResponse } from '../interfaces';

/**
 * A streaming pending request.
 */
class PendingRequest {
    requestId: string;
    resolve: (response: IReceiveResponse) => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    reject: (reason?: any) => void;
}

/**
 * Orchestrates and manages pending streaming requests.
 */
export class RequestManager {
    private readonly _pendingRequests: Record<string, PendingRequest> = {};

    /**
     * Gets the count of the pending requests.
     *
     * @returns Number with the pending requests count.
     */
    pendingRequestCount(): number {
        return Object.keys(this._pendingRequests).length;
    }

    /**
     * Signal fired when all response tasks have completed.
     *
     * @param requestId The ID of the StreamingRequest.
     * @param response The [IReceiveResponse](xref:botframework-streaming.IReceiveResponse) in response to the request.
     * @returns A Promise that when completed returns `true` if the `requestId`'s pending response task was completed, otherwise `false`.
     */
    async signalResponse(requestId: string, response: IReceiveResponse): Promise<boolean> {
        const pendingRequest = this._pendingRequests[requestId];

        if (pendingRequest) {
            pendingRequest.resolve(response);
            delete this._pendingRequests[requestId];

            return true;
        }

        return false;
    }

    /**
     * Constructs and returns a response for this request.
     *
     * @param requestId The ID of the StreamingRequest being responded to.
     * @returns The response to the specified request.
     */
    getResponse(requestId: string): Promise<IReceiveResponse> {
        let pendingRequest = this._pendingRequests[requestId];

        if (pendingRequest) {
            return Promise.reject(`requestId '${requestId}' already exists in RequestManager`);
        }

        pendingRequest = new PendingRequest();
        pendingRequest.requestId = requestId;

        const promise = new Promise<IReceiveResponse>((resolve, reject): void => {
            pendingRequest.resolve = resolve;
            pendingRequest.reject = reject;
        });

        this._pendingRequests[requestId] = pendingRequest;

        return promise;
    }

    /**
     * Rejects all requests pending a response.
     *
     * @param reason The reason for rejection.
     */
    rejectAllResponses(reason?: Error): void {
        Object.entries(this._pendingRequests).forEach(([requestId, { reject }]) => {
            reject(reason);

            delete this._pendingRequests[requestId];
        });
    }
}
