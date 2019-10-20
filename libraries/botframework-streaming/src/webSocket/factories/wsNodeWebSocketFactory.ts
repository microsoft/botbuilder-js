/**
 * @module botframework-streaming
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { IncomingMessage } from 'http';
import { Socket } from 'net';

import { WsNodeWebSocket } from '../wsNodeWebSocket';

export class WsNodeWebSocketFactory {    
    /**
     * Creates a WsNodeWebSocket instance.
     * @param req 
     * @param socket 
     * @param head 
     */
    public async createWebSocket(req: IncomingMessage, socket: Socket, head: Buffer): Promise<WsNodeWebSocket> {
        const s = new WsNodeWebSocket();
        await s.create(req, socket, head);
        
        return s;
    }
}
