/**
 * @module botframework-streaming
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { INodeBuffer, INodeSocket, ITransportSender, ITransportReceiver } from '../interfaces';

/**
 * Named pipes based transport sender and receiver abstraction
 */
export class NamedPipeTransport implements ITransportSender, ITransportReceiver {
    static readonly PipePath: string = '\\\\.\\pipe\\';
    static readonly ServerIncomingPath: string = '.incoming';
    static readonly ServerOutgoingPath: string = '.outgoing';

    private readonly _queue: INodeBuffer[];
    private _active: INodeBuffer;
    private _activeOffset = 0;
    private _activeReceiveCount = 0;
    private _activeReceiveResolve: (resolve: INodeBuffer) => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private _activeReceiveReject: (reason?: any) => void;

    /**
     * Creates a new instance of the [NamedPipeTransport](xref:botframework-streaming.NamedPipeTransport) class.
     *
     * @param socket The socket object to build this connection on.
     */
    constructor(private socket: INodeSocket) {
        this._queue = [];
        if (socket) {
            this.socket.on('data', (data): void => {
                this.socketReceive(data);
            });
            this.socket.on('close', (): void => {
                this.socketClose();
            });
            this.socket.on('error', (err): void => {
                this.socketError(err);
            });
        }
    }

    /**
     * Writes to the pipe and sends.
     *
     * @param buffer The buffer full of data to send out across the socket.
     * @returns A number indicating the length of the sent data if the data was successfully sent, otherwise 0.
     */
    send(buffer: INodeBuffer): number {
        if (this.socket && !this.socket.connecting && this.socket.writable) {
            this.socket.write(buffer);

            return buffer.length;
        }

        return 0;
    }

    /**
     * Returns `true` if currently connected.
     *
     * @returns `true` if the the transport is connected and ready to send data, `false` otherwise.
     */
    get isConnected(): boolean {
        return !(!this.socket || this.socket.destroyed || this.socket.connecting);
    }

    /**
     * Closes the transport.
     */
    close(): void {
        if (this.socket) {
            this.socket.end('end');
            this.socket = null;
        }
    }

    /**
     * Receive from the transport into the buffer.
     *
     * @param count The maximum amount of bytes to write to the buffer.
     * @returns The buffer containing the data from the transport.
     */
    receive(count: number): Promise<INodeBuffer> {
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
        this.socket = null;
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
                    const buffer = this._active;
                    this._active = null;

                    this._activeReceiveResolve(buffer);
                } else {
                    // create a new buffer and copy some of the contents into it
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
