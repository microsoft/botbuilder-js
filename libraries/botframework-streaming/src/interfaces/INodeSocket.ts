/**
 * @module botframework-streaming
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { INodeBuffer, ValidBuffer } from './INodeBuffer';
import { IEventEmitter } from './IEventEmitter';

/**
 * Represents a Socket from the `net` module in Node.js.
 * 
 * This interface supports the framework and is not intended to be called directly for your code.
 */
export interface INodeSocket {
    connecting: boolean;
    destroyed: boolean;
    writable: boolean;
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

    pause(): this;
    resume(): this;
    isPaused(): boolean;
    unpipe(destination?: any): this;
    unshift(chunk: any): void;
    wrap(oldStream: any): this;
    push(chunk: any, encoding?: string): boolean;

    pipe<T extends WritableStream>(destination: T, options?: { end?: boolean; }): T;

    addListener(event: "close", listener: () => void): this;
    addListener(event: "data", listener: (chunk: any) => void): this;
    addListener(event: "end", listener: () => void): this;
    addListener(event: "readable", listener: () => void): this;
    addListener(event: "error", listener: (err: Error) => void): this;
    addListener(event: string | symbol, listener: (...args: any[]) => void): this;

    emit(event: "close"): boolean;
    emit(event: "data", chunk: any): boolean;
    emit(event: "end"): boolean;
    emit(event: "readable"): boolean;
    emit(event: "error", err: Error): boolean;
    emit(event: string | symbol, ...args: any[]): boolean;

    eventNames(): Array<string | symbol>;
    _final(callback: (error?: Error | null) => void): void;
    listeners(event: string | symbol): Function[];
    listenerCount(type: string | symbol): number;

    off(event: string | symbol, listener: (...args: any[]) => void): this;
    
    on(event: string, listener: (...args: any[]) => void): this;
    on(event: "close", listener: (had_error: boolean) => void): this;
    on(event: "connect", listener: () => void): this;
    on(event: "data", listener: (data: INodeBuffer) => void): this;
    on(event: "end", listener: () => void): this;
    on(event: "error", listener: (err: Error) => void): this;

    once(event: "close", listener: () => void): this;
    once(event: "data", listener: (chunk: any) => void): this;
    once(event: "end", listener: () => void): this;
    once(event: "readable", listener: () => void): this;
    once(event: "error", listener: (err: Error) => void): this;
    once(event: string | symbol, listener: (...args: any[]) => void): this;

    prependListener(event: "close", listener: () => void): this;
    prependListener(event: "data", listener: (chunk: any) => void): this;
    prependListener(event: "end", listener: () => void): this;
    prependListener(event: "readable", listener: () => void): this;
    prependListener(event: "error", listener: (err: Error) => void): this;
    prependListener(event: string | symbol, listener: (...args: any[]) => void): this;

    prependOnceListener(event: "close", listener: () => void): this;
    prependOnceListener(event: "data", listener: (chunk: any) => void): this;
    prependOnceListener(event: "end", listener: () => void): this;
    prependOnceListener(event: "readable", listener: () => void): this;
    prependOnceListener(event: "error", listener: (err: Error) => void): this;
    prependOnceListener(event: string | symbol, listener: (...args: any[]) => void): this;

    rawListeners(event: string | symbol): Function[];

    removeAllListeners(event?: string | symbol): this;
    removeListener(event: string | symbol, listener: (...args: any[]) => void): this;

    [Symbol.asyncIterator](): AsyncIterableIterator<any>;
    
    _read(size: number): void;
    read(size?: number): any;

    setDefaultEncoding(encoding: string): this;
    setEncoding(encoding: string): this;
    setMaxListeners(n: number): this;
    getMaxListeners(): number;
    setTimeout(timeout: number, callback?: () => void): this;
    setKeepAlive(enable?: boolean, initialDelay?: number): this;
    setNoDelay(noDelay?: boolean): this;
    
    _write(chunk: any, encoding: string, callback: (error?: Error | null) => void): void;
    _writev?(chunks: Array<{ chunk: any, encoding: string }>, callback: (error?: Error | null) => void): void;

    write(buffer: ValidBuffer, cb?: (err?: Error) => void): boolean; 
    write(str: string, encoding?: string, cb?: Function): boolean; 
    write(buffer: ValidBuffer): boolean; 
    write(str: string, cb?: Function): boolean; 
    write(str: string, encoding?: string, fd?: string): boolean; 
    write(data: any, encoding?: string, callback?: Function): void; 
    write(chunk: any, cb?: (error: Error | null | undefined) => void): boolean;
    write(chunk: any, encoding?: string, cb?: (error: Error | null | undefined) => void): boolean;

    ref(): any;
    unref(): any;
}

interface AddressInfo {
    address: string;
    family: string;
    port: number;
}

interface WritableStream extends IEventEmitter {
    writable: boolean;
    write(buffer: Buffer | string, cb?: Function): boolean;
    write(str: string, encoding?: string, cb?: Function): boolean;
    end(cb?: Function): void;
    end(buffer: Buffer, cb?: Function): void;
    end(str: string, cb?: Function): void;
    end(str: string, encoding?: string, cb?: Function): void;
}