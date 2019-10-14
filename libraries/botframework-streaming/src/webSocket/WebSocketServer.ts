/**
 * @module botframework-streaming
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { ProtocolAdapter } from '../ProtocolAdapter';
import { RequestHandler } from '../RequestHandler';
import { StreamingRequest } from '../StreamingRequest';
import { RequestManager } from '../Payloads';
import {
    PayloadReceiver,
    PayloadSender,
    TransportDisconnectedEventArgs
} from '../PayloadTransport';
import { ISocket } from '../Interfaces/ISocket';
import { WebSocketTransport } from './WebSocketTransport';
import { IStreamingTransportServer, IReceiveResponse } from '../Interfaces';

/// <summary>
/// A server for use with the Bot Framework Protocol V3 with Streaming Extensions and an underlying WebSocket transport.
/// </summary>
export class WebSocketServer implements IStreamingTransportServer {
    private readonly _url: string;
    private readonly _requestHandler: RequestHandler;
    private readonly _sender: PayloadSender;
    private readonly _receiver: PayloadReceiver;
    private readonly _requestManager: RequestManager;
    private readonly _protocolAdapter: ProtocolAdapter;
    private readonly _webSocketTransport: WebSocketTransport;
    private _closedSignal;

    /// <summary>
    /// Initializes a new instance of the <see cref="WebSocketServer"/> class.
    /// </summary>
    /// <param name="socket">The <see cref="ISocket"/> of the underlying connection for this server to be built on top of.</param>
    /// <param name="requestHandler">A <see cref="RequestHandler"/> to process incoming messages received by this server.</param>
    public constructor(socket: ISocket, requestHandler?: RequestHandler) {
        this._webSocketTransport = new WebSocketTransport(socket);
        this._requestHandler = requestHandler;

        this._requestManager = new RequestManager();

        this._sender = new PayloadSender();
        this._sender.disconnected = this.onConnectionDisconnected.bind(this);
        this._receiver = new PayloadReceiver();
        this._receiver.disconnected = this.onConnectionDisconnected.bind(this);

        this._protocolAdapter = new ProtocolAdapter(this._requestHandler, this._requestManager, this._sender, this._receiver);

        this._closedSignal = (x: string): string => { return x; };
    }

    /// <summary>
    /// Used to establish the connection used by this server and begin listening for incoming messages.
    /// </summary>
    /// <returns>A promise to handle the server listen operation. This task will not resolve as long as the server is running.</returns>
    public async start(): Promise<string> {
        this._sender.connect(this._webSocketTransport);
        this._receiver.connect(this._webSocketTransport);

        return this._closedSignal;
    }

    /// <summary>
    /// Used to send data over this server connection.
    /// </summary>
    /// <param name="request">The <see cref="StreamingRequest"/> to send.</param>
    /// <returns>A promise of type <see cref="ReceiveResponse"/> handling the send operation.</returns>
    public async send(request: StreamingRequest): Promise<IReceiveResponse> {
        return this._protocolAdapter.sendRequest(request);
    }

    /// <summary>
    /// Stop this server.
    /// </summary>
    public disconnect(): void {
        this._sender.disconnect(new TransportDisconnectedEventArgs('Disconnect was called.'));
        this._receiver.disconnect(new TransportDisconnectedEventArgs('Disconnect was called.'));
    }

    private onConnectionDisconnected(s: WebSocketServer, sender: object, args: any): void {
        s._closedSignal('close');
    }
}
