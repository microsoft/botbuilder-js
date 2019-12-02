/**
 * @module botframework-streaming
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { INodeIncomingMessage, INodeBuffer, INodeSocket } from '../../interfaces';
import { NodeWebSocket } from '../nodeWebSocket';
import { NodeWebSocketFactoryBase } from './nodeWebSocketFactoryBase';

export class NodeWebSocketFactory extends NodeWebSocketFactoryBase {
    constructor() {
        super();
    }

    /**
     * Creates a NodeWebSocket instance.
     * @remarks
     * The parameters for this method should be associated with an 'upgrade' event off of a Node.js HTTP Server.
     * @param req An IncomingMessage from the 'http' module in Node.js.
     * @param socket The Socket connecting the bot and the server, from the 'net' module in Node.js.
     * @param head The first packet of the upgraded stream which may be empty per https://nodejs.org/api/http.html#http_event_upgrade_1.
     */
    public async createWebSocket(req: INodeIncomingMessage, socket: INodeSocket, head: INodeBuffer): Promise<NodeWebSocket> {
        const s = new NodeWebSocket();
        await s.create(req, socket, head);
        
        return s;
    }
}
