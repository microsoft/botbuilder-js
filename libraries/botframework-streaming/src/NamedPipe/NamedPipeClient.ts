/**
 * @module botframework-streaming
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { connect } from 'net';
import { ProtocolAdapter } from '../ProtocolAdapter';
import { RequestHandler } from '../RequestHandler';
import { StreamingRequest } from '../StreamingRequest';
import { RequestManager } from '../Payloads';
import {
    PayloadReceiver,
    PayloadSender
} from '../PayloadTransport';
import { NamedPipeTransport } from './NamedPipeTransport';
import { IStreamingTransportClient, IReceiveResponse } from '../Interfaces';

export class NamedPipeClient implements IStreamingTransportClient {
    private readonly _baseName: string;
    private readonly _requestHandler: RequestHandler;
    private readonly _sender: PayloadSender;
    private readonly _receiver: PayloadReceiver;
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
    public constructor(baseName: string, requestHandler?: RequestHandler, autoReconnect: boolean = true) {
        this._baseName = baseName;
        this._requestHandler = requestHandler;
        this._autoReconnect = autoReconnect;
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
    public async connect(): Promise<void> {
        let outgoingPipeName: string = NamedPipeTransport.PipePath + this._baseName + NamedPipeTransport.ServerIncomingPath;
        let outgoing = connect(outgoingPipeName);
        let incomingPipeName: string = NamedPipeTransport.PipePath + this._baseName + NamedPipeTransport.ServerOutgoingPath;
        let incoming = connect(incomingPipeName);
        this._sender.connect(new NamedPipeTransport(outgoing));
        this._receiver.connect(new NamedPipeTransport(incoming));
    }

    /// <summary>
    /// Method used to disconnect this client.
    /// </summary>
    public disconnect(): void {
        this._sender.disconnect();
        this._receiver.disconnect();
    }

    /// <summary>
    /// Task used to send data over this client connection.
    /// </summary>
    /// <param name="request">The <see cref="StreamingRequest"/> to send.</param>
    /// <returns>A <see cref="Task"/> that will produce an instance of <see cref="ReceiveResponse"/> on completion of the send operation.</returns>
    public async send(request: StreamingRequest): Promise<IReceiveResponse> {
        return this._protocolAdapter.sendRequest(request);
    }

    private onConnectionDisconnected(sender: object, args: any): void {
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
                        .then((): void => { })
                        .catch((error): void => { throw new Error(`Failed to reconnect. Reason: ${ error.message } Sender: ${ sender } Args: ${ args }. `); });
                }
            }
            finally {
                this._isDisconnecting = false;
            }
        }
    }
}
