/**
 * @module botframework-streaming
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { INodeIncomingMessage, INodeBuffer, INodeSocket, ISocket } from '../../../interfaces';

export abstract class NodeWebSocketFactoryBase {
    public abstract createWebSocket(req: INodeIncomingMessage, socket: INodeSocket, head: INodeBuffer): Promise<ISocket>;
}
