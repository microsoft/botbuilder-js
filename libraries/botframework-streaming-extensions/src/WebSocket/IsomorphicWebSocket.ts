/**
 * @module botframework-streaming-extensions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { ISocket } from '../Interfaces/ISocket';

/// <summary>
/// Listen to the event only once, and unlisten from it after it is dispatched. This signature is same as EventTarget.addEventListener().
/// </summary>
function addEventListenerOnce<K extends keyof WebSocketEventMap>(
    eventTarget: WebSocket,
    type: K,
    listener: (this: WebSocket, ev: WebSocketEventMap[K]) => any,
    options?: boolean | AddEventListenerOptions
): void {
    const handler = (event: WebSocketEventMap[K]) => {
        eventTarget.removeEventListener(
            type,
            handler,
            typeof options === 'boolean' ?
                options
            :
                options && { capture: options.capture }
        );

        listener.call(eventTarget, event);
    };

    eventTarget.addEventListener(type, handler, options);
}

interface WebSocketPonyfill {
    // TODO: The type should be class of WebSocket
    WebSocket: any;
}

interface IsomorphicWebSocketOptions {
  ponyfill: WebSocketPonyfill;
  webSocket?: WebSocket;
}

export class IsomorphicWebSocket implements ISocket {
    private connectPromise: Promise<void>;
    private ponyfill: WebSocketPonyfill;
    private webSocket: any;

    private closeHandler: (code: number, reason: string) => void;
    private errorHandler: (error: Error) => void;
    private messageHandler: (data: any) => void;

    /// <summary>
    /// Creates a new instance of the NodeWebSocket class.
    /// </summary>
    /// <param name="webSocket">If the Web Socket is already established, pass it via this option.</param>
    public constructor({ ponyfill, webSocket }: IsomorphicWebSocketOptions) {
        this.ponyfill = ponyfill;
        this.webSocket = webSocket;

        if (webSocket) {
            this.attachEventHandlers();

            this.connectPromise = Promise.resolve();
        }
    }

    private attachEventHandlers() {
        this.webSocket.addEventListener('close', this.handleClose);
        this.webSocket.addEventListener('error', this.handleError);
        this.webSocket.addEventListener('message', this.handleMessage);
    }

    private detachEventHandlers() {
        this.webSocket.removeEventListener('close', this.handleClose);
        this.webSocket.removeEventListener('error', this.handleError);
        this.webSocket.removeEventListener('message', this.handleMessage);
    }

    private handleClose = (event: CloseEvent) => {
        this.closeHandler && this.closeHandler(event.code, event.reason);
    };

    private handleError = () => {
        // Web Socket do not pass the error for "onerror" event.
        this.errorHandler && this.errorHandler(new Error('Web Socket encountered an error.'));
    };

    private handleMessage = (event: MessageEvent) => {
        this.messageHandler && this.messageHandler(event.data);
    };

    /// <summary>
    /// True if the socket is currently connected.
    /// </summary>
    public isConnected(): boolean {
        return !!this.webSocket && this.webSocket.readyState === 1;
    }

    /// <summary>
    /// Writes a buffer to the socket and sends it.
    /// </summary>
    /// <param name="buffer">The buffer of data to send across the connection.</param>
    public write(message: any) {
        this.webSocket.send(message);
    }

    /// <summary>
    /// Connects to the supporting socket using WebSocket protocol.
    /// </summary>
    /// <param name="url">The address the server is listening on.</param>
    /// <param name="port">The port the server is listening on, defaults to 8082.</param>
    public async connect(url): Promise<void> {
        if (!this.connectPromise) {
            this.connectPromise = new Promise((resolve, reject) => {
                this.webSocket = new this.ponyfill.WebSocket(url);

                addEventListenerOnce(this.webSocket, 'open', () => resolve());
                addEventListenerOnce(this.webSocket, 'error', () => reject(new Error('Error received on Web Socket.')));
            }).then(() => {
                this.attachEventHandlers();
            });
        }

        return this.connectPromise;
    }

    /// <summary>
    /// Close the socket.
    /// </summary>
    public close(code?: number, reason?: string): Promise<void> {
        if (this.webSocket) {
            this.detachEventHandlers();

            // We save the Web Socket object here and declare it is closed.
            // So another call trying to connect() will immediately able to call connect() again.
            const closingWebSocket: WebSocket = this.webSocket;

            this.connectPromise = null;
            this.webSocket = null;

            return new Promise(resolve => {
                addEventListenerOnce(closingWebSocket, 'close', () => resolve());
                closingWebSocket.close(code, reason);
            });
        }

        // If no active Web Socket connection, assume it is successfully closed.
        // In real world, it could be still in closing state.
        return Promise.resolve();
    }

    /// <summary>
    /// Sets the callback to call when encountering socket closures.
    /// </summary>
    public setOnCloseHandler(handler: (code: number, reason: string) => void): void {
        this.closeHandler = handler;
    }

    /// <summary>
    /// Sets the callback to call when encountering errors.
    /// </summary>
    public setOnErrorHandler(handler: (error: Error) => void): void {
        this.errorHandler = handler;
    }

    /// <summary>
    /// Sets the handler for text and binary messages received on the socket.
    /// </summary>
    public setOnMessageHandler(handler: (data: any) => void): void {
        this.messageHandler = handler;
    }
}
