import { ITransportReceiver, ITransportSender } from 'botframework-streaming-extensions-protocol';
import { Socket } from './Socket';

export class Transport implements ITransportSender, ITransportReceiver {
  private _socket: Socket;

  private readonly _queue: Buffer[];
  private _active: Buffer;
  private _activeOffset: number;
  private _activeReceiveResolve: (resolve: Buffer) => void;
  private _activeReceiveReject: (reason?: any) => void;
  private _activeReceiveCount: number;

  constructor(ws: Socket) {
    this._socket = ws;
    this._queue = [];
    this._activeOffset = 0;
    this._activeReceiveCount = 0;
    this._socket.setOnMessageHandler((data) => {
      this.onReceive(data);
    });
    this._socket.setOnErrorHandler((err) => {
      this.onError(err);
    });
    this._socket.setOnCloseHandler(() => {
      this.onClose();
    });
  }

  public send(buffer: Buffer): number {
    if (this._socket && this._socket.isConnected()) {
      this._socket.write(buffer);

      return buffer.length;
    }

    return 0;
  }

  public isConnected(): boolean {
    return this._socket.isConnected();
  }

  public close() {
    if (this._socket && this._socket.isConnected()) {
      this._socket.closeAsync();
    }
  }

  public async receiveAsync(count: number): Promise<Buffer> {
    if (this._activeReceiveResolve) {
      throw new Error('Cannot call receiveAsync more than once before it has returned.');
    }

    this._activeReceiveCount = count;

    let promise = new Promise<Buffer>((resolve, reject) => {
      this._activeReceiveResolve = resolve;
      this._activeReceiveReject = reject;
    });

    this.trySignalData();

    return promise;
  }

  public onReceive(data: Buffer) {
    if (this._queue && data && data.byteLength > 0) {
      this._queue.push(Buffer.from(data));
      this.trySignalData();
    }
  }

  public onClose() {
    if (this._activeReceiveReject) {
      this._activeReceiveReject(new Error('Socket was closed.'));
    }

    this._active = undefined;
    this._activeOffset = 0;
    this._activeReceiveResolve = undefined;
    this._activeReceiveReject = undefined;
    this._activeReceiveCount = 0;
    this._socket = undefined;
  }

  public onError(err: Error) {
    if (this._activeReceiveReject) {
      this._activeReceiveReject(err);
    }
    this.onClose();
  }

  private trySignalData(): void {
    if (this._activeReceiveResolve) {
      if (!this._active && this._queue.length > 0) {
        this._active = this._queue.shift();
        this._activeOffset = 0;
      }

      if (this._active) {
        if (this._activeOffset === 0 && this._active.length === this._activeReceiveCount) {
          // can send the entire _active buffer
          let buffer = this._active;
          this._active = undefined;

          this._activeReceiveResolve(buffer);
        } else {
          // create a Buffer.from and copy some of the contents into it
          let available = Math.min(this._activeReceiveCount, this._active.length - this._activeOffset);
          let buffer = Buffer.alloc(available);
          this._active.copy(buffer, 0, this._activeOffset, this._activeOffset + available);
          this._activeOffset += available;

          // if we used all of active, set it to undefined
          if (this._activeOffset >= this._active.length) {
            this._active = undefined;
            this._activeOffset = 0;
          }

          this._activeReceiveResolve(buffer);
        }

        this._activeReceiveCount = 0;
        this._activeReceiveReject = undefined;
        this._activeReceiveResolve = undefined;
      }
    }

    return;
  }
}
