/**
 * @module botframework-streaming-extensions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import WebSocket from 'ws';

import { IsomorphicWebSocket } from './IsomorphicWebSocket';

export class NodeWebSocket extends IsomorphicWebSocket {
    constructor(webSocket?: WebSocket) {
        super({
            ponyfill: { WebSocket },
            webSocket
        });
    }
}
