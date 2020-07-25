/**
 * @module botframework-streaming
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Duplex, DuplexOptions, Readable } from 'stream-browserify';

export interface SubscribableStream {
    end?(cb?: () => void): void;
    end?(chunk: any, cb?: () => void): void;
    end?(chunk: any, encoding?: string, cb?: () => void): void;
    push?(chunk: any): boolean;
    push?(chunk: any, encoding: string): boolean;
    push?(chunk: any, encoding?: string): boolean;
    read(size?: number): any;
    write?(chunk: any): boolean;
    write?(chunk: any, encoding: string): boolean;
    write?(chunk: any, encoding: string, callback: (error?: Error | null) => void): boolean;
}

export class SubscribableStream extends Duplex implements SubscribableStream {
    public length: number = 0;

    private readonly bufferList: Buffer[] = [];
    private _onData: (chunk: any) => void;

    public constructor(options?: DuplexOptions) {
        super(options);
    }

    public _write(chunk: any, encoding: string, callback: (error?: Error | null) => void): void {
        const buffer = Buffer.from(chunk);
        this.bufferList.push(buffer);
        this.length += chunk.length;
        if (this._onData) {
            this._onData(buffer);
        }
        callback();
    }

    public _read(size: number): void {
        if (this.bufferList.length === 0) {
            // null signals end of stream
            (this as Readable).push(null);
        } else {
            let total = 0;
            while (total < size && this.bufferList.length > 0) {
                const buffer = this.bufferList[0];
                (this as Readable).push(buffer);
                this.bufferList.splice(0, 1);
                total += buffer.length;
            }
        }
    }

    public subscribe(onData: (chunk: any) => void): void {
        this._onData = onData;
    }
}
