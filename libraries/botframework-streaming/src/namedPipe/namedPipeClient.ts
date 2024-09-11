/**
 * @module botframework-streaming
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { connect } from 'net';
import { ProtocolAdapter } from '../protocolAdapter';
import { RequestHandler } from '../requestHandler';
import { StreamingRequest } from '../streamingRequest';
import { RequestManager } from '../payloads';
import { PayloadReceiver, PayloadSender } from '../payloadTransport';
import { NamedPipeTransport } from './namedPipeTransport';
import { IStreamingTransportClient, IReceiveResponse } from '../interfaces';

/**
 * Streaming transport client implementation that uses named pipes for inter-process communication.
 */
export class NamedPipeClient implements IStreamingTransportClient {
    private readonly _baseName: string;
    private readonly _requestHandler: RequestHandler;
    private readonly _sender: PayloadSender;
    private readonly _receiver: PayloadReceiver;
    private readonly _requestManager: RequestManager;
    private readonly _protocolAdapter: ProtocolAdapter;
    private readonly _autoReconnect: boolean;
    private _isDisconnecting: boolean;

    /**
     * Creates a new instance of the [NamedPipeClient](xref:botframework-streaming.NamedPipeClient) class.
     *
     * @param baseName The named pipe to connect to.
     * @param requestHandler Optional [RequestHandler](xref:botframework-streaming.RequestHandler) to process incoming messages received by this client.
     * @param autoReconnect Optional setting to determine if the client sould attempt to reconnect automatically on disconnection events. Defaults to true.
     */
    constructor(baseName: string, requestHandler?: RequestHandler, autoReconnect = true) {
        this._baseName = baseName;
        this._requestHandler = requestHandler;
        this._autoReconnect = autoReconnect;
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
     */
    async connect(): Promise<void> {
        const outgoingPipeName: string =
            NamedPipeTransport.PipePath + this._baseName + NamedPipeTransport.ServerIncomingPath;
        const outgoing = connect(outgoingPipeName);
        const incomingPipeName: string =
            NamedPipeTransport.PipePath + this._baseName + NamedPipeTransport.ServerOutgoingPath;
        const incoming = connect(incomingPipeName);
        // TODO: Fix INodeSocket type. Related issue https://github.com/microsoft/botbuilder-js/issues/4684.
        this._sender.connect(new NamedPipeTransport(outgoing as any));
        this._receiver.connect(new NamedPipeTransport(incoming as any));
    }

    /**
     * Disconnect the client.
     */
    disconnect(): void {
        this._sender.disconnect();
        this._receiver.disconnect();
    }

    /**
     * Task used to send data over this client connection.
     *
     * @param request The [StreamingRequest](xref:botframework-streaming.StreamingRequest) to send.
     * @returns A promise for an instance of [IReceiveResponse](xref:botframework-streaming.IReceiveResponse) on completion of the send operation.
     */
    async send(request: StreamingRequest): Promise<IReceiveResponse> {
        return this._protocolAdapter.sendRequest(request);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private onConnectionDisconnected(sender: Record<string, unknown>, args: any): void {
        if (!this._isDisconnecting) {
            this._isDisconnecting = true;
            try {
                if (this._sender.isConnected) {
                    this._sender.disconnect();
                }

                if (this._receiver.isConnected) {
                    this._receiver.disconnect();
                }

                if (this._autoReconnect) {
                    this.connect()
                        .then((): void => {})
                        .catch((error): void => {
                            throw new Error(
                                `Failed to reconnect. Reason: ${error.message} Sender: ${sender} Args: ${args}. `
                            );
                        });
                }
            } finally {
                this._isDisconnecting = false;
            }
        }
    }
}
