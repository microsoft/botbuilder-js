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
    length = 0;

    private readonly bufferList: Buffer[] = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private _onData: (chunk: any) => void;

    /**
     * Initializes a new instance of the [SubscribableStream](xref:botframework-streaming.SubscribableStream) class.
     *
     * @param options The `DuplexOptions` to use when constructing this stream.
     */
    constructor(options?: DuplexOptions) {
        super(options);
    }

    /**
     * Writes data to the buffered list.
     * All calls to writable.write() that occur between the time writable._write() is called and the callback is called will cause the written data to be buffered.
     *
     * @param chunk The Buffer to be written.
     * @param _encoding The encoding. Unused in the implementation of Duplex.
     * @param callback Callback for when this chunk of data is flushed.
     */
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
    _write(chunk: any, _encoding: string, callback: (error?: Error | null) => void): void {
        const buffer = Buffer.from(chunk);
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
     *
     * @param size Number of bytes to read.
     */
    _read(size: number): void {
        if (this.bufferList.length === 0) {
            // null signals end of stream
            this.push(null);
        } else {
            let total = 0;
            while (total < size && this.bufferList.length > 0) {
                const buffer = this.bufferList[0];
                this.push(buffer);
                this.bufferList.splice(0, 1);
                total += buffer.length;
            }
        }
    }

    /**
     * Subscribes to the stream when receives data.
     *
     * @param onData Callback to be called when onData is executed.
     */
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
    subscribe(onData: (chunk: any) => void): void {
        this._onData = onData;
    }
}
