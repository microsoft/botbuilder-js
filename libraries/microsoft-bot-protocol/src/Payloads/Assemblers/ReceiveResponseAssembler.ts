import { ContentStream } from '../../ContentStream';
import { ReceiveResponse } from '../../ReceiveResponse';
import { Stream } from '../../Stream';
import { IStreamManager } from '../IStreamManager';
import { Header } from '../Models/Header';
import { ResponsePayload } from '../Models/ResponsePayload';
import { ContentStreamAssembler } from './ContentStreamAssembler';
import { PayloadAssembler } from './PayloadAssembler';

export class ReceiveResponseAssembler extends PayloadAssembler {
  private readonly _onCompleted: Function;
  private readonly _streamManager: IStreamManager;

  constructor(header: Header, streamManager: IStreamManager, onCompleted: Function) {
    super(header.Id);
    this._streamManager = streamManager;
    this._onCompleted = onCompleted;
  }

  public createPayloadStream(): Stream {
    return new Stream();
  }

  public onReceive(header: Header, stream: Stream, contentLength: number) {
    super.onReceive(header, stream, contentLength);
    this.processResponse(stream)
      .then()
      .catch();
  }

  public responsePayloadfromJson(json: string): ResponsePayload {
    return <ResponsePayload>JSON.parse(json);
  }

  public close(): void {
    throw new Error('Method not implemented.');
  }

  private stripBOM(input: string): string {
    return (input.charCodeAt(0) === 0xFEFF) ? input.slice(1) : input;
  }

  private async processResponse(stream: Stream): Promise<void> {
    let ps: string = (<Buffer>stream.read(stream.length)).toString('utf8');
    let rp: ResponsePayload = this.responsePayloadfromJson(this.stripBOM(ps));
    let rr: ReceiveResponse = new ReceiveResponse();
    rr.StatusCode = rp.statusCode;

    if (rp.streams) {
      rp.streams.forEach(s => {
        let a: ContentStreamAssembler = this._streamManager.getPayloadAssembler(s.id);
        a.contentType = s.payloadType;
        a.contentLength = s.length;
        rr.Streams.push(new ContentStream(s.id, a));
      });
    }

    await this._onCompleted(this.id, rr);
  }
}
