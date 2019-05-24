import { CancellationToken } from './CancellationToken';
import { PayloadAssembler } from './Payloads/Assemblers/PayloadAssembler';
import { IRequestManager } from './Payloads/IRequestManager';
import { IStreamManager } from './Payloads/IStreamManager';
import { Header } from './Payloads/Models/Header';
import { PayloadAssembleManager } from './Payloads/PayloadAssemblerManager';
import { SendOperations } from './Payloads/SendOperations';
import { StreamManager } from './Payloads/StreamManager';
import { IPayloadReceiver } from './PayloadTransport/IPayloadReceiver';
import { IPayloadSender } from './PayloadTransport/IPayloadSender';
import { ReceiveRequest } from './ReceiveRequest';
import { ReceiveResponse } from './ReceiveResponse';
import { Request } from './Request';
import { RequestHandler } from './RequestHandler';
import { Stream } from './Stream';
import { generateGuid } from './Utilities/protocol-base';

export class ProtocolAdapter {
  private readonly requestHandler: RequestHandler;
  private readonly payloadSender: IPayloadSender;
  private readonly payloadReceiver: IPayloadReceiver;
  private readonly requestManager: IRequestManager;
  private readonly sendOperations: SendOperations;
  private readonly streamManager: IStreamManager;
  private readonly assemblerManager: PayloadAssembleManager;

  constructor(requestHandler: RequestHandler, requestManager: IRequestManager, sender: IPayloadSender, receiver: IPayloadReceiver) {
    this.requestHandler = requestHandler;
    this.requestManager = requestManager;
    this.payloadSender = sender;
    this.payloadReceiver = receiver;

    this.sendOperations = new SendOperations(this.payloadSender);
    this.streamManager = new StreamManager(this.onCancelStream);
    this.assemblerManager = new PayloadAssembleManager(
      this.streamManager,
      (id: string, response: ReceiveResponse) => this.onReceiveResponse(id, response),
      (id: string, request: ReceiveRequest) => this.onReceiveRequest(id, request));

    this.payloadReceiver.subscribe(
      (header: Header) => this.assemblerManager.getPayloadStream(header),
      // tslint:disable-next-line: no-void-expression
      (header: Header, contentStream: Stream, contentLength: number) => this.assemblerManager.onReceive(header, contentStream, contentLength));
  }

  public async sendRequestAsync(request: Request, cancellationToken?: CancellationToken): Promise<ReceiveResponse> {
    let requestId: string = generateGuid();

    await this.sendOperations.sendRequestAsync(requestId, request);

    if (cancellationToken) {
      cancellationToken.throwIfCancelled();
    }

    let response: ReceiveResponse = await this.requestManager.getResponseAsync(requestId, cancellationToken);

    if (cancellationToken) {
      cancellationToken.throwIfCancelled();
    }

    return response;
  }

  public async onReceiveRequest(id: string, request: ReceiveRequest): Promise<void> {
    if (this.requestHandler !== undefined) {
      let response = await this.requestHandler.processRequestAsync(request);

      if (response !== undefined) {
        await this.sendOperations.sendResponseAsync(id, response);
      }
    }
  }

  private async onReceiveResponse(id: string, response: ReceiveResponse): Promise<void> {
    await this.requestManager.signalResponse(id, response);
  }

  private onCancelStream(contentStreamAssembler: PayloadAssembler): void {
    this.sendOperations.sendCancelStreamAsync(contentStreamAssembler.id)
      .catch();
  }
}
