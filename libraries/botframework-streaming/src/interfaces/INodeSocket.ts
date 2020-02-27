/**
 * @module botframework-streaming
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { INodeBuffer, ValidBuffer } from './INodeBuffer';
import { Duplex } from 'stream';

/**
 * Represents a Socket from the `net` module in Node.js.
 * 
 * This interface supports the framework and is not intended to be called directly for your code.
 */
export interface INodeSocket extends Duplex{
    connecting: boolean;
    destroyed: boolean;
    writable: boolean;

    address(): AddressInfo | string;

    connect(options: any, connectionListener?: () => void): this;
    connect(port: number, host: string, connectionListener?: () => void): this;
    connect(port: number, connectionListener?: () => void): this;
    connect(path: string, connectionListener?: () => void): this;
    
    end(cb?: () => void): void; 
    end(chunk: any, cb?: () => void): void; 
    end(chunk: any, encoding?: string, cb?: () => void): void;
    
    destroy(error?: Error): void;
    
    on(event: string, listener: (...args: any[]) => void): this;
    on(event: "close", listener: (had_error: boolean) => void): this;
    on(event: "connect", listener: () => void): this;
    on(event: "data", listener: (data: INodeBuffer) => void): this;
    on(event: "end", listener: () => void): this;
    on(event: "error", listener: (err: Error) => void): this;
    
    setTimeout(timeout: number, callback?: () => void): this;
    setKeepAlive(enable?: boolean, initialDelay?: number): this;
    setNoDelay(noDelay?: boolean): this;
    
    write(buffer: ValidBuffer, cb?: (err?: Error) => void): boolean;
    write(str: string | Uint8Array, encoding?: string, cb?: (err?: Error) => void): boolean;
    
    ref(): this;
    unref(): this;

    readonly bytesRead: number;
    readonly bufferSize: number;
    readonly bytesWritten: number;
    readonly localAddress: string;
    readonly localPort: number;

}

interface AddressInfo {
    address: string;
    family: string;
    port: number;
}
