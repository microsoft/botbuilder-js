/**
 * @module botframework-streaming
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { IEventEmitter } from '.';
import { INodeBuffer, ValidBuffer } from './INodeBuffer';

/**
 * Represents a Socket from the `net` module in Node.js.
 * 
 * This interface supports the framework and is not intended to be called directly for your code.
 */
export interface INodeSocket extends IEventEmitter {
    connecting: boolean;
    destroyed: boolean;
    writable: boolean;

    end(str: string, cb?: Function): void;
    destroy(error?: Error): void;
    
    on(event: string, listener: (...args: any[]) => void): this;
    on(event: "close", listener: (had_error: boolean) => void): this;
    on(event: "connect", listener: () => void): this;
    on(event: "data", listener: (data: INodeBuffer) => void): this;
    on(event: "end", listener: () => void): this;
    on(event: "error", listener: (err: Error) => void): this;

    write(buffer: ValidBuffer, cb?: (err?: Error) => void): boolean;
    write(str: string | Uint8Array, encoding?: string, cb?: (err?: Error) => void): boolean;
}
