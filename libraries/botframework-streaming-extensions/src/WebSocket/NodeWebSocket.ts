/**
 * @module botframework-streaming-extensions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import * as WebSocket from 'ws';

import { IsomorphicWebSocket } from './IsomorphicWebSocket';

class WebSocketWithEventTarget extends WebSocket {
    constructor(...args) {
        super(...args);

        // Bridging legacy "onclose", "onerror", "onmessage", and "onopen" event handlers.
        [
            'close',
            'error',
            'message',
            'open'
        ].forEach(name => {
            super.on(name, (...args) => {
                const handler = this[`on${ name }`];

                handler && handler.apply(this, args);
            });
        });
    }

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
