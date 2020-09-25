/**
 * @module botframework-streaming
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Duplex, DuplexOptions } from 'stream';

/**
 * An extension of `Duplex` that operates in conjunction with a `PayloadAssembler` to convert raw bytes into a consumable form.
 */
export class SubscribableStream extends Duplex {
    public length: number = 0;

    private readonly bufferList: Buffer[] = [];
    private _onData: (chunk: any) => void;

    /**
     * Initializes a new instance of the `SubscribableStream` class.
     * @param options The `DuplexOptions` to use when constructing this stream.
     */
    public constructor(options?: DuplexOptions) {
        super(options);
    }

    /**
     * Writes data to the buffered list.
     * All calls to writable.write() that occur between the time writable._write() is called and the callback is called will cause the written data to be buffered.
     * @param chunk The Buffer to be written.
     * @param encoding The encoding.
     * @param callback Callback for when this chunk of data is flushed.
     */
    public _write(chunk: any, encoding: string, callback: (error?: Error | null) => void): void {
        let buffer = Buffer.from(chunk);
        this.bufferList.push(buffer);
        this.length += chunk.length;
        if (this._onData) {
            this._onData(buffer);
        }
        callback();
    }

    /**
     * Reads the buffered list.
     * Once the readable._read() method has been called, it will not be called again until more data is pushed through the readable.push() method.
     * Empty data such as empty buffers and strings will not cause readable._read() to be called.
     * @param size Number of bytes to read.
     */
    public _read(size: number): void {
        if (this.bufferList.length === 0) {
            // null signals end of stream
            this.push(null);
        } else {
            let total = 0;
            while (total < size && this.bufferList.length > 0) {
                let buffer = this.bufferList[0];
                this.push(buffer);
                this.bufferList.splice(0, 1);
                total += buffer.length;
            }
        }
    }

    /**
     * Subscribes to the stream when receives data.
     * @param onData Callback to be called when onData is executed.
     */
    public subscribe(onData: (chunk: any) => void): void {
        this._onData = onData;
    }
}
