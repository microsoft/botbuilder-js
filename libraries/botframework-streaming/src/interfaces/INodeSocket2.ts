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
export interface INodeSocket2 {
    connecting: boolean;
    destroyed: boolean;
    writable: boolean;

    end(str: string, cb?: Function): void;
    destroy(error?: Error): void;
    
    on(event: string, listener: (...args: any[]) => void): this;
    on(event: "close", listener: (had_error: boolean) => void): this;
    on(event: "connect", listener: () => void): this;
    on(event: "data", listener: (data: Buffer) => void): this;
    on(event: "end", listener: () => void): this;
    on(event: "error", listener: (err: Error) => void): this;

    write(buffer: Buffer, cb?: Function): boolean;
    write(str: string, cb?: Function): boolean;
}
