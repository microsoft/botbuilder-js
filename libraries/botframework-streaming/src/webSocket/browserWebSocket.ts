/**
 * @module botframework-streaming
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { IBrowserFileReader, IBrowserWebSocket, INodeBuffer, ISocket } from '../interfaces';

/**
 * Represents a WebSocket that implements [ISocket](xref:botframework-streaming.ISocket).
 */
export class BrowserWebSocket implements ISocket {
    private webSocket: IBrowserWebSocket;

    /**
     * Creates a new instance of the [BrowserWebSocket](xref:botframework-streaming.BrowserWebSocket) class.
     *
     * @param socket The socket object to build this connection on.
     */
    constructor(socket?: IBrowserWebSocket) {
        if (socket) {
            this.webSocket = socket;
        }
    }

    /**
     * Connects to the supporting socket using WebSocket protocol.
     *
     * @param serverAddress The address the server is listening on.
     * @returns A Promise that resolves the websocket is open and rejects if an error is encountered.
     */
    async connect(serverAddress: string): Promise<void> {
        let resolver: (value: void | PromiseLike<void>) => void;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let rejector: (reason?: any) => void;

        if (!this.webSocket) {
            this.webSocket = new WebSocket(serverAddress);
        }

        this.webSocket.onerror = (e): void => {
            rejector(e);
        };

        this.webSocket.onopen = (e): void => {
            resolver(e);
        };

        return new Promise<void>((resolve, reject): void => {
            resolver = resolve;
            rejector = reject;
        });
    }

    /**
     * Indicates if the [BrowserWebSocket's](xref:botframework-streaming.BrowserWebSocket) underlying websocket is currently connected.
     *
     * @returns `true` if the underlying websocket is ready and availble to send messages, otherwise `false`.
     */
    get isConnected(): boolean {
        return this.webSocket.readyState === 1;
    }

    /**
     * Writes a buffer to the socket and sends it.
     *
     * @param buffer The buffer of data to send across the connection.
     */
    write(buffer: INodeBuffer): void {
        this.webSocket.send(buffer);
    }

    /**
     * Close the socket.
     */
    close(): void {
        this.webSocket.close();
    }

    /**
     * Set the handler for text and binary messages received on the socket.
     *
     * @param handler The callback to handle the "message" event.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setOnMessageHandler(handler: (x: any) => void): void {
        const bufferKey = 'buffer';
        const packets = [];
        this.webSocket.onmessage = (evt): void => {
            const fileReader = new FileReader();
            const queueEntry = { buffer: null };
            packets.push(queueEntry);
            fileReader.onload = (e): void => {
                const t = (e.target as unknown) as IBrowserFileReader;
                queueEntry[bufferKey] = t.result;
                if (packets[0] === queueEntry) {
                    while (0 < packets.length && packets[0][bufferKey]) {
                        handler(packets[0][bufferKey]);
                        packets.splice(0, 1);
                    }
                }
            };
            fileReader.readAsArrayBuffer(evt.data);
        };
    }

    /**
     * Set the callback to call when encountering errors.
     *
     * @param handler The callback to handle the "error" event.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setOnErrorHandler(handler: (x: any) => void): void {
        this.webSocket.onerror = (error): void => {
            if (error) {
                handler(error);
            }
        };
    }

    /**
     * Set the callback to call when encountering socket closures.
     *
     * @param handler The callback to handle the "close" event.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setOnCloseHandler(handler: (x: any) => void): void {
        this.webSocket.onclose = handler;
    }
}
