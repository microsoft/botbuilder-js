import { Duplex, DuplexOptions, Writable, WritableOptions } from 'stream';

export class Stream extends Duplex {
  public length: number = 0;

  private readonly bufferList: Buffer[] = [];
  private _onData: (chunk: any) => void;

  constructor(options?: DuplexOptions) {
    super(options);
  }

  public _write(chunk: any, encoding: string, callback: (error?: Error | null) => void): void {
    let buffer = Buffer.from(chunk);
    this.bufferList.push(buffer);
    this.length += chunk.length;
    if (this._onData) {
      this._onData(buffer);
    }
    callback();
  }

  public _read(size: number): void {
    if (this.bufferList.length === 0) {
      // null signals end of stream
      // tslint:disable-next-line:no-null-keyword
      this.push(null);
    } else {
      this.push(this.bufferList.shift());
    }
  }

  public subscribe(onData: (chunk: any) => void): void {
    this._onData = onData;
  }
}
