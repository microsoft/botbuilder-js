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
import { connect } from 'net';
import { Transport } from './Transport';

export class NamedPipeClient implements IStreamingTransportClient {
  private readonly _baseName: string;
  private readonly _requestHandler: RequestHandler;
  private readonly _sender: IPayloadSender;
  private readonly _receiver: IPayloadReceiver;
  private readonly _requestManager: RequestManager;
  private readonly _protocolAdapter: ProtocolAdapter;
  private readonly _autoReconnect: boolean;
  private _isDisconnecting: boolean;

  constructor(baseName: string, requestHandler?: RequestHandler, autoReconnect: boolean = true) {
    this._baseName = baseName;
    this._requestHandler = requestHandler;
    this._autoReconnect = autoReconnect;

    this._requestManager = new RequestManager();

    this._sender = new PayloadSender();
    this._sender.disconnected = (x: object, y: any) => this.onConnectionDisconnected(this, x, y);
    this._receiver = new PayloadReceiver();
    this._receiver.disconnected = (x: object, y: any) => this.onConnectionDisconnected(this, x, y);

    this._protocolAdapter = new ProtocolAdapter(this._requestHandler, this._requestManager, this._sender, this._receiver);

    this._isDisconnecting = false;
  }

  public async connectAsync(): Promise<void> {
    let outgoingPipeName: string = Transport.PipePath + this._baseName + Transport.ServerIncomingPath;
    let outgoing = connect(outgoingPipeName);

    let incomingPipeName: string = Transport.PipePath + this._baseName + Transport.ServerOutgoingPath;
    let incoming = connect(incomingPipeName);

    this._sender.connect(new Transport(outgoing, 'clientSender'));
    this._receiver.connect(new Transport(incoming, 'clientReceiver'));
  }

  public disconnect(): void {
    this._sender.disconnect(undefined);
    this._receiver.disconnect(undefined);
  }

  public async sendAsync(request: Request, cancellationToken: CancellationToken): Promise<ReceiveResponse> {
    return this._protocolAdapter.sendRequestAsync(request, cancellationToken);
  }

  private onConnectionDisconnected(c: NamedPipeClient, sender: object, args: any) {
    if (!c._isDisconnecting) {
      c._isDisconnecting = true;
      try {
        if (c._sender.isConnected) {
          c._sender.disconnect(undefined);
        }

        if (c._receiver.isConnected) {
          c._receiver.disconnect(undefined);
        }

        if (c._autoReconnect) {
          /* tslint:disable:no-floating-promises */
          c.connectAsync()
            .then(() => {
              // connected
            });
        }
      }
      finally {
        c._isDisconnecting = false;
      }
    }
  }
}
