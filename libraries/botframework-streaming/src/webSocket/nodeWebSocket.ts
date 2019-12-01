/**
 * @module botframework-streaming
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import * as crypto from 'crypto';
import { IncomingMessage, request } from 'http';
import { Socket } from 'net';
import * as WebSocket from 'ws';

import { INodeIncomingMessage, INodeBuffer, INodeSocket, ISocket } from '../interfaces';
const NONCE_LENGTH = 16;

export class NodeWebSocket implements ISocket {
    private wsSocket: WebSocket;
    protected wsServer: WebSocket.Server;

    /**
     * Creates a new instance of the [NodeWebSocket](xref:botframework-streaming.NodeWebSocket) class.
     *
     * @param socket The `ws` WebSocket instance to build this connection on.
     */
    public constructor(wsSocket?: WebSocket) {
        this.wsSocket = wsSocket;
    }

    /**
     * Create and set a `ws` WebSocket with an HTTP Request, Socket and Buffer.
     * @param req INodeIncomingMessage
     * @param socket INodeSocket
     * @param head INodeBuffer
     */
    public async create(req: INodeIncomingMessage, socket: INodeSocket, head: INodeBuffer): Promise<void> {
        this.wsServer = new WebSocket.Server({ noServer: true });
        return new Promise<void>((resolve, reject) => {
            try {
                this.wsServer.handleUpgrade(req as IncomingMessage, socket as Socket, head as Buffer, (websocket) => {
                    this.wsSocket = websocket;
                    resolve();
                });
            } catch (err) {
                reject(err);
            }
        });
    }

    /**
     * True if the 'ws' WebSocket is currently connected.
     */
    public get isConnected(): boolean {
        return this.wsSocket && this.wsSocket.readyState === WebSocket.OPEN;
    }

    /**
     * Writes a buffer to the socket and sends it.
     *
     * @param buffer The buffer of data to send across the connection.
     */
    public write(buffer: INodeBuffer): void {
        this.wsSocket.send(buffer);
    }

    /**
     * Connects to the supporting socket using WebSocket protocol.
     *
     * @param serverAddress The address the server is listening on.
     * @param port The port the server is listening on, defaults to 8082.
     */
    public async connect(serverAddress, port = 8082): Promise<void> {
        this.wsServer = new WebSocket.Server({ noServer: true });
        // Key generation per https://tools.ietf.org/html/rfc6455#section-1.3 (pg. 7)
        const wskey = crypto.randomBytes(NONCE_LENGTH).toString('base64');
        const options = {
            port: port,
            hostname: serverAddress,
            headers: {
                connection: 'upgrade',
                'Sec-WebSocket-Key': wskey,
                'Sec-WebSocket-Version': '13'
            }
        };
        const req = request(options);
        req.end();
        req.on('upgrade', (res, socket, head): void => {
            // @types/ws does not contain the signature for completeUpgrade
            // https://github.com/websockets/ws/blob/0a612364e69fc07624b8010c6873f7766743a8e3/lib/websocket-server.js#L269
            (this.wsServer as any).completeUpgrade(wskey, undefined, res, socket, head, (websocket): void => {
                this.wsSocket = websocket;
            });
        });

        return new Promise<void>((resolve, reject): void => {
            req.on('close', resolve);
            req.on('error', reject);
        });
    }

    /**
     * Set the handler for `'data'` and `'message'` events received on the socket.
     */
    public setOnMessageHandler(handler: (x: any) => void): void {
        this.wsSocket.on('data', handler);
        this.wsSocket.on('message', handler);
    }

    /**
     * Close the socket.
     * @remarks
     * Optionally pass in a status code and string explaining why the connection is closing.
     * @param code
     * @param data
     */
    public close(code?: number, data?: string): void {
        return this.wsSocket.close(code, data);
    }

    /**
     * Set the callback to call when encountering socket closures.
     */
    public setOnCloseHandler(handler: (x: any) => void): void {
        this.wsSocket.on('close', handler);
    }

    /**
     * Set the callback to call when encountering errors.
     */
    public setOnErrorHandler(handler: (x: any) => void): void {
        this.wsSocket.on('error', (error): void => { if (error) { handler(error); } });
    }
}