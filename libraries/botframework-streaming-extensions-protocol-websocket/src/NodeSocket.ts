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
    let shed = new WaterShed();
    let wskey = shed.generateKey();
    let options = {

    }
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
