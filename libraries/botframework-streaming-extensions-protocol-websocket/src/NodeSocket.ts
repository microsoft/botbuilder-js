import * as http from 'http';
import * as WaterShed from 'watershed';
import { Socket } from './Socket';

export class NodeSocket implements Socket {
  private readonly socket: any;
  private connected: boolean;
  constructor(waterShedSocket?) {
    this.socket = waterShedSocket;
    this.connected = false;
  }

  public isConnected(): boolean {
    return this.connected;
  }

  public write(buffer: Buffer) {
    this.socket.send(buffer);
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
    this.connected = false;

    return this.socket.end();
  }

  public setOnErrorHandler(handler: (x: any) => void) {
    this.socket.on('error', (error) => { if (error) { handler(error); } });
  }

  public setOnCloseHandler(handler: (x: any) => void) {
    this.socket.on('end', handler);
  }
}
