/**
 * @module botframework-streaming-extensions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { IsomorphicWebSocket } from './IsomorphicWebSocket';

import createAsyncSequencer from '../Utilities/createAsyncSequencer';
import readAsArrayBuffer from '../Utilities/readAsArrayBuffer';

export class BrowserWebSocket extends IsomorphicWebSocket {
    private sequencedReadAsArrayBuffer: (promise: Promise<ArrayBuffer>) => Promise<ArrayBuffer>;

    constructor(webSocket?: WebSocket) {
        super({
            ponyfill: { WebSocket },
            webSocket: webSocket
        });

        this.sequencedReadAsArrayBuffer = createAsyncSequencer<ArrayBuffer>();
    }

    public setOnMessageHandler(handler: (message: any) => void): void {
        super.setOnMessageHandler(message => {
            this.sequencedReadAsArrayBuffer(readAsArrayBuffer(message)).then(handler);
        });
    }
}
