/**
 * @module botframework-streaming
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/**
 * The interface implemented by any compatible socket transport, typically used
 * with the WebSocket server or client.
 */
export interface ISocket {
    isConnected(): boolean;
    write(buffer: Buffer);
    connect(serverAddress: string): Promise<void>;
    close();
    setOnMessageHandler(handler: (x: any) => void);
    setOnErrorHandler(handler: (x: any) => void);
    setOnCloseHandler(handler: (x: any) => void);
}
