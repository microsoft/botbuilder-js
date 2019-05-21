import {
  CancellationToken,
  IPayloadReceiver,
  IPayloadSender,
  IStreamingTransportServer,
  PayloadReceiver,
  PayloadSender,
  ProtocolAdapter,
  ReceiveResponse,
  Request,
  RequestHandler,
  RequestManager
} from 'microsoft-bot-protocol';
import { Socket } from './Socket';
import { Transport } from './Transport';

export class Server implements IStreamingTransportServer {
  private readonly _url: string;
  private readonly _requestHandler: RequestHandler;
  private readonly _sender: IPayloadSender;
  private readonly _receiver: IPayloadReceiver;
  private readonly _requestManager: RequestManager;
  private readonly _protocolAdapter: ProtocolAdapter;
  private readonly _webSocketTransport: Transport;
  private _closedSignal;

  constructor(socket: Socket, requestHandler?: RequestHandler) {
    this._webSocketTransport = new Transport(socket);
    this._requestHandler = requestHandler;

    this._requestManager = new RequestManager();

    this._sender = new PayloadSender();
    this._sender.disconnected = (x: object, y: any) => this.onConnectionDisocnnected(this, x, y);
    this._receiver = new PayloadReceiver();
    this._receiver.disconnected = (x: object, y: any) => this.onConnectionDisocnnected(this, x, y);

    this._protocolAdapter = new ProtocolAdapter(this._requestHandler, this._requestManager, this._sender, this._receiver);
  }

  public async startAsync(): Promise<string> {
    this._sender.connect(this._webSocketTransport);
    this._receiver.connect(this._webSocketTransport);
    return new Promise(resolve =>
      this._closedSignal = resolve);
  }

  public async sendAsync(request: Request, cancellationToken: CancellationToken): Promise<ReceiveResponse> {
    return this._protocolAdapter.sendRequestAsync(request, cancellationToken);
  }

  public disconnect(): void {
    this._sender.disconnect(null);
    this._receiver.disconnect(null);
  }

  private onConnectionDisocnnected(s: Server, sender: object, args: any) {
    s._closedSignal("close");
  }
}
