/**
 * @module botframework-streaming
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/**
 * Abstraction for a generic transport definition.
 */
export interface ITransport {
    isConnected: boolean;
    close();
}
