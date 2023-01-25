/**
 * @module botframework-streaming
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { IncomingMessage } from 'http';
import { URL } from 'url';
import * as WebSocket from 'ws';

import { INodeIncomingMessage, INodeBuffer, INodeSocket, ISocket } from '../interfaces';

/**
 * An implementation of [ISocket](xref:botframework-streaming.ISocket) to use with a [NodeWebSocketFactory](xref:botframework-streaming.NodeWebSocketFactory) to create a WebSocket server.
 */
export class NodeWebSocket implements ISocket {
    protected wsServer: WebSocket.Server;

    /**
     * Creates a new [NodeWebSocket](xref:botframework-streaming.NodeWebSocket) instance.
     *
     * @param wsSocket The `ws` WebSocket instance to build this connection on.
     */
    constructor(private wsSocket?: WebSocket) {}

    /**
     * Create and set a `ws` WebSocket with an HTTP Request, Socket and Buffer.
     *
     * @param req An HTTP Request matching the [INodeIncomingMessage](xref:botframework-streaming.INodeIncomingMessage) interface.
     * @param socket A Socket [INodeSocket](xref:botframework-streaming.INodeSocket) interface.
     * @param head A Buffer [INodeBuffer](xref:botframework-streaming.INodeBuffer) interface.
     * @returns A Promise that resolves after the WebSocket upgrade has been handled, otherwise rejects with a thrown error.
     */
    async create(req: INodeIncomingMessage, socket: INodeSocket, head: INodeBuffer): Promise<void> {
        this.wsServer = new WebSocket.Server({ noServer: true });
        return new Promise<void>((resolve, reject) => {
            try {
                this.wsServer.handleUpgrade(
                    req as IncomingMessage,
                    socket as INodeSocket,
                    head as INodeBuffer,
                    (websocket) => {
                        this.wsSocket = websocket;
                        resolve();
                    }
                );
            } catch (err) {
                reject(err);
            }
        });
    }

    /**
     * Indicates if the 'ws' WebSocket is currently connected and ready to send messages.
     *
     * @returns `true` if the underlying websocket is ready and availble to send messages, otherwise `false`.
     */
    get isConnected(): boolean {
        return this.wsSocket && this.wsSocket.readyState === WebSocket.OPEN;
    }

    /**
     * Writes a buffer to the socket and sends it.
     *
     * @param buffer The buffer of data to send across the connection.
     */
    write(buffer: INodeBuffer): void {
        this.wsSocket.send(buffer);
    }

    /**
     * Connects to the supporting socket using WebSocket protocol.
     *
     * @param serverAddress The host name or URL the server is listening on.
     * @param port If `serverAddress` is a host name, the port number the server is listening on, defaults to 8082. Otherwise, this argument is ignored.
     * @returns A Promise that resolves when the websocket connection is closed, or rejects on an error.
     */
    async connect(serverAddress: string, port = 8082): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            let url: URL;

            try {
                url = new URL(serverAddress);
                // eslint-disable-next-line no-empty
            } catch (_error) {}

            if (!url || !url.hostname) {
                url = new URL('ws://.');
                url.hostname = serverAddress;
                url.port = port + '';
            }

            const ws = (this.wsSocket = new WebSocket(url));

            ws.once('error', ({ message }) => reject(new Error(message)));
            ws.once('open', () => resolve());
        });
    }

    /**
     * Set the handler for `'message'` events received on the socket.
     *
     * @param handler The callback to handle the "message" event.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setOnMessageHandler(handler: (x: any) => void): void {
        this.wsSocket.on('message', handler);
    }

    /**
     * Close the socket.
     *
     * @remarks
     * Optionally pass in a status code and string explaining why the connection is closing.
     * @param code Optional status code to explain why the connection has closed.
     * @param data Optional additional data to explain why the connection has closed.
     */
    close(code?: number, data?: string): void {
        this.wsSocket.close(code, data);
    }

    /**
     * Set the callback to call when encountering socket closures.
     *
     * @param handler The callback to handle the "close" event.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setOnCloseHandler(handler: (x: any) => void): void {
        this.wsSocket.on('close', handler);
    }

    /**
     * Set the callback to call when encountering errors.
     *
     * @param handler The callback to handle the "error" event.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setOnErrorHandler(handler: (x: any) => void): void {
        this.wsSocket.on('error', (error): void => {
            if (error) {
                handler(error);
            }
        });
    }
}
