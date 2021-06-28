/**
 * @module botframework-streaming
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { INodeIncomingMessage, INodeBuffer, INodeSocket, ISocket } from '../../interfaces';

/**
 * Represents an abstract NodeWebSocketFactoryBase class to create a WebSocket.
 */
export abstract class NodeWebSocketFactoryBase {
    abstract createWebSocket(req: INodeIncomingMessage, socket: INodeSocket, head: INodeBuffer): Promise<ISocket>;
}
