/**
 * @module botframework-streaming
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Duplex } from 'stream';
import { INodeBuffer } from './INodeBuffer';

/**
 * Represents a Duplex from the `stream` module in Node.js.
 *
 * This interface supports the framework and is not intended to be called directly for your code.
 */
export interface INodeDuplex extends Duplex {
    on(event: string | symbol, listener: (...args: any[]) => void): this;
    on(event: 'data', listener: (chunk: INodeBuffer) => void): this;
}
