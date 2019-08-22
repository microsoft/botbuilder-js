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
import { IStreamingTransportServer, IReceiveResponse } from '../interfaces';

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
    private _onClose: (arg0: string) => void;

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
        this._isDisconnecting = false;
        this._sender.disconnected = (): void => {
            this.onConnectionDisconnected();
        };
        this._receiver.disconnected = (): void => {
            this.onConnectionDisconnected();
        };
    }

    /// <summary>
    /// Used to establish the connection used by this server and begin listening for incoming messages.
    /// </summary>
    /// <returns>A promised string that will not resolve as long as the server is running.</returns>
    public start(): Promise<string> {
        let incomingConnect = false;
        let outgoingConnect = false;
        let result = new Promise<string>((resolve): void => {
            this._onClose = resolve;
        });

        if (this._receiver.isConnected || this._sender.isConnected || this._incomingServer || this._outgoingServer) {
            this.disconnect();
        }

        let incomingPipeName: string = NamedPipeTransport.PipePath + this._baseName + NamedPipeTransport.ServerIncomingPath;
        this._incomingServer = new Server((socket: Socket): void => {
            this._receiver.connect(new NamedPipeTransport(socket));
            incomingConnect = true;
            if (incomingConnect && outgoingConnect) {
                this._onClose('connected');
            }
        });

        this._incomingServer.listen(incomingPipeName);
        let outgoingPipeName: string = NamedPipeTransport.PipePath + this._baseName + NamedPipeTransport.ServerOutgoingPath;
        this._outgoingServer = new Server((socket: Socket): void => {
            this._sender.connect(new NamedPipeTransport(socket));
            outgoingConnect = true;
            if (incomingConnect && outgoingConnect) {
                this._onClose('connected');
            }
        });

        this._outgoingServer.listen(outgoingPipeName);

        return result;
    }

    // Allows for manually disconnecting the server.
    public disconnect(): void {
        this._sender.disconnect(undefined);
        this._receiver.disconnect(undefined);

        if (this._incomingServer) {
            this._incomingServer.close();
            this._incomingServer = undefined;
        }

        if (this._outgoingServer) {
            this._outgoingServer.close();
            this._outgoingServer = undefined;
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
                    this._sender.disconnect(undefined);
                }

                if (this._receiver.isConnected) {
                    this._receiver.disconnect(undefined);
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
