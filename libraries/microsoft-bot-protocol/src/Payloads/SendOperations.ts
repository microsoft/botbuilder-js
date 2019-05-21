import { IPayloadSender } from '../PayloadTransport/IPayloadSender';
import { Request } from '../Request';
import { Response } from '../Response';
import { CancelDisassembler } from './Disassemblers/CancelDisassembler';
import { HttpContentStreamDisassembler } from './Disassemblers/HttpContentStreamDisassembler';
import { RequestDisassembler } from './Disassemblers/RequestDisassembler';
import { ResponseDisassembler } from './Disassemblers/ResponseDisassembler';
import { PayloadTypes } from './Models/PayloadTypes';

export class SendOperations {
  private readonly payloadSender: IPayloadSender;

  constructor(payloadSender: IPayloadSender) {
    this.payloadSender = payloadSender;
  }

  public async sendRequestAsync(id: string, request: Request): Promise<void> {
    let disassembler = new RequestDisassembler(this.payloadSender, id, request);

    await disassembler.disassemble();

    if (request.Streams) {
      request.Streams.forEach(async (contentStream) => {
        await new HttpContentStreamDisassembler(this.payloadSender, contentStream).disassemble();
      });
    }
  }

  public async sendResponseAsync(id: string, response: Response): Promise<void> {
    let disassembler = new ResponseDisassembler(this.payloadSender, id, response);

    await disassembler.disassemble();

    if (response.streams) {
      response.streams.forEach(async (contentStream) => {
        await new HttpContentStreamDisassembler(this.payloadSender, contentStream).disassemble();
      });
    }
  }

  public async sendCancelStreamAsync(id: string): Promise<void> {
    let disassembler = new CancelDisassembler(this.payloadSender, id, PayloadTypes.cancelStream);
    disassembler.disassemble();
  }
}
