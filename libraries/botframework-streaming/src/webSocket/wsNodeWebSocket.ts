/**
 * @module botframework-streaming
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { ISocket } from '../interfaces';
import { IncomingMessage, request } from 'http';
import { Socket } from 'net';
import * as WebSocket from 'ws';
import * as crypto from 'crypto';

// Taken from watershed, these needs to be investigated.
const NONCE_LENGTH = 16;

export class WsNodeWebSocket implements ISocket {
    private wsSocket: WebSocket;
    private connected: boolean;
    protected wsServer: WebSocket.Server;

    /**
     * Creates a new instance of the [WsNodeWebSocket](xref:botframework-streaming.WsNodeWebSocket) class.
     *
     * @param socket The ws socket object to build this connection on.
     */
    public constructor(wsSocket?: WebSocket) {
        this.wsSocket = wsSocket;
        this.connected = !!wsSocket;
        this.wsServer = new WebSocket.Server({ noServer: true });
    }

    /**
     * Create and set a `ws` WebSocket with an HTTP Request, Socket and Buffer.
     * @param req IncomingMessage
     * @param socket Socket
     * @param head Buffer
     */
    public async create(req: IncomingMessage, socket: Socket, head: Buffer): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            try {
                this.wsServer.handleUpgrade(req, socket, head, (websocket) => {
                    this.wsSocket = websocket;
                    this.connected = true;
                    resolve();
                });
            } catch (err) {
                reject(err);
            }
        });
    }

    /**
     * True if the socket is currently connected.
     */
    public get isConnected(): boolean {
        return this.connected;
    }

    /**
     * Writes a buffer to the socket and sends it.
     *
     * @param buffer The buffer of data to send across the connection.
     */
    public write(buffer: Buffer): void {
        this.wsSocket.send(buffer);
    }

    /**
     * Connects to the supporting socket using WebSocket protocol.
     *
     * @param serverAddress The address the server is listening on.
     * @param port The port the server is listening on, defaults to 8082.
     */
    public async connect(serverAddress, port = 8082): Promise<void> {
        // Taken from WaterShed, this needs to be investigated.
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
                this.connected = true;
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
        this.connected = false;

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