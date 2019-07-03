/**
 * @module botframework-streaming-extensions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import * as http from 'http';
import * as WaterShed from 'watershed';
import { ISocket } from './ISocket';

export class NodeWebSocket implements ISocket {
  private readonly waterShedSocket: any;
  private connected: boolean;
  constructor(waterShedSocket?) {
    this.waterShedSocket = waterShedSocket;
    this.connected = false;
  }

  public isConnected(): boolean {
    return this.connected;
  }

  public write(buffer: Buffer) {
    this.waterShedSocket.send(buffer);
  }

  public async connectAsync(serverAddress, port = 8082): Promise<void> {
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
    req.on('upgrade', function(res, socket, head) {
      let wsc = shed.connect(res, socket, head, wskey);
    });

    this.connected = true;

    return new Promise<void>((resolve, reject) => {
      req.on('close', resolve);
      req.on('error', reject);
    });
  }

  public setOnMessageHandler(handler: (x: any) => void) {
    this.waterShedSocket.on('text', handler);
    this.waterShedSocket.on('binary', handler);
  }

  public closeAsync() {
    this.connected = false;

    return this.waterShedSocket.end();
  }

  public setOnCloseHandler(handler: (x: any) => void): void {
    this.waterShedSocket.on('end', handler);
  }

  public setOnErrorHandler(handler: (x: any) => void): void {
    this.waterShedSocket.on('error', (error) => { if (error) { handler(error); } });
  }
}
