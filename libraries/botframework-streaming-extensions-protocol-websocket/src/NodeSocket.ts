import * as http from 'http';
import { WaterShed } from 'watershed';
import { Socket } from './Socket';

export class NodeSocket implements Socket {
  private readonly socket: any;
  constructor(waterShedSocket?) {
    this.socket = waterShedSocket;
  }

  public isConnected(): boolean {
    return true;
  }

  public write(buffer: Buffer) {
    this.socket.send(buffer);
  }

  public async connectAsync(serverAddress): Promise<void> {
    // following template from https://github.com/joyent/node-watershed#readme
    let shed = new WaterShed();
    let wskey = shed.generateKey();
    let options = {
      port: 8082,
      hostname: serverAddress,
      headers: {
      'connection': 'upgrade',
      'Sec-WebSocket-Key': wskey,
      'Sec-WebSocket-Version': '13'
      }
    };
    let req = http.request(options);
    req.end();
    req.on('upgrade', function(res, socket, head) {
      let wsc = shed.connect(res, socket, head, wskey);
    });

    return new Promise((resolve, reject) => {
      req.on('close', resolve);
      req.on('error', reject);
    });

  }

  public setOnMessageHandler(handler: (x: any) => void) {
    this.socket.on('text', handler);
    this.socket.on('binary', handler);
  }

  public closeAsync() {
    return this.socket.end();
  }

  public setOnErrorHandler(handler: (x: any) => void) {
    this.socket.on('error', (error) => { if (error) { handler(error); } });
  }

  public setOnCloseHandler(handler: (x: any) => void) {
    this.socket.on('end', handler);
  }
}
