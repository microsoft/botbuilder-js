import { ContentStream } from '../../ContentStream';
import { ReceiveRequest } from '../../ReceiveRequest';
import { Stream } from '../../Stream';
import { IStreamManager } from '../IStreamManager';
import { Header } from '../Models/Header';
import { RequestPayload } from '../Models/RequestPayload';
import { ContentStreamAssembler } from './ContentStreamAssembler';
import { PayloadAssembler } from './PayloadAssembler';

export class ReceiveRequestAssembler extends PayloadAssembler {
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
    this.processRequest(stream)
      .then()
      .catch();
  }


  public requestPayloadfromJson(json: string): RequestPayload {
    return <RequestPayload>JSON.parse((json.charCodeAt(0) === 0xFEFF) ? json.slice(1) : json);
  }

  public close(): void {
    throw new Error('Method not implemented.');
  }

  private async processRequest(stream: Stream): Promise<void> {
    let ps: string = (<Buffer>stream.read(stream.length)).toString('utf8');
    let rp: RequestPayload = this.requestPayloadfromJson(ps);
    let rr: ReceiveRequest = new ReceiveRequest();
    rr.Path = rp.path;
    rr.Verb = rp.verb;

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
