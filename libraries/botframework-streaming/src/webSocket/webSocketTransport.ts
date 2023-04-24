/**
 * @module botframework-streaming
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { INodeBuffer, ISocket, ITransportSender, ITransportReceiver } from '../interfaces';

/**
 * Web socket based transport.
 */
export class WebSocketTransport implements ITransportSender, ITransportReceiver {
    private readonly _queue: INodeBuffer[] = [];
    private _active: INodeBuffer;
    private _activeOffset = 0;
    private _activeReceiveResolve: (resolve: INodeBuffer) => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private _activeReceiveReject: (reason?: any) => void;
    private _activeReceiveCount = 0;

    /**
     * Creates a new instance of the [WebSocketTransport](xref:botframework-streaming.WebSocketTransport) class.
     *
     * @param ws The ISocket to build this transport on top of.
     */
    constructor(private ws: ISocket) {
        this.ws.setOnMessageHandler((data): void => {
            this.onReceive(data);
        });
        this.ws.setOnErrorHandler((err): void => {
            this.onError(err);
        });
        this.ws.setOnCloseHandler((): void => {
            this.onClose();
        });
    }

    /**
     * Sends the given buffer out over the socket's connection.
     *
     * @param buffer The buffered data to send out over the connection.
     * @returns A number indicating the length of the sent data if the data was successfully sent, otherwise 0.
     */
    send(buffer: INodeBuffer): number {
        if (this.ws?.isConnected) {
            this.ws.write(buffer);

            return buffer.length;
        }

        return 0;
    }

    /**
     * Returns true if the transport is connected to a socket.
     *
     * @returns `true` if the the transport is connected and ready to send data, `false` otherwise.
     */
    get isConnected(): boolean {
        return !!this.ws?.isConnected;
    }

    /**
     * Close the socket this transport is connected to.
     */
    close(): void {
        if (this.ws?.isConnected) {
            this.ws.close();
        }
    }

    /**
     * Attempt to receive incoming data from the connected socket.
     *
     * @param count The number of bytes to attempt to receive.
     * @returns A buffer populated with the received data.
     */
    async receive(count: number): Promise<INodeBuffer> {
        if (this._activeReceiveResolve) {
            throw new Error('Cannot call receive more than once before it has returned.');
        }

        this._activeReceiveCount = count;

        const promise = new Promise<INodeBuffer>((resolve, reject): void => {
            this._activeReceiveResolve = resolve;
            this._activeReceiveReject = reject;
        });

        this.trySignalData();

        return promise;
    }

    /**
     * Sets the transport to attempt to receive incoming data that has not yet arrived.
     *
     * @param data A buffer to store incoming data in.
     */
    onReceive(data: INodeBuffer): void {
        if (this._queue && data && data.byteLength > 0) {
            this._queue.push(Buffer.from(data));
            this.trySignalData();
        }
    }

    private onClose(): void {
        if (this._activeReceiveReject) {
            this._activeReceiveReject(new Error('Socket was closed.'));
        }

        this._active = null;
        this._activeOffset = 0;
        this._activeReceiveResolve = null;
        this._activeReceiveReject = null;
        this._activeReceiveCount = 0;
        this.ws = null;
    }

    private onError(err: Error): void {
        if (this._activeReceiveReject) {
            this._activeReceiveReject(err);
        }
        this.onClose();
    }

    private trySignalData(): void {
        if (this._activeReceiveResolve) {
            if (!this._active && this._queue.length > 0) {
                this._active = this._queue.shift();
                this._activeOffset = 0;
            }

            if (this._active) {
                if (this._activeOffset === 0 && this._active.length === this._activeReceiveCount) {
                    // can send the entire _active buffer
                    const buffer = this._active;
                    this._active = null;

                    this._activeReceiveResolve(buffer);
                } else {
                    // create a Buffer.from and copy some of the contents into it
                    const available = Math.min(this._activeReceiveCount, this._active.length - this._activeOffset);
                    const buffer = Buffer.alloc(available);
                    this._active.copy(buffer, 0, this._activeOffset, this._activeOffset + available);
                    this._activeOffset += available;

                    // if we used all of active, set it to undefined
                    if (this._activeOffset >= this._active.length) {
                        this._active = null;
                        this._activeOffset = 0;
                    }

                    this._activeReceiveResolve(buffer);
                }

                this._activeReceiveCount = 0;
                this._activeReceiveReject = null;
                this._activeReceiveResolve = null;
            }
        }
    }
}
