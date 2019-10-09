/**
 * @module botframework-streaming-extensions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import WebSocket from 'ws';

import { IsomorphicWebSocket } from './IsomorphicWebSocket';

// TODO: This is not a full EventTarget implementation, missing "onmessage", etc.
//       We should implement it.
class WebSocketWithEventTarget extends WebSocket {
    addEventListener(name, listener) {
        super.on(name, listener);
    }

    removeEventListener(name, listener) {
        super.off(name, listener);
    }
}

export class NodeWebSocket extends IsomorphicWebSocket {
    constructor(webSocket?: WebSocket) {
        super({
            ponyfill: { WebSocket: WebSocketWithEventTarget },
            webSocket
        });
    }
}
