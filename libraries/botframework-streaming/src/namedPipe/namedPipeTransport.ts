/**
 * @module botframework-streaming
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { INodeBuffer } from '../interfaces/INodeBuffer';
import { INodeSocket } from '../interfaces/INodeSocket';
import { ITransportSender } from '../interfaces/ITransportSender';
import { ITransportReceiver } from '../interfaces/ITransportReceiver';

/**
 * Named pipes based transport sender and receiver abstraction
 */
export class NamedPipeTransport implements ITransportSender, ITransportReceiver {
    public static readonly PipePath: string = '\\\\.\\pipe\\';
    public static readonly ServerIncomingPath: string = '.incoming';
    public static readonly ServerOutgoingPath: string = '.outgoing';

    private _socket: INodeSocket;
    private readonly _queue: INodeBuffer[];
    private _active: INodeBuffer;
    private _activeOffset: number;
    private _activeReceiveResolve: (resolve: INodeBuffer) => void;
    private _activeReceiveReject: (reason?: any) => void;
    private _activeReceiveCount: number;

    /**
     * Creates a new instance of the [NamedPipeTransport](xref:botframework-streaming.NamedPipeTransport) class.
     *
     * @param socket The socket object to build this connection on.
     */
    public constructor(socket: INodeSocket) {
        this._socket = socket;
        this._queue = [];
        this._activeOffset = 0;
        this._activeReceiveCount = 0;
        if (socket) {
            this._socket.on('data', (data): void => {
                this.socketReceive(data);
            });
            this._socket.on('close', (): void => {
                this.socketClose();
            });
            this._socket.on('error', (err): void => {
                this.socketError(err);
            });
        }
    }

    /**
     * Writes to the pipe and sends.
     *
     * @param buffer The buffer full of data to send out across the socket.
     */
    public send(buffer: INodeBuffer): number {
        if (this._socket && !this._socket.connecting && this._socket.writable) {
            this._socket.write(buffer);

            return buffer.length;
        }

        return 0;
    }

    /**
     * Returns true if currently connected.
     */
    public get isConnected(): boolean {
        return !(!this._socket || this._socket.destroyed || this._socket.connecting);
    }

    /**
     * Closes the transport.
     */
    public close(): void {
        if (this._socket) {
            this._socket.end('end');
            this._socket = null;
        }
    }

    /**
     * Receive from the transport into the buffer.
     */
    public receive(count: number): Promise<INodeBuffer> {
        if (this._activeReceiveResolve) {
            throw new Error('Cannot call receive more than once before it has returned.');
        }

        this._activeReceiveCount = count;

        let promise = new Promise<INodeBuffer>((resolve, reject): void => {
            this._activeReceiveResolve = resolve;
            this._activeReceiveReject = reject;
        });

        this.trySignalData();

        return promise;
    }

    private socketReceive(data: INodeBuffer): void {
        if (this._queue && data && data.length > 0) {
            this._queue.push(data);
            this.trySignalData();
        }
    }

    private socketClose(): void {
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

    private socketError(err: Error): void {
        if (this._activeReceiveReject) {
            this._activeReceiveReject(err);
        }
        this.socketClose();
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
                    // create a new buffer and copy some of the contents into it
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
