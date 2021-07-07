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
import { PayloadReceiver, PayloadSender, TransportDisconnectedEvent } from '../payloadTransport';
import { NodeWebSocket } from './nodeWebSocket';
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
     * @param config For configuring a [WebSocketClient](xref:botframework-streaming.WebSocketClient) instance to communicate with a WebSocket server.
     * @param config.url The URL of the remote server to connect to.
     * @param config.requestHandler The [RequestHandler](xref:botframework-streaming.RequestHandler) used to process incoming messages received by this client.
     * @param config.disconnectionHandler Optional function to handle the disconnection message.
     */
    constructor({
        url,
        requestHandler,
        disconnectionHandler = null,
    }: {
        url: string;
        requestHandler: RequestHandler;
        disconnectionHandler: (message: string) => void;
    }) {
        this._url = url;
        this._requestHandler = requestHandler;
        this._disconnectionHandler = disconnectionHandler;

        this._requestManager = new RequestManager();

        this._sender = new PayloadSender();
        this._sender.disconnected = this.onConnectionDisconnected.bind(this);
        this._receiver = new PayloadReceiver();
        this._receiver.disconnected = this.onConnectionDisconnected.bind(this);

        this._protocolAdapter = new ProtocolAdapter(
            this._requestHandler,
            this._requestManager,
            this._sender,
            this._receiver
        );
    }

    /**
     * Establish a connection with no custom headers.
     *
     * @returns A promise that will not resolve until the client stops listening for incoming messages.
     */
    async connect(): Promise<void> {
        const ws = new NodeWebSocket();
        try {
            await ws.connect(this._url);
            const transport = new WebSocketTransport(ws);
            this._sender.connect(transport);
            this._receiver.connect(transport);
        } catch (_error) {
            throw new Error('Unable to connect client to Node transport.');
        }
    }

    /**
     * Stop this client from listening.
     */
    disconnect(): void {
        this._sender.disconnect(new TransportDisconnectedEvent('Disconnect was called.'));
        this._receiver.disconnect(new TransportDisconnectedEvent('Disconnect was called.'));
    }

    /**
     * Task used to send data over this client connection.
     *
     * @param request The [StreamingRequest](xref:botframework-streaming.StreamingRequest) instance to send.
     * @returns A promise that will produce an instance of receive response on completion of the send operation.
     */
    async send(request: StreamingRequest): Promise<IReceiveResponse> {
        return this._protocolAdapter.sendRequest(request);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private onConnectionDisconnected(sender: Record<string, unknown>, args: any): void {
        if (this._disconnectionHandler != null) {
            this._disconnectionHandler('Disconnected');
            return;
        }

        throw new Error(
            `Unable to re-connect client to Node transport for url ${this._url}. Sender: '${JSON.stringify(
                sender
            )}'. Args:' ${JSON.stringify(args)}`
        );
    }
}
