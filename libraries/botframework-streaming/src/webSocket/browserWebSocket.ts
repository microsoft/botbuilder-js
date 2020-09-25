/**
 * @module botframework-streaming
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { IBrowserFileReader, IBrowserWebSocket, ISocket, INodeBuffer } from '../interfaces';

/**
 * Represents a WebSocket that implements `ISocket`.
 */
export class BrowserWebSocket implements ISocket {
    private webSocket: IBrowserWebSocket;

    /**
     * Creates a new instance of the [BrowserWebSocket](xref:botframework-streaming.BrowserWebSocket) class.
     *
     * @param socket The socket object to build this connection on.
     */
    public constructor(socket?: IBrowserWebSocket) {
        if (socket) {
            this.webSocket = socket;
        }
    }

    /**
     * Connects to the supporting socket using WebSocket protocol.
     *
     * @param serverAddress The address the server is listening on.
     */
    public async connect(serverAddress: string): Promise<void> {
        let resolver;
        let rejector;

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
     * True if the socket is currently connected.
     */
    public get isConnected(): boolean {
        return this.webSocket.readyState === 1;
    }

    /**
     * Writes a buffer to the socket and sends it.
     *
     * @param buffer The buffer of data to send across the connection.
     */
    public write(buffer: INodeBuffer): void {
        this.webSocket.send(buffer);
    }

    /**
     * Close the socket.
     */
    public close(): void {
        this.webSocket.close();
    }

    /**
     * Set the handler for text and binary messages received on the socket.
     */
    public setOnMessageHandler(handler: (x: any) => void): void {
        const bufferKey: string = 'buffer';
        const packets = [];
        this.webSocket.onmessage = (evt): void => {
            const fileReader = new FileReader();
            const queueEntry = { buffer: null };
            packets.push(queueEntry);
            fileReader.onload = (e): void => {
                const t = e.target as unknown as IBrowserFileReader;
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
     */
    public setOnErrorHandler(handler: (x: any) => void): void {
        this.webSocket.onerror = (error): void => { if (error) { handler(error); } };
    }

    /**
     * Set the callback to call when encountering socket closures.
     */
    public setOnCloseHandler(handler: (x: any) => void): void {
        this.webSocket.onclose = handler;
    }
}
