/**
 * @module botframework-streaming-extensions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Server, Socket } from 'net';
import {
  CancellationToken,
  IStreamingTransportServer,
  ProtocolAdapter,
  ReceiveResponse,
  StreamingRequest,
  RequestHandler
} from '..';
import { RequestManager } from '../Payloads';
import {
  IPayloadReceiver,
  IPayloadSender,
  PayloadReceiver,
  PayloadSender
} from '../PayloadTransport';
import { NamedPipeTransport } from './NamedPipeTransport';

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
    this._sender.disconnected = () => {
      this.onConnectionDisconnected();
    };
    this._receiver.disconnected = () => {
      this.onConnectionDisconnected();
    };
  }

  /* tslint:disable:promise-function-async promise-must-complete */
  public startAsync(): Promise<string> {
    let incomingConnect = false;
    let outgoingConnect = false;
    let result = new Promise<string>((resolve, reject) => {
      this._onClose = resolve;
    });

    if (this._receiver.isConnected || this._sender.isConnected || this._incomingServer || this._outgoingServer) {
      this.disconnect();
    }

    let incomingPipeName: string = NamedPipeTransport.PipePath + this._baseName + NamedPipeTransport.ServerIncomingPath;
    this._incomingServer = new Server((socket: Socket) => {
      this._receiver.connect(new NamedPipeTransport(socket, 'serverReceiver'));
      incomingConnect = true;
      if (incomingConnect && outgoingConnect) {
        this._onClose('connected');
      }
    });

    this._incomingServer.listen(incomingPipeName);
    let outgoingPipeName: string = NamedPipeTransport.PipePath + this._baseName + NamedPipeTransport.ServerOutgoingPath;
    this._outgoingServer = new Server((socket: Socket) => {
      this._sender.connect(new NamedPipeTransport(socket, 'serverSender'));
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

  public async sendAsync(request: StreamingRequest, cancellationToken: CancellationToken): Promise<ReceiveResponse> {
    return this._protocolAdapter.sendRequestAsync(request, cancellationToken);
  }

  public onConnectionDisconnected() {
    if (!this._isDisconnecting) {
      this._isDisconnecting = true;
      try {
        if (this._sender.isConnected) {
          this._sender.disconnect(undefined);
        }

        if (this._receiver.isConnected) {
          this._receiver.disconnect(undefined);
        }

        if (this._autoReconnect) {
          this.startAsync()
            .catch((err) => { throw(new Error(`Unable to reconnect: ${err.message}`)); });
        }
      }
      finally {
        this._isDisconnecting = false;
      }
    }
  }
}
