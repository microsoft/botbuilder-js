/**
 * @module botframework-streaming
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { IncomingMessage, request } from 'http';
import { Socket } from 'net';
import { Watershed } from 'watershed';
import { ISocket } from '../interfaces/ISocket';

export class NodeWebSocket implements ISocket {
    private waterShedSocket: any;
    private connected: boolean;
    protected watershedShed: Watershed;

    /**
     * Creates a new instance of the [NodeWebSocket](xref:botframework-streaming.NodeWebSocket) class.
     *
     * @param socket The WaterShed socket object to build this connection on.
     */
    public constructor(waterShedSocket?) {
        this.waterShedSocket = waterShedSocket;
        this.connected = !!waterShedSocket;
        this.watershedShed = new Watershed();
    }

    /**
     * Create and set a WaterShed WebSocket with an HTTP Request, Socket and Buffer.
     * @param req IncomingMessage
     * @param socket Socket
     * @param head Buffer
     */
    public create(req: IncomingMessage, socket: Socket, head: Buffer): void {
        this.waterShedSocket = this.watershedShed.accept(req, socket, head);
        this.connected = true;
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
        this.waterShedSocket.send(buffer);
    }

    /**
     * Connects to the supporting socket using WebSocket protocol.
     *
     * @param serverAddress The address the server is listening on.
     * @param port The port the server is listening on, defaults to 8082.
     */
    public async connect(serverAddress, port = 8082): Promise<void> {
        // Following template from https://github.com/joyent/node-watershed#readme
        const wskey = this.watershedShed.generateKey();
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
        req.on('upgrade', function(res, socket, head): void {
            this.watershedShed.connect(res, socket, head, wskey);
        });

        this.connected = true;

        return new Promise<void>((resolve, reject): void => {
            req.on('close', resolve);
            req.on('error', reject);
        });
    }

    /**
     * Set the handler for text and binary messages received on the socket.
     */
    public setOnMessageHandler(handler: (x: any) => void): void {
        this.waterShedSocket.on('text', handler);
        this.waterShedSocket.on('binary', handler);
    }

    /**
     * Close the socket.
     */
    public close(): any {
        this.connected = false;

        return this.waterShedSocket.end();
    }

    /**
     * Set the callback to call when encountering socket closures.
     */
    public setOnCloseHandler(handler: (x: any) => void): void {
        this.waterShedSocket.on('end', handler);
    }

    /**
     * Set the callback to call when encountering errors.
     */
    public setOnErrorHandler(handler: (x: any) => void): void {
        this.waterShedSocket.on('error', (error): void => { if (error) { handler(error); } });
    }
}
