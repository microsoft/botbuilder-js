/**
 * @module botframework-streaming
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { INodeServer, IStreamingTransportServer, IReceiveResponse } from '../interfaces';
import { NamedPipeTransport } from './namedPipeTransport';
import { PayloadReceiver, PayloadSender } from '../payloadTransport';
import { ProtocolAdapter } from '../protocolAdapter';
import { RequestHandler } from '../requestHandler';
import { RequestManager } from '../payloads';
import { StreamingRequest } from '../streamingRequest';
import { createNodeServer } from '../utilities/createNodeServer';

/**
 * Streaming transport server implementation that uses named pipes for inter-process communication.
 */
export class NamedPipeServer implements IStreamingTransportServer {
    private _outgoingServer: INodeServer;
    private _incomingServer: INodeServer;

    private readonly _sender = new PayloadSender();
    private readonly _receiver = new PayloadReceiver();
    private readonly _protocolAdapter: ProtocolAdapter;

    /**
     * Creates a new instance of the [NamedPipeServer](xref:botframework-streaming.NamedPipeServer) class.
     *
     * @param baseName The named pipe to connect to.
     * @param requestHandler Optional [RequestHandler](xref:botframework-streaming.RequestHandler) to process incoming messages received by this client.
     * @param autoReconnect Optional flag to indicate that server should reconnect instead of closing
     */
    public constructor(private readonly baseName: string, requestHandler?: RequestHandler, autoReconnect?: boolean) {
        if (!baseName) {
            throw new TypeError('NamedPipeServer: Missing baseName parameter');
        }

        if (autoReconnect != null) {
            console.warn('NamedPipeServer: The autoReconnect parameter is deprecated');
        }

        this._sender = new PayloadSender();
        this._receiver = new PayloadReceiver();
        this._protocolAdapter = new ProtocolAdapter(requestHandler, new RequestManager(), this._sender, this._receiver);
    }

    /**
     * Get connected status
     *
     * @returns true if currently connected.
     */
    public get isConnected(): boolean {
        return this._receiver.isConnected && this._sender.isConnected;
    }

    /**
     * Used to establish the connection used by this server and begin listening for incoming messages.
     *
     * @returns A promised string that will not resolve as long as the server is running.
     */
    public async start(): Promise<string> {
        const { PipePath, ServerIncomingPath, ServerOutgoingPath } = NamedPipeTransport;

        const incoming = new Promise<void>((resolve, reject) => {
            const server = createNodeServer((socket) => {
                if (this._receiver.isConnected) {
                    return;
                }

                this._receiver.connect(new NamedPipeTransport(socket));
            });

            server.once('closed', resolve);
            server.once('error', reject);
            server.listen(PipePath + this.baseName + ServerIncomingPath);

            this._incomingServer = server;
        });

        const outgoing = new Promise<void>((resolve, reject) => {
            const server = createNodeServer((socket) => {
                if (this._sender.isConnected) {
                    return;
                }

                // Note: manually disconnect sender if client closes socket. This ensures that
                // reconnections are allowed
                this._sender.connect(new NamedPipeTransport(socket));
                socket.once('close', () => this._sender.disconnect());
            });

            server.once('closed', resolve);
            server.once('error', reject);
            server.listen(PipePath + this.baseName + ServerOutgoingPath);

            this._outgoingServer = server;
        });

        await Promise.all([incoming, outgoing]);

        return 'connected';
    }

    /**
     * Allows for manually disconnecting the server.
     */
    public disconnect(): void {
        this._receiver.disconnect();
        if (this._incomingServer) {
            this._incomingServer.close();
            this._incomingServer = null;
        }

        this._sender.disconnect();
        if (this._outgoingServer) {
            this._outgoingServer.close();
            this._outgoingServer = null;
        }
    }

    /**
     * Task used to send data over this client connection.
     *
     * @param request The [StreamingRequest](xref:botframework-streaming.StreamingRequest) to send.
     * @returns A promise for an instance of [IReceiveResponse](xref:botframework-streaming.IReceiveResponse) on completion of the send operation.
     */
    public async send(request: StreamingRequest): Promise<IReceiveResponse> {
        return this._protocolAdapter.sendRequest(request);
    }
}
