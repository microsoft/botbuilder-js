/**
 * @module botframework-streaming
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
export class TransportDisconnectedEventArgs {
    public static Empty: TransportDisconnectedEventArgs = new TransportDisconnectedEventArgs();
    public reason: string;

    public constructor(reason?: string) {
        this.reason = reason;
    }
}
