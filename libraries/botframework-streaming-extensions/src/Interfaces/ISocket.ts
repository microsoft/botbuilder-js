/**
 * @module botframework-streaming-extensions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/// <summary>
/// The interface implemented by any compatible socket transport, typically used
/// with the WebSocket server or client.
/// </summary>
export interface ISocket {
    // TODO: We could convert this into property.
    isConnected(): boolean;
    write(message: any);
    connect(url: string): Promise<void>;
    close(code?: number, reason?: string): Promise<void>;
    setOnMessageHandler(handler: (message: any) => void);
    setOnErrorHandler(handler: (error: Error) => void);
    setOnCloseHandler(handler: (code: number, reason: string) => void);
}
