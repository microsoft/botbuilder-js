/**
 * @module botframework-streaming
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/**
 * Represents a Socket from the `net` module in Node.js.
 * 
 * This interface supports the framework and is not intended to be called directly for your code.
 */
export interface INodeSocket {
    writable: boolean;
    write(str: string, cb?: Function): boolean;
    destroy(error?: Error): void;
}
