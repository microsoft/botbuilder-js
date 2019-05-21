import { IPayloadSender } from '../../PayloadTransport/IPayloadSender';
import { Response } from '../../Response';
import { PayloadTypes } from '../Models/PayloadTypes';
import { ResponsePayload } from '../Models/ResponsePayload';
import { StreamDescription } from '../Models/StreamDescription';
import { PayloadDisassembler } from './PayloadDisassembler';
import { StreamWrapper } from './StreamWrapper';

export class ResponseDisassembler extends PayloadDisassembler {
  public readonly response: Response;
  public readonly payloadType: PayloadTypes = PayloadTypes.response;

  constructor(sender: IPayloadSender, id: string, response: Response) {
    super(sender, id);

    this.response = response;
  }

  public async getStream(): Promise<StreamWrapper> {
    let payload: ResponsePayload = new ResponsePayload(this.response.statusCode);

    if (this.response.streams) {
      payload.streams = [];

      // tslint:disable-next-line: prefer-for-of
      for (let i = 0; i < this.response.streams.length; i++) {
        let contentStream = this.response.streams[i];
        let description: StreamDescription = await PayloadDisassembler.getStreamDescription(contentStream);
        payload.streams.push(description);
      }
    }

    return PayloadDisassembler.serialize(payload);
  }
}
