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

    // connect(options: any | number, connectionListener?: Function): any; 
    // connect(port: number, host: string, connectionListener?: Function): any; 
    // connect(port: number, connectionListener?: Function): any; 
    // connect(path: string, connectionListener?: Function): any;

    connect(options: any, connectionListener?: () => void): any;
    connect(port: number, host: string, connectionListener?: () => void): any;
    connect(port: number, connectionListener?: () => void): any;
    connect(path: string, connectionListener?: () => void): any;



    
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
    
    // write(buffer: ValidBuffer, cb?: (err?: Error) => void): boolean;
    // write(str: string | Uint8Array, encoding?: string, cb?: (err?: Error) => void): boolean;
    
    write(buffer: ValidBuffer): boolean; 
    write(buffer: ValidBuffer, cb?: (err?: Error) => void): boolean; 
    write(str: string, cb?: Function): boolean; 
    write(str: string, encoding?: string, cb?: Function): boolean; 
    write(str: string, encoding?: string, fd?: string): boolean; 
    write(data: any, encoding?: string, callback?: Function): void; 

    ref(): void;
    unref(): void;

    readonly bytesRead: number;
    readonly bufferSize: number;
    readonly bytesWritten: number;
    readonly localAddress: string;
    readonly localPort: number;

}

// type SocketConnectOpts = TcpSocketConnectOpts | IpcSocketConnectOpts;
// type LookupFunction = (hostname: string, options: any, callback: (err: NodeJS.ErrnoException | null, address: string, family: number) => void) => void;

// interface TcpSocketConnectOpts {
//     port: number;
//     host?: string;
//     localAddress?: string;
//     localPort?: number;
//     hints?: number;
//     family?: number;
//     lookup?: LookupFunction;
// }

// interface IpcSocketConnectOpts {
//     path: string;
// }

interface AddressInfo {
    address: string;
    family: string;
    port: number;
}
