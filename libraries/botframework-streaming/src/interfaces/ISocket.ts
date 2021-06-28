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

import { INodeBuffer } from './INodeBuffer';

export interface ISocket {
    isConnected: boolean;
    write(buffer: INodeBuffer);
    connect(serverAddress: string): Promise<void>;
    close();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setOnMessageHandler(handler: (x: any) => void);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setOnErrorHandler(handler: (x: any) => void);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setOnCloseHandler(handler: (x: any) => void);
}
