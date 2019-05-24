import { Stream } from '../../Stream';
import { IStreamManager } from '../IStreamManager';
import { Header } from '../Models/Header';
import { PayloadAssembler } from './PayloadAssembler';

export class ContentStreamAssembler extends PayloadAssembler {
  public contentLength: number;
  public contentType: string;
  private readonly _streamManager: IStreamManager;

  constructor(streamManager: IStreamManager, id: string, streamType?: string, length?: number) {
    super(id);
    this.contentType = streamType;
    this.contentLength = length;
    this._streamManager = streamManager;
  }

  public createPayloadStream(): Stream {
    return new Stream();
  }

  public onReceive(header: Header, stream: Stream, contentLength: number): void {
    super.onReceive(header, stream, contentLength);

    if (header.End) {
      stream.end(); // We don't have DoneProducing, what should happen here?
    }
  }

  public close(): void {
    this._streamManager.closeStream(this.id);
  }
}
