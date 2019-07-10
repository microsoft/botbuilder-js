/**
 * @module botframework-streaming-extensions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { connect } from 'net';
import {
  CancellationToken,
  IStreamingTransportClient,
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
import { NamedPipeTransport as NamedPipeTransport } from './NamedPipeTransport';

export class NamedPipeClient implements IStreamingTransportClient {
  private readonly _baseName: string;
  private readonly _requestHandler: RequestHandler;
  private readonly _sender: IPayloadSender;
  private readonly _receiver: IPayloadReceiver;
  private readonly _requestManager: RequestManager;
  private readonly _protocolAdapter: ProtocolAdapter;
  private readonly _autoReconnect: boolean;
  private _isDisconnecting: boolean;

  /// <summary>
  /// Initializes a new instance of the <see cref="NamedPipeClient"/> class.
  /// </summary>
  /// <param name="baseName">The named pipe to connect to.</param>
  /// <param name="requestHandler">Optional <see cref="RequestHandler"/> to process incoming messages received by this client.</param>
  /// <param name="autoReconnect">Optional setting to determine if the client sould attempt to reconnect
  /// automatically on disconnection events. Defaults to true.
  /// </param>
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

  /// <summary>
  /// Establish a connection with no custom headers.
  /// </summary>
  public async connectAsync(): Promise<void> {
    let outgoingPipeName: string = NamedPipeTransport.PipePath + this._baseName + NamedPipeTransport.ServerIncomingPath;
    let outgoing = connect(outgoingPipeName);

    let incomingPipeName: string = NamedPipeTransport.PipePath + this._baseName + NamedPipeTransport.ServerOutgoingPath;
    let incoming = connect(incomingPipeName);

    this._sender.connect(new NamedPipeTransport(outgoing, 'clientSender'));
    this._receiver.connect(new NamedPipeTransport(incoming, 'clientReceiver'));
  }

  /// <summary>
  /// Method used to disconnect this client.
  /// </summary>
  public disconnect(): void {
    this._sender.disconnect(undefined);
    this._receiver.disconnect(undefined);
  }

  /// <summary>
  /// Task used to send data over this client connection.
  /// </summary>
  /// <param name="request">The <see cref="StreamingRequest"/> to send.</param>
  /// <param name="cancellationToken">An optional <see cref="CancellationToken"/> used to signal this operation should be cancelled.</param>
  /// <returns>A <see cref="Task"/> that will produce an instance of <see cref="ReceiveResponse"/> on completion of the send operation.</returns>
  public async sendAsync(request: StreamingRequest, cancellationToken: CancellationToken): Promise<ReceiveResponse> {
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
          c.connectAsync()
            .then(() => {
              return;
            })
            .catch((error) => { throw new Error(`Failed to reconnect. Reason: ${error.message} `); });
        }
      }
      finally {
        c._isDisconnecting = false;
      }
    }
  }
}
