import {
  CancellationToken,
  IPayloadReceiver,
  IPayloadSender,
  IStreamingTransportClient,
  PayloadReceiver,
  PayloadSender,
  ProtocolAdapter,
  ReceiveResponse,
  Request,
  RequestHandler,
  RequestManager
} from 'microsoft-bot-protocol';
import { Transport } from './Transport';
import { BrowserSocket } from './BrowserSocket';
import { NodeSocket } from './NodeSocket';

export class Client implements IStreamingTransportClient {
  private readonly _url: string;
  private readonly _requestHandler: RequestHandler;
  private readonly _sender: IPayloadSender;
  private readonly _receiver: IPayloadReceiver;
  private readonly _requestManager: RequestManager;
  private readonly _protocolAdapter: ProtocolAdapter;
  private readonly _autoReconnect: boolean;

  constructor({ url = undefined, requestHandler = undefined, autoReconnect = true }) {
    this._url = url;
    this._requestHandler = requestHandler;
    this._autoReconnect = autoReconnect;

    this._requestManager = new RequestManager();

    this._sender = new PayloadSender();
    this._sender.disconnected = this.onConnectionDisocnnected;
    this._receiver = new PayloadReceiver();
    this._receiver.disconnected = this.onConnectionDisocnnected;

    this._protocolAdapter = new ProtocolAdapter(this._requestHandler, this._requestManager, this._sender, this._receiver);
  }

  public async connectAsync(): Promise<void> {
    if (typeof WebSocket !== 'undefined') {
      const ws = new BrowserSocket(this._url);
      await ws.connectAsync();
      const transport = new Transport(ws);
      this._sender.connect(transport);
      this._receiver.connect(transport);
    } else {
      const ws = new NodeSocket({ url: this._url });
      await ws.connectAsync();
      const transport = new Transport(ws);
      this._sender.connect(transport);
      this._receiver.connect(transport);
    }
  }

  public disconnect(): void {
    this._sender.disconnect('');
    this._receiver.disconnect('');
  }

  public async sendAsync(request: Request, cancellationToken: CancellationToken): Promise<ReceiveResponse> {
    return this._protocolAdapter.sendRequestAsync(request, cancellationToken);
  }

  private onConnectionDisocnnected(sender: object, args: any) {
  }
}
