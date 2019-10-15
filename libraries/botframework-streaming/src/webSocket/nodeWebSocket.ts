/**
 * @module botframework-streaming
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import * as http from 'http';
import * as WaterShed from 'watershed';
import { ISocket } from '../interfaces/ISocket';

export class NodeWebSocket implements ISocket {
    private readonly waterShedSocket: any;
    private connected: boolean;

    /**
     * Creates a new instance of the [NodeWebSocket](xref:botframework-streaming.NodeWebSocket) class.
     *
     * @param socket The WaterShed socket object to build this connection on.
     */
    public constructor(waterShedSocket?) {
        this.waterShedSocket = waterShedSocket;
        this.connected = !!waterShedSocket;
    }

    /**
     * True if the socket is currently connected.
     */
    public isConnected(): boolean {
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
        let shed = new WaterShed.Watershed();
        let wskey = shed.generateKey();
        let options = {
            port: port,
            hostname: serverAddress,
            headers: {
                connection: 'upgrade',
                'Sec-WebSocket-Key': wskey,
                'Sec-WebSocket-Version': '13'
            }
        };
        let req = http.request(options);
        req.end();
        req.on('upgrade', function(res, socket, head): void {
            shed.connect(res, socket, head, wskey);
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
