/**
 * @module botframework-streaming-extensions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
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
import { BrowserWebSocket } from './BrowserWebSocket';
import { NodeWebSocket } from './NodeWebSocket';
import { WebSocketTransport } from './WebSocketTransport';

export class WebSocketClient implements IStreamingTransportClient {
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
      const ws = new BrowserWebSocket();
      await ws.connectAsync(this._url);
      const transport = new WebSocketTransport(ws);
      this._sender.connect(transport);
      this._receiver.connect(transport);
    } else {
      const ws = new NodeWebSocket();
      try {
        await ws.connectAsync(this._url);
        const transport = new WebSocketTransport(ws);
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

  public async sendAsync(request: StreamingRequest, cancellationToken: CancellationToken): Promise<ReceiveResponse> {
    return this._protocolAdapter.sendRequestAsync(request, cancellationToken);
  }

  private onConnectionDisconnected(sender: object, args: any) {
    if (this._autoReconnect) {
      this.connectAsync()
      .catch(() => { throw(new Error(`Unable to re-connect client to Node transport.`)); });
    }
  }

}
