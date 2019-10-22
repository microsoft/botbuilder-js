/**
 * @module botframework-streaming
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { IncomingMessage } from 'http';
import { Socket } from 'net';
import { ISocket } from '../../interfaces';

export abstract class NodeWebSocketFactoryBase {
    public abstract createWebSocket(req: IncomingMessage, socket: Socket, head: Buffer): ISocket;
}
