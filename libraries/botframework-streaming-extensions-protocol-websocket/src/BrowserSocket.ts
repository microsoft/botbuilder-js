import { Socket } from "./Socket";

export class BrowserSocket implements Socket {
  private url: string;
  private socket: WebSocket;

  constructor(url: string) {
    this.url = url;
  }

  public connectAsync(): Promise<void> {
    let resolver;
    let rejector;

    this.socket = new WebSocket(this.url);
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

  write(buffer: Buffer) {
    this.socket.send(buffer);
  }

  closeAsync() {
    return this.socket.close();
  }

  setOnMessageHandler(handler: (x: any) => void) {
    this.socket.onmessage = (evt) => {
      var fileReader = new FileReader();
      fileReader.onload = (e) => {
        let t: FileReader = e.target as FileReader;
        console.log(t.result);
        handler(t.result);
      };
      fileReader.readAsArrayBuffer(evt.data);
    };
  }

  setOnErrorHandler(handler: (x: any) => void) {
    this.socket.onerror = (error) => { if (error) handler(error); };
  }
  setOnCloseHandler(handler: (x: any) => void) {
    this.socket.onclose = (data) => handler(data);
  }
}
