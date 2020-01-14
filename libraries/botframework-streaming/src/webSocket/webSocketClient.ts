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
    TransportDisconnectedEvent
} from '../payloadTransport';
import { BrowserWebSocket } from './browserWebSocket';
import { NodeWebSocket } from './nodeWebSocket';
import { isBrowser } from '../utilities';
import { WebSocketTransport } from './webSocketTransport';
import { IStreamingTransportClient, IReceiveResponse } from '../interfaces';

/**
 * Web socket based client to be used as streaming transport.
 */
export class WebSocketClient implements IStreamingTransportClient {
    private readonly _url: string;
    private readonly _requestHandler: RequestHandler;
    private readonly _sender: PayloadSender;
    private readonly _receiver: PayloadReceiver;
    private readonly _requestManager: RequestManager;
    private readonly _protocolAdapter: ProtocolAdapter;
    private readonly _disconnectionHandler: (message: string) => void;

    /**
     * Creates a new instance of the [WebSocketClient](xref:botframework-streaming.WebSocketClient) class.
     *
     * @param url The URL of the remote server to connect to.
     * @param requestHandler Optional [RequestHandler](xref:botframework-streaming.RequestHandler) to process incoming messages received by this server.
     * @param disconnectionHandler Optional function to handle the disconnection message.
     */
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

    /**
     * Establish a connection with no custom headers.
     *
     * @returns A promise that will not resolve until the client stops listening for incoming messages.
     */
    public async connect(): Promise<void> {
        if (isBrowser()) {
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

    /**
     * Stop this client from listening.
     */
    public disconnect(): void {
        this._sender.disconnect(new TransportDisconnectedEvent('Disconnect was called.'));
        this._receiver.disconnect(new TransportDisconnectedEvent('Disconnect was called.'));
    }

    /**
     * Task used to send data over this client connection.
     *
     * @param request The streaming request to send.
     * @returns A promise that will produce an instance of receive response on completion of the send operation.
     */
    public async send(request: StreamingRequest): Promise<IReceiveResponse> {
        return this._protocolAdapter.sendRequest(request);
    }

    private onConnectionDisconnected(sender: object, args: any): void {
        if (this._disconnectionHandler != null) {
            this._disconnectionHandler('Disconnected');
            return;
        }

        throw(new Error(`Unable to re-connect client to Node transport for url ${ this._url }. Sender: '${ sender }'. Args:' ${ args }`));
    }
}
