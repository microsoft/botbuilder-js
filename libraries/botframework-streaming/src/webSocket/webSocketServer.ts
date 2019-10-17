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
import { ISocket } from '../interfaces/ISocket';
import { WebSocketTransport } from './WebSocketTransport';
import { IStreamingTransportServer, IReceiveResponse } from '../interfaces';

/**
 * Web socket based server to be used as streaming transport.
 */
export class WebSocketServer implements IStreamingTransportServer {
    private readonly _url: string;
    private readonly _requestHandler: RequestHandler;
    private readonly _sender: PayloadSender;
    private readonly _receiver: PayloadReceiver;
    private readonly _requestManager: RequestManager;
    private readonly _protocolAdapter: ProtocolAdapter;
    private readonly _webSocketTransport: WebSocketTransport;
    private _closedSignal;

    /**
     * Creates a new instance of the [WebSocketServer](xref:botframework-streaming.WebSocketServer) class.
     *
     * @param socket The underlying web socket.
     * @param requestHandler Optional [RequestHandler](xref:botframework-streaming.RequestHandler) to process incoming messages received by this server.
     */
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

    /**
     * Used to establish the connection used by this server and begin listening for incoming messages.
     *
     * @returns A promise to handle the server listen operation. This task will not resolve as long as the server is running.
     */
    public async start(): Promise<string> {
        this._sender.connect(this._webSocketTransport);
        this._receiver.connect(this._webSocketTransport);

        return this._closedSignal;
    }

    /**
     * Task used to send data over this server connection.
     *
     * @param request The streaming request to send.
     * @returns A promise that will produce an instance of receive response on completion of the send operation.
     */
    public async send(request: StreamingRequest): Promise<IReceiveResponse> {
        return this._protocolAdapter.sendRequest(request);
    }

    /**
     * Stop this server.
     */
    public disconnect(): void {
        this._sender.disconnect(new TransportDisconnectedEventArgs('Disconnect was called.'));
        this._receiver.disconnect(new TransportDisconnectedEventArgs('Disconnect was called.'));
    }

    private onConnectionDisconnected(sender: PayloadReceiver | PayloadSender, e?: TransportDisconnectedEventArgs): void {
        if (this._closedSignal) {
            this._closedSignal('close');
            this._closedSignal = null;
        }

        if (sender === this._sender) {
            this._receiver.disconnect(e);
        }

        if (sender === this._receiver) {
            this._sender.disconnect(e);
        }
    }
}
