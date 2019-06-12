import { ISocket } from './ISocket';

export class BrowserWebSocket implements ISocket {
  private webSocket: WebSocket;

  constructor(socket?: WebSocket) {
    if (socket) {
      this.webSocket = socket;
    }
  }

  public async connectAsync(serverAddress): Promise<void> {
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

    return new Promise((resolve, reject) => {
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
    this.webSocket.onmessage = (evt) => {
      let fileReader = new FileReader();
      fileReader.onload = (e) => {
        let t: FileReader = e.target as FileReader;
        handler(t.result);
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
