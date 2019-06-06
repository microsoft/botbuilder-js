import { Socket } from './Socket';

export class BrowserSocket implements Socket {
  private url: string;
  private socket: WebSocket;

  constructor(url: string, socket?: WebSocket) {
    this.url = url;

    if (socket) {
      this.socket = socket;
    }
  }

  public async connectAsync(): Promise<void> {
    let resolver;
    let rejector;

    if (!this.socket) {
      this.socket = new WebSocket(this.url);
    }

    this.socket.onerror = (e) => {
      rejector(e);
    };

    this.socket.onopen = (e) => {
      resolver(e);
    };

    return new Promise((resolve, reject) => {
      resolver = resolve;
      rejector = reject;
    });

  }

  public isConnected(): boolean {
    return this.socket.readyState === WebSocket.OPEN;
  }

  public write(buffer: Buffer) {
    this.socket.send(buffer);
  }

  public closeAsync() {
    return this.socket.close();
  }

  public setOnMessageHandler(handler: (x: any) => void) {
    this.socket.onmessage = (evt) => {
      let fileReader = new FileReader();
      fileReader.onload = (e) => {
        let t: FileReader = e.target as FileReader;
        handler(t.result);
      };
      fileReader.readAsArrayBuffer(evt.data);
    };
  }

  public setOnErrorHandler(handler: (x: any) => void) {
    this.socket.onerror = (error) => { if (error) { handler(error); } };
  }

  public setOnCloseHandler(handler: (x: any) => void) {
    this.socket.onclose = handler;
  }
}
