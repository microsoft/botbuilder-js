/**
 * @module botframework-streaming
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { ProtocolAdapter } from '../protocolAdapter';
import { RequestHandler } from '../requestHandler';
import { StreamingRequest } from '../streamingRequest';
import { RequestManager } from '../payloads';
import {
    PayloadReceiver,
    PayloadSender,
    TransportDisconnectedEventArgs
} from '../payloadTransport';
import { BrowserWebSocket } from './BrowserWebSocket';
import { NodeWebSocket } from './NodeWebSocket';
import { WebSocketTransport } from './WebSocketTransport';
import { IStreamingTransportClient, IReceiveResponse } from '../interfaces';

/// <summary>
/// A client for use with the Bot Framework Protocol V3 with Streaming Extensions and an underlying WebSocket transport.
/// </summary>
export class WebSocketClient implements IStreamingTransportClient {
    private readonly _url: string;
    private readonly _requestHandler: RequestHandler;
    private readonly _sender: PayloadSender;
    private readonly _receiver: PayloadReceiver;
    private readonly _requestManager: RequestManager;
    private readonly _protocolAdapter: ProtocolAdapter;
    private readonly _disconnectionHandler: (message: string) => void;

    /// <summary>
    /// Initializes a new instance of the <see cref="WebSocketClient"/> class.
    /// </summary>
    /// <param name="url">The URL of the remote server to connect to.</param>
    /// <param name="requestHandler">Optional <see cref="RequestHandler"/> to process incoming messages received by this server.</param>
    /// <param name="disconnectionHandler ">Optional function to handle the disconnection message</param>
    /// </param>
    public constructor({ url, requestHandler, disconnectionHandler = null}) {
        this._url = url;
        this._requestHandler = requestHandler;
        this._disconnectionHandler = disconnectionHandler;

        this._requestManager = new RequestManager();

        this._sender = new PayloadSender();
        this._sender.disconnected = this.onConnectionDisconnected.bind(this);
        this._receiver = new PayloadReceiver();
        this._receiver.disconnected = this.onConnectionDisconnected.bind(this);

        this._protocolAdapter = new ProtocolAdapter(this._requestHandler, this._requestManager, this._sender, this._receiver);
    }

    /// <summary>
    /// Establish a connection with no custom headers.
    /// </summary>
    /// <returns>A promise that will not resolve until the client stops listening for incoming messages.</returns>
    public async connect(): Promise<void> {
        if (typeof WebSocket !== 'undefined') {
            const ws = new BrowserWebSocket();
            await ws.connect(this._url);
            const transport = new WebSocketTransport(ws);
            this._sender.connect(transport);
            this._receiver.connect(transport);
        } else {
            const ws = new NodeWebSocket();
            try {
                await ws.connect(this._url);
                const transport = new WebSocketTransport(ws);
                this._sender.connect(transport);
                this._receiver.connect(transport);
            } catch (error) {
                throw(new Error(`Unable to connect client to Node transport.`));
            }
        }
    }

    /// <summary>
    /// Stop this client from listening.
    /// </summary>
    public disconnect(): void {
        this._sender.disconnect(new TransportDisconnectedEventArgs('Disconnect was called.'));
        this._receiver.disconnect(new TransportDisconnectedEventArgs('Disconnect was called.'));
    }

    /// <summary>
    /// Task used to send data over this client connection.
    /// </summary>
    /// <param name="request">The <see cref="StreamingRequest"/> to send.</param>
    /// <returns>A promise that will produce an instance of <see cref="ReceiveResponse"/> on completion of the send operation.</returns>
    public async send(request: StreamingRequest): Promise<IReceiveResponse> {
        return this._protocolAdapter.sendRequest(request);
    }

    private onConnectionDisconnected(sender: object, args: any): void {
        if (this._disconnectionHandler != null) {
            this._disconnectionHandler("Disconnected");
            return;
        }

        throw(new Error(`Unable to re-connect client to Node transport. Sender:` + sender + ' Args:' + args));
    }
}
