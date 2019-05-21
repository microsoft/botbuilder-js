import { Stream } from '../Stream';
import { PayloadAssembler } from './Assemblers/PayloadAssembler';
import { ReceiveRequestAssembler } from './Assemblers/ReceiveRequestAssembler';
import { ReceiveResponseAssembler } from './Assemblers/ReceiveResponseAssembler';
import { IStreamManager } from './IStreamManager';
import { Header } from './Models/Header';
import { PayloadTypes } from './Models/PayloadTypes';

export class PayloadAssembleManager {
  private readonly onReceiveRequest;
  private readonly onReceiveResponse;
  private readonly streamManager: IStreamManager;
  private readonly activeAssemblers: { [id: string]: PayloadAssembler } = {};

  constructor(streamManager: IStreamManager, onReceiveResponse: Function, onReceiveRequest) {
    this.streamManager = streamManager;
    this.onReceiveRequest = onReceiveRequest;
    this.onReceiveResponse = onReceiveResponse;
  }

  public getPayloadStream(header: Header): Stream {
    if (header.PayloadType === PayloadTypes.stream) {
      return this.streamManager.getPayloadStream(header);
    } else {
      if (this.activeAssemblers[header.Id] === undefined) {
        let assembler = this.createPayloadAssembler(header);
        if (assembler !== undefined) {
          this.activeAssemblers[header.Id] = assembler;

          return assembler.getPayloadStream();
        }
      }
    }

    return undefined;
  }

  public onReceive(header: Header, contentStream: Stream, contentLength: number) {
    if (header.PayloadType === PayloadTypes.stream) {
      this.streamManager.onReceive(header, contentStream, contentLength);
    } else {
      if (this.activeAssemblers !== undefined && this.activeAssemblers[header.Id] !== undefined) {
        let assembler = this.activeAssemblers[header.Id];
        assembler.onReceive(header, contentStream, contentLength);
      }
      if (header.End) {
        // tslint:disable-next-line: no-dynamic-delete
        delete this.activeAssemblers[header.Id];
      }
    }
  }

  private createPayloadAssembler(header: Header): PayloadAssembler {
    switch (header.PayloadType) {
      case PayloadTypes.request:
        return new ReceiveRequestAssembler(header, this.streamManager, this.onReceiveRequest);
        break;

      case PayloadTypes.response:
        return new ReceiveResponseAssembler(header, this.streamManager, this.onReceiveResponse);
        break;

      default:
    }
  }
}
