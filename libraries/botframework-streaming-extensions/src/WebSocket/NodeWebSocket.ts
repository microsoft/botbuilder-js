/**
 * @module botframework-streaming-extensions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import * as http from 'http';
import * as WaterShed from 'watershed';
import { ISocket } from '../Interfaces/ISocket';

export class NodeWebSocket implements ISocket {
    private readonly waterShedSocket: any;
    private connected: boolean;

    /// <summary>
    /// Creates a new instance of the NodeWebSocket class.
    /// </summary>
    /// <param name="waterShedSocket">The WaterShed socket object to build this connection on.</param>
    public constructor(waterShedSocket?) {
        this.waterShedSocket = waterShedSocket;
        this.connected = !!waterShedSocket;
    }

    /// <summary>
    /// True if the socket is currently connected.
    /// </summary>
    public isConnected(): boolean {
        return this.connected;
    }

    /// <summary>
    /// Writes a buffer to the socket and sends it.
    /// </summary>
    /// <param name="buffer">The buffer of data to send across the connection.</param>
    public write(buffer: Buffer): void {
        this.waterShedSocket.send(buffer);
    }

    /// <summary>
    /// Connects to the supporting socket using WebSocket protocol.
    /// </summary>
    /// <param name="serverAddress">The address the server is listening on.</param>
    /// <param name="port">The port the server is listening on, defaults to 8082.</param>
    public async connect(serverAddress, port = 8082): Promise<void> {
    // following template from https://github.com/joyent/node-watershed#readme
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

    /// <summary>
    /// Set the handler for text and binary messages received on the socket.
    /// </summary>
    public setOnMessageHandler(handler: (x: any) => void): void {
        this.waterShedSocket.on('text', handler);
        this.waterShedSocket.on('binary', handler);
    }

    /// <summary>
    /// Close the socket.
    /// </summary>
    public close(): any {
        this.connected = false;

        return this.waterShedSocket.end();
    }

    /// <summary>
    /// Set the callback to call when encountering socket closures.
    /// </summary>
    public setOnCloseHandler(handler: (x: any) => void): void {
        this.waterShedSocket.on('end', handler);
    }

    /// <summary>
    /// Set the callback to call when encountering errors.
    /// </summary>
    public setOnErrorHandler(handler: (x: any) => void): void {
        this.waterShedSocket.on('error', (error): void => { if (error) { handler(error); } });
    }
}
