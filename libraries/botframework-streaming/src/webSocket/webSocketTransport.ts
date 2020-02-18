/**
 * @module botframework-streaming
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { ISocket } from '../interfaces';
import { ITransportSender } from '../interfaces/ITransportSender';
import { ITransportReceiver } from '../interfaces/ITransportReceiver';

/**
 * Web socket based transport.
 */
export class WebSocketTransport implements ITransportSender, ITransportReceiver {
    private _socket: ISocket;
    private readonly _queue: Buffer[];
    private _active: Buffer;
    private _activeOffset: number;
    private _activeReceiveResolve: (resolve: Buffer) => void;
    private _activeReceiveReject: (reason?: any) => void;
    private _activeReceiveCount: number;

    /**
     * Creates a new instance of the [WebSocketTransport](xref:botframework-streaming.WebSocketTransport) class.
     *
     * @param ws The ISocket to build this transport on top of.
     */
    public constructor(ws: ISocket) {
        this._socket = ws;
        this._queue = [];
        this._activeOffset = 0;
        this._activeReceiveCount = 0;
        this._socket.setOnMessageHandler((data): void => {
            this.onReceive(data);
        });
        this._socket.setOnErrorHandler((err): void => {
            this.onError(err);
        });
        this._socket.setOnCloseHandler((): void => {
            this.onClose();
        });
    }

    /**
     * Sends the given buffer out over the socket's connection.
     *
     * @param buffer The buffered data to send out over the connection.
     */
    public send(buffer: Buffer): number {
        if (this._socket && this._socket.isConnected) {
            this._socket.write(buffer);

            return buffer.length;
        }

        return 0;
    }

    /**
     * Returns true if the transport is connected to a socket.
     */
    public get isConnected(): boolean {
        return this._socket.isConnected;
    }

    /**
     * Close the socket this transport is connected to.
     */
    public close(): void {
        if (this._socket && this._socket.isConnected) {
            this._socket.close();
        }
    }

    /**
     * Attempt to receive incoming data from the connected socket.
     *
     * @param count The number of bytes to attempt to receive.
     * @returns A buffer populated with the received data.
     */
    public async receive(count: number): Promise<Buffer> {
        if (this._activeReceiveResolve) {
            throw new Error('Cannot call receiveAsync more than once before it has returned.');
        }

        this._activeReceiveCount = count;

        let promise = new Promise<Buffer>((resolve, reject): void => {
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
    public onReceive(data: Buffer): void {
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
        this._socket = null;
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
                    let buffer = this._active;
                    this._active = null;

                    this._activeReceiveResolve(buffer);
                } else {
                    // create a Buffer.from and copy some of the contents into it
                    let available = Math.min(this._activeReceiveCount, this._active.length - this._activeOffset);
                    let buffer = Buffer.alloc(available);
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
