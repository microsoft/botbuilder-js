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

  constructor(socket?: WebSocket) {
    if (socket) {
      this.webSocket = socket;
    }
  }

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

  public isConnected(): boolean {
    return this.webSocket.readyState === 1;
  }

  public write(buffer: Buffer) {
    this.webSocket.send(buffer);
  }

  public closeAsync() {
    this.webSocket.close();
  }

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

  public setOnErrorHandler(handler: (x: any) => void) {
    this.webSocket.onerror = (error) => { if (error) { handler(error); } };
  }

  public setOnCloseHandler(handler: (x: any) => void) {
    this.webSocket.onclose = handler;
  }
}
