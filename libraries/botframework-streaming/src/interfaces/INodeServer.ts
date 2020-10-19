/**
 * @module botframework-streaming
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { IEventEmitter } from '.';

/**
 * Represents a Server from the `net` module in Node.js.
 *
 * This interface supports the framework and is not intended to be called directly for your code.
 */
export interface INodeServer extends IEventEmitter {
    constructor: this;
    close(callback?: (err?: Error) => void): this;
    listen(port?: number, hostname?: string, backlog?: number, listeningListener?: () => void): this;
    listen(path: string, listeningListener?: () => void): this;
}
