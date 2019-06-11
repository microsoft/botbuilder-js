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
} from 'botframework-streaming-extensions-protocol';
import { BrowserSocket } from './BrowserSocket';
import { NodeSocket } from './NodeSocket';
import { Transport } from './Transport';

export class Client implements IStreamingTransportClient {
  private readonly _url: string;
  private readonly _requestHandler: RequestHandler;
  private readonly _sender: IPayloadSender;
  private readonly _receiver: IPayloadReceiver;
  private readonly _requestManager: RequestManager;
  private readonly _protocolAdapter: ProtocolAdapter;
  private readonly _autoReconnect: boolean;

  constructor({ url, requestHandler, autoReconnect = true }) {
    this._url = url;
    this._requestHandler = requestHandler;
    this._autoReconnect = autoReconnect;

    this._requestManager = new RequestManager();

    this._sender = new PayloadSender();
    this._sender.disconnected = this.onConnectionDisconnected;
    this._receiver = new PayloadReceiver();
    this._receiver.disconnected = this.onConnectionDisconnected;

    this._protocolAdapter = new ProtocolAdapter(this._requestHandler, this._requestManager, this._sender, this._receiver);
  }

  public async connectAsync(): Promise<void> {
    if (typeof WebSocket !== 'undefined') {
      const ws = new BrowserSocket();
      await ws.connectAsync(this._url);
      const transport = new Transport(ws);
      this._sender.connect(transport);
      this._receiver.connect(transport);
    } else {
      const ws = new NodeSocket();
      try {
        await ws.connectAsync(this._url);
        const transport = new Transport(ws);
        this._sender.connect(transport);
        this._receiver.connect(transport);
      } catch (error) {
        throw(new Error(`Unable to connect client to Node transport.`));
      }
    }
  }

  public disconnect(): void {
    this._sender.disconnect('');
    this._receiver.disconnect('');
  }

  public async sendAsync(request: Request, cancellationToken: CancellationToken): Promise<ReceiveResponse> {
    return this._protocolAdapter.sendRequestAsync(request, cancellationToken);
  }

  private onConnectionDisconnected(sender: object, args: any) {
    if (this._autoReconnect) {
      this.connectAsync()
      .catch(() => { throw(new Error(`Unable to re-connect client to Node transport.`)); });
    }
  }

}
