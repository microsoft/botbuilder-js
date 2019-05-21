import { IPayloadSender } from '../../PayloadTransport/IPayloadSender';
import { Header } from '../Models/Header';
import { PayloadTypes } from '../Models/PayloadTypes';

export class CancelDisassembler {
  private readonly sender: IPayloadSender;
  private readonly id: string;
  private readonly payloadType: PayloadTypes;

  constructor(sender: IPayloadSender, id: string, payloadType: PayloadTypes) {
    this.sender = sender;
    this.id = id;
    this.payloadType = payloadType;
  }

  public disassemble(): void {
    const header = new Header(this.payloadType, 0, this.id, true);

    this.sender.sendPayload(header, undefined, undefined);
  }
}
