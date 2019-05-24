import { HttpContentStream } from '../../HttpContentStream';
import { IPayloadSender } from '../../PayloadTransport/IPayloadSender';
import { Stream } from '../../Stream';
import { PayloadTypes } from '../Models/PayloadTypes';
import { PayloadDisassembler } from './PayloadDisassembler';
import { StreamWrapper } from './StreamWrapper';

export class HttpContentStreamDisassembler extends PayloadDisassembler {
  public readonly contentStream: HttpContentStream;
  public payloadType: PayloadTypes = PayloadTypes.stream;

  constructor(sender: IPayloadSender, contentStream: HttpContentStream) {
    super(sender, contentStream.id);

    this.contentStream = contentStream;
  }

  public async getStream(): Promise<StreamWrapper> {
    let stream: Stream = this.contentStream.content.getStream();

    return new StreamWrapper(stream, stream.length);
  }
}
