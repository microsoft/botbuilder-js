/**
 * @module botframework-streaming
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { ISocket } from '../interfaces/ISocket';

export class BrowserWebSocket implements ISocket {
    private webSocket: WebSocket;

    /// <summary>
    /// Creates a new instance of the BrowserWebSocket class.
    /// </summary>
    /// <param name="socket">The socket object to build this connection on.</param>
    public constructor(socket?: WebSocket) {
        if (socket) {
            this.webSocket = socket;
        }
    }

    /// <summary>
    /// Connects to the supporting socket using WebSocket protocol.
    /// </summary>
    /// <param name="serverAddress">The address the server is listening on.</param>
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

    /// <summary>
    /// True if the socket is currently connected.
    /// </summary>
    public isConnected(): boolean {
        return this.webSocket.readyState === 1;
    }

    /// <summary>
    /// Writes a buffer to the socket and sends it.
    /// </summary>
    /// <param name="buffer">The buffer of data to send across the connection.</param>
    public write(buffer: Buffer): void {
        this.webSocket.send(buffer);
    }

    /// <summary>
    /// Close the socket.
    /// </summary>
    public close(): void {
        this.webSocket.close();
    }

    /// <summary>
    /// Set the handler for text and binary messages received on the socket.
    /// </summary>
    public setOnMessageHandler(handler: (x: any) => void): void {
        let packets = [];
        this.webSocket.onmessage = (evt): void => {
            let fileReader = new FileReader();
            let queueEntry = {buffer: null};
            packets.push(queueEntry);
            fileReader.onload = (e): void => {
                let t: FileReader = e.target as FileReader;
                queueEntry['buffer'] = t.result;
                if (packets[0] === queueEntry) {
                    while(0 < packets.length && packets[0]['buffer']) {
                        handler(packets[0]['buffer']);
                        packets.splice(0, 1);
                    }
                }
            };
            fileReader.readAsArrayBuffer(evt.data);
        };
    }

    /// <summary>
    /// Set the callback to call when encountering errors.
    /// </summary>
    public setOnErrorHandler(handler: (x: any) => void): void {
        this.webSocket.onerror = (error): void => { if (error) { handler(error); } };
    }

    /// <summary>
    /// Set the callback to call when encountering socket closures.
    /// </summary>
    public setOnCloseHandler(handler: (x: any) => void): void {
        this.webSocket.onclose = handler;
    }
}
