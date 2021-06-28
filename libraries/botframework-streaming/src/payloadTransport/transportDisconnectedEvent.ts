/**
 * @module botframework-streaming
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/**
 * Event to be included when disconnection events are fired.
 */
export class TransportDisconnectedEvent {
    /**
     * A new and empty TransportDisconnectedEvent.
     */
    static Empty: TransportDisconnectedEvent = new TransportDisconnectedEvent();

    /**
     * The reason the disconnection event fired, in plain text.
     */
    reason: string;

    /**
     * Indicates a transport disconnected with the reason provided via the constructor.
     *
     * @remarks
     * This class is used for communicating disconnection events between the
     * PayloadReceiver and PayloadSender.
     * @param reason The reason the disconnection event fired, in plain text.
     */
    constructor(reason?: string) {
        this.reason = reason;
    }
}
