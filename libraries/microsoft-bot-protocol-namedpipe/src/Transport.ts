import { ITransportReceiver, ITransportSender } from 'microsoft-bot-protocol';
import { Socket } from 'net';

export class Transport implements ITransportSender, ITransportReceiver {
  public static readonly PipePath: string = '\\\\.\\pipe\\';
  public static readonly ServerIncomingPath: string = '.incoming';
  public static readonly ServerOutgoingPath: string = '.outgoing';

  private _socket: Socket;
  private readonly _queue: Buffer[];
  private _active: Buffer;
  private _activeOffset: number;
  private _activeReceiveResolve: (resolve: Buffer) => void;
  private _activeReceiveReject: (reason?: any) => void;
  private _activeReceiveCount: number;
  private _name: string;

  constructor(socket: Socket, name: string) {
    this._socket = socket;
    this._queue = [];
    this._activeOffset = 0;
    this._activeReceiveCount = 0;
    this._name = name;
    if (socket) {
      this._socket.on('data', (data) => {
        this.socketReceive(data);
      });
      this._socket.on('close', (hadError) => {
        this.socketClose(hadError);
      });
      this._socket.on('error', (err) => {
        this.socketError(err);
      });
    }
  }

  public send(buffer: Buffer): number {
    if (this._socket && !this._socket.connecting && this._socket.writable) {
      this._socket.write(buffer);

      return buffer.length;
    }

    return 0;
  }

  public isConnected(): boolean {
    return this._socket && !this._socket.destroyed && !this._socket.connecting;
  }

  public close() {
    if (this._socket) {
      this._socket.end('end');
      this._socket = undefined;
    }
  }

  // Returns:
  //  0 if the socket is closed or no more data can be returned
  //  1...count bytes in the buffer
  /* tslint:disable:promise-function-async promise-must-complete */
  public receiveAsync(count: number): Promise<Buffer> {
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

  private trySignalData(): boolean {
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
          // create a new buffer and copy some of the contents into it
          let available = Math.min(this._activeReceiveCount, this._active.length - this._activeOffset);
          let buffer = new Buffer(available);
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

        return true;
      }
    }

    return false;
  }

  private socketReceive(data: Buffer) {
    if (this._queue && data && data.length > 0) {
      this._queue.push(data);
      this.trySignalData();
    }
  }

  private socketClose(hadError?: boolean) {
    if (this._activeReceiveReject) {
      this._activeReceiveReject(new Error('Socket was closed.'));
    }

    this._active = undefined;
    this._activeOffset = 0;
    this._activeReceiveResolve = undefined;
    this._activeReceiveResolve = undefined;
    this._activeReceiveCount = 0;
    this._socket = undefined;
  }

  private socketError(err: Error) {
    if (this._activeReceiveReject) {
      this._activeReceiveReject(err);
    }

    this._active = undefined;
    this._activeOffset = 0;
    this._activeReceiveResolve = undefined;
    this._activeReceiveResolve = undefined;
    this._activeReceiveCount = 0;
    this._socket = undefined;
  }
}
