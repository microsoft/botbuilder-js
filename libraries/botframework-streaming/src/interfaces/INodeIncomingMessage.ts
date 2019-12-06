/**
 * @module botframework-streaming
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/**
 * Represents a IncomingMessage from the `http` module in Node.js.
 * 
 * This interface supports the framework and is not intended to be called directly for your code.
 */
export interface INodeIncomingMessage {
    /***
     * Optional. The request headers.
     */
    headers?: any;

    /***
     * Optional. The request method.
     */
    method?: any;
}
