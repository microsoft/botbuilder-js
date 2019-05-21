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
import { Server, Socket } from 'net';
import { Transport } from './Transport';

export class NamedPipeServer implements IStreamingTransportServer {
  private _outgoingServer: Server;
  private _incomingServer: Server;
  private readonly _baseName: string;
  private readonly _requestHandler: RequestHandler;
  private readonly _sender: IPayloadSender;
  private readonly _receiver: IPayloadReceiver;
  private readonly _requestManager: RequestManager;
  private readonly _protocolAdapter: ProtocolAdapter;
  private readonly _autoReconnect: boolean;
  private _isDisconnecting: boolean;
  private _onClose: (arg0: string) => void;

  constructor(baseName: string, requestHandler?: RequestHandler, autoReconnect: boolean = true) {
    this._baseName = baseName;
    this._requestHandler = requestHandler;
    this._autoReconnect = autoReconnect;
    this._requestManager = new RequestManager();
    this._sender = new PayloadSender();
    this._receiver = new PayloadReceiver();
    this._protocolAdapter = new ProtocolAdapter(this._requestHandler, this._requestManager, this._sender, this._receiver);
    this._isDisconnecting = false;
    this._sender.disconnected = (x: object, y: any) => {
      this.onConnectionDisconnected(this, x, y);
    }
    this._receiver.disconnected = (x: object, y: any) => {
      this.onConnectionDisconnected(this, x, y);
    }
  }

  /* tslint:disable:promise-function-async promise-must-complete */
  public startAsync(): Promise<string> {
    let incomingConnect = false;
    let outgoingConnect = false;
    let result = new Promise<string>((resolve, reject) => {
      this._onClose = resolve;
    });

    let incomingPipeName: string = Transport.PipePath + this._baseName + Transport.ServerIncomingPath;
    this._incomingServer = new Server((socket: Socket) => {
      this._receiver.connect(new Transport(socket, 'serverReceiver'));
      incomingConnect = true;
      if (incomingConnect && outgoingConnect) {
        this._onClose('connected');
      }
    });
    this._incomingServer.listen(incomingPipeName);

    let outgoingPipeName: string = Transport.PipePath + this._baseName + Transport.ServerOutgoingPath;
    this._outgoingServer = new Server((socket: Socket) => {
      this._sender.connect(new Transport(socket, 'serverSender'));
      outgoingConnect = true;
      if (incomingConnect && outgoingConnect) {
        this._onClose('connected');
      }
    });
    this._outgoingServer.listen(outgoingPipeName);

    return result;
  }

  public disconnect(): void {
    this._sender.disconnect(undefined);
    this._receiver.disconnect(undefined);

    if (this._incomingServer) {
      this._incomingServer.close();
      this._incomingServer = undefined;
    }

    if (this._outgoingServer) {
      this._outgoingServer.close();
      this._outgoingServer = undefined;
    }
  }

  public async sendAsync(request: Request, cancellationToken: CancellationToken): Promise<ReceiveResponse> {
    return this._protocolAdapter.sendRequestAsync(request, cancellationToken);
  }

  private onConnectionDisconnected(s: NamedPipeServer, sender: object, args: any) {
    if (!s._isDisconnecting) {
      s._isDisconnecting = true;
      //s._onClose("close");
      try {
        if (s._sender.isConnected) {
          s._sender.disconnect(undefined);
        }

        if (s._receiver.isConnected) {
          s._receiver.disconnect(undefined);
        }

        if (s._autoReconnect) {
          /* tslint:disable:no-floating-promises */
          s.startAsync()
            .then(() => {
              // started
            });
        }
      }
      finally {
        s._isDisconnecting = false;
      }
    }
  }
}
