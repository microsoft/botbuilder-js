/**
 * @module botframework-streaming
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { IncomingMessage } from 'http';
import { Socket } from 'net';

import { NodeWebSocket } from '../nodeWebSocket';
import { NodeWebSocketFactoryBase } from './nodeWebSocketFactoryBase';

export class NodeWebSocketFactory extends NodeWebSocketFactoryBase {
    constructor() {
        super();
    }
    
    /**
     * Creates a NodeWebSocket instance.
     * @param req 
     * @param socket 
     * @param head 
     */
    public createWebSocket(req: IncomingMessage, socket: Socket, head: Buffer): NodeWebSocket {
        const s = new NodeWebSocket();
        s.create(req, socket, head);
        
        return s;
    }
}
