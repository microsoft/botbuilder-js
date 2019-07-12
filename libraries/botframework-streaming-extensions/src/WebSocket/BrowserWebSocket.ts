/**
 * @module botframework-streaming-extensions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { ISocket } from './ISocket';

export class BrowserWebSocket implements ISocket {
    private webSocket: WebSocket;

    /// <summary>
    /// Creates a new instance of the BrowserWebSocket class.
    /// </summary>
    /// <param name="socket">The socket object to build this connection on.</param>
    constructor(socket?: WebSocket) {
        if (socket) {
            this.webSocket = socket;
        }
    }

    /// <summary>
    /// Connects to the supporting socket using WebSocket protocol.
    /// </summary>
    /// <param name="serverAddress">The address the server is listening on.</param>
    public async connectAsync(serverAddress: string): Promise<void> {
        let resolver;
        let rejector;

        if (!this.webSocket) {
            this.webSocket = new WebSocket(serverAddress);
        }

        this.webSocket.onerror = (e) => {
            rejector(e);
        };

        this.webSocket.onopen = (e) => {
            resolver(e);
        };

        return new Promise<void>((resolve, reject) => {
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
    public write(buffer: Buffer) {
        this.webSocket.send(buffer);
    }

    /// <summary>
    /// Close the socket.
    /// </summary>
    public closeAsync() {
        this.webSocket.close();
    }

    /// <summary>
    /// Set the handler for text and binary messages received on the socket.
    /// </summary>
    public setOnMessageHandler(handler: (x: any) => void) {
        let packets = [];
        this.webSocket.onmessage = (evt) => {
            let fileReader = new FileReader();
            let queueEntry = {buffer: null};
            packets.push(queueEntry);
            fileReader.onload = (e) => {
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
    public setOnErrorHandler(handler: (x: any) => void) {
        this.webSocket.onerror = (error) => { if (error) { handler(error); } };
    }

    /// <summary>
    /// Set the callback to call when encountering socket closures.
    /// </summary>
    public setOnCloseHandler(handler: (x: any) => void) {
        this.webSocket.onclose = handler;
    }
}
