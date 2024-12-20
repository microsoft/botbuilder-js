/**
 * @module botframework-streaming
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Socket } from 'net';
import { INodeBuffer } from './INodeBuffer';

/**
 * Represents a Socket from the `net` module in Node.js.
 *
 * This interface supports the framework and is not intended to be called directly for your code.
 */
export interface INodeSocket extends Socket {
    on(event: string, listener: (...args: any[]) => void): this;
    on(event: 'data', listener: (data: INodeBuffer) => void): this;
}
