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
    readable: boolean;
    readonly bytesRead: number;
    readonly bufferSize: number;
    readonly bytesWritten: number;
    readonly localAddress: string;
    readonly localPort: number;
    readonly writableHighWaterMark: number;
    readonly writableLength: number;
    readonly readableHighWaterMark: number;
    readonly readableLength: number;
    readonly readableFlowing: boolean | null;

    address(): AddressInfo | string;

    connect(options: any, connectionListener?: () => void): any;
    connect(port: number, host: string, connectionListener?: () => void): any;
    connect(port: number, connectionListener?: () => void): any;
    connect(path: string, connectionListener?: () => void): any;

    cork(): void;
    uncork(): void;

    end(cb?: () => void): void; 
    end(chunk: any, cb?: () => void): void; 
    end(chunk: any, encoding?: string, cb?: () => void): void;
    
    _destroy(error: Error | null, callback: (error: Error | null) => void): void;
    destroy(error?: Error): void;
}

interface AddressInfo {
    address: string;
    family: string;
    port: number;
}
