import * as WebSocket from 'ws';
import { Socket } from './Socket';

export class NodeSocket implements Socket {
  private url: string;
  private socket: any;
  constructor({ url = undefined, serverSocket = undefined }) {
    if (url) {
      this.url = url;
      this.socket = new WebSocket(this.url);
    }
    if (serverSocket) {
      this.socket = serverSocket;
    }
  }

  public isConnected(): boolean {
    return true;
  }

  public write(buffer: Buffer) {
    this.socket.send(buffer);
  }

  public async connectAsync(): Promise<void> {
    return Promise.resolve();
  }

  public setOnMessageHandler(handler: (x: any) => void) {
    this.socket.on('text', handler);
    this.socket.on('binary', handler);
  }

  public closeAsync() {
    return this.socket.end();
  }

  public setOnErrorHandler(handler: (x: any) => void) {
    // Got from error handling best practives from https://github.com/websockets/ws
    this.socket.on('error', (error) => { if (error) { handler(error); } });
  }

  public setOnCloseHandler(handler: (x: any) => void) {
    this.socket.on('end', handler);
  }
}
