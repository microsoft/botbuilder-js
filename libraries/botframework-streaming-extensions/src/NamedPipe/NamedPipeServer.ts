/**
 * @module botframework-streaming-extensions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Server, Socket } from 'net';
import { ProtocolAdapter } from '../ProtocolAdapter';
import { RequestHandler } from '../RequestHandler';
import { StreamingRequest } from '../StreamingRequest';
import { RequestManager } from '../Payloads';
import {
    PayloadReceiver,
    PayloadSender
} from '../PayloadTransport';
import { NamedPipeTransport } from './NamedPipeTransport';
import { IStreamingTransportServer, IReceiveResponse } from '../Interfaces';

/// <summary>
/// A server for use with the Bot Framework Protocol V3 with Streaming Extensions and an underlying Named Pipe transport.
/// </summary>
export class NamedPipeServer implements IStreamingTransportServer {
    private _outgoingServer: Server;
    private _incomingServer: Server;
    private readonly _baseName: string;
    private readonly _requestHandler: RequestHandler;
    private readonly _sender: PayloadSender;
    private readonly _receiver: PayloadReceiver;
    private readonly _requestManager: RequestManager;
    private readonly _protocolAdapter: ProtocolAdapter;
    private readonly _autoReconnect: boolean;
    private _isDisconnecting: boolean;

    /// <summary>
    /// Initializes a new instance of the <see cref="NamedPipeServer"/> class.
    /// </summary>
    /// <param name="baseName">The named pipe to connect to.</param>
    /// <param name="requestHandler">A <see cref="RequestHandler"/> to process incoming messages received by this server.</param>
    /// <param name="autoReconnect">Optional setting to determine if the server sould attempt to reconnect
    /// automatically on disconnection events. Defaults to true.
    /// </param>
    public constructor(baseName: string, requestHandler?: RequestHandler, autoReconnect: boolean = true) {
        this._baseName = baseName;
        this._requestHandler = requestHandler;
        this._autoReconnect = autoReconnect;
        this._requestManager = new RequestManager();
        this._sender = new PayloadSender();
        this._receiver = new PayloadReceiver();
        this._protocolAdapter = new ProtocolAdapter(this._requestHandler, this._requestManager, this._sender, this._receiver);
        this._sender.disconnected = this.onConnectionDisconnected.bind(this);
        this._receiver.disconnected = this.onConnectionDisconnected.bind(this);
    }

    /// <summary>
    /// Used to establish the connection used by this server and begin listening for incoming messages.
    /// </summary>
    /// <returns>A promised string that will not resolve as long as the server is running.</returns>
    public async start(): Promise<string> {
        if (this._receiver.isConnected || this._sender.isConnected || this._incomingServer || this._outgoingServer) {
            this.disconnect();
        }

        const incoming = new Promise(resolve => {
            this._incomingServer = new Server((socket: Socket): void => {
                this._receiver.connect(new NamedPipeTransport(socket));
                resolve();
            });
        });

        const outgoing = new Promise(resolve => {
            this._outgoingServer = new Server((socket: Socket): void => {
                this._sender.connect(new NamedPipeTransport(socket));
                resolve();
            });
        });

        await Promise.all([incoming, outgoing]);

        const { PipePath, ServerIncomingPath, ServerOutgoingPath } = NamedPipeTransport;
        const incomingPipeName = PipePath + this._baseName + ServerIncomingPath;
        const outgoingPipeName = PipePath + this._baseName + ServerOutgoingPath;

        this._incomingServer.listen(incomingPipeName);
        this._outgoingServer.listen(outgoingPipeName);

        return 'connected';
    }

    // Allows for manually disconnecting the server.
    public disconnect(): void {
        this._sender.disconnect();
        this._receiver.disconnect();

        if (this._incomingServer) {
            this._incomingServer.close();
            this._incomingServer = null;
        }

        if (this._outgoingServer) {
            this._outgoingServer.close();
            this._outgoingServer = null;
        }
    }

    /// <summary>
    /// Task used to send data over this server connection.
    /// </summary>
    /// <param name="request">The <see cref="StreamingRequest"/> to send.</param>
    /// <param name="cancellationToken">Optional <see cref="CancellationToken"/> used to signal this operation should be cancelled.</param>
    /// <returns>A <see cref="Task"/> of type <see cref="ReceiveResponse"/> handling the send operation.</returns>
    public async send(request: StreamingRequest): Promise<IReceiveResponse> {
        return this._protocolAdapter.sendRequest(request);
    }

    private onConnectionDisconnected(): void {
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
                    this.start()
                        .catch((err): void => { throw(new Error(`Unable to reconnect: ${ err.message }`)); });
                }
            }
            finally {
                this._isDisconnecting = false;
            }
        }
    }
}
