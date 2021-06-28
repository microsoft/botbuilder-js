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
     * @param autoReconnect Deprecated: Automatic reconnection is the default behavior.
     */
    constructor(private readonly baseName: string, requestHandler?: RequestHandler, autoReconnect?: boolean) {
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
    get isConnected(): boolean {
        return this._receiver.isConnected && this._sender.isConnected;
    }

    /**
     * Used to establish the connection used by this server and begin listening for incoming messages.
     *
     * @param onListen Optional callback that fires once when server is listening on both incoming and outgoing pipe
     * @returns A promised string that will not resolve as long as the server is running.
     */
    async start(onListen?: () => void): Promise<string> {
        const { PipePath, ServerIncomingPath, ServerOutgoingPath } = NamedPipeTransport;

        // The first promise resolves as soon as the server is listening. The second resolves when the server
        // closes, or an error occurs. Wrapping with an array ensures the initial await only waits for the listening
        // promise.
        //
        // We want to ensure we are listening to the servers in series so that, if two processes start at the same
        // time, only one is able to listen on both the incoming and outgoing sockets.
        const [incoming] = await new Promise<[Promise<void>]>((resolveListening, rejectListening) => {
            const server = createNodeServer((socket) => {
                if (this._receiver.isConnected) {
                    return;
                }

                this._receiver.connect(new NamedPipeTransport(socket));
            }).once('error', rejectListening);

            this._incomingServer = server;

            const isListening = new Promise<void>((resolveClosed, rejectClosed) => {
                // Only register rejection once the server is actually listening
                server.once('listening', () => server.once('error', rejectClosed));
                server.once('closed', resolveClosed);
            });

            server.once('listening', () => resolveListening([isListening]));

            server.listen(PipePath + this.baseName + ServerIncomingPath);
        });

        // Now that we absolutely have the incoming socket, bind the outgoing socket as well
        const [outgoing] = await new Promise<[Promise<void>]>((resolveListening, rejectListening) => {
            const server = createNodeServer((socket) => {
                if (this._sender.isConnected) {
                    return;
                }

                // Note: manually disconnect sender if client closes socket. This ensures that
                // reconnections are allowed
                this._sender.connect(new NamedPipeTransport(socket));
                socket.once('close', () => this._sender.disconnect());
            }).once('error', rejectListening);

            this._outgoingServer = server;

            const isListening = new Promise<void>((resolveClosed, rejectClosed) => {
                // Only register rejection once the server is actually listening
                server.once('listening', () => server.once('error', rejectClosed));
                server.once('closed', resolveClosed);
            });

            server.once('listening', () => resolveListening([isListening]));

            server.listen(PipePath + this.baseName + ServerOutgoingPath);
        });

        onListen?.();

        await Promise.all([incoming, outgoing]);

        return 'connected';
    }

    /**
     * Allows for manually disconnecting the server.
     */
    disconnect(): void {
        this._receiver.disconnect();
        this._incomingServer?.close();
        this._incomingServer = null;

        this._sender.disconnect();
        this._outgoingServer?.close();
        this._outgoingServer = null;
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
}
