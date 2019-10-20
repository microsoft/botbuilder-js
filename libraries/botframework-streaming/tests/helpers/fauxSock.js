/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

// Test code for a WebSocket.
class FauxSock {
    constructor(contentString) {
        if (contentString) {
            this.contentString = contentString;
            this.position = 0;
        }
        this.connecting = false;
        this.connected = true;
        this.readyState = 1;
        this.exists = true;

        this.onmessage = undefined;
        this.onerror = undefined;
        this.onclose = undefined;

        // `ws` specific check in WebSocketServer.completeUpgrade
        this.readable = true;
        this.writable = true;
    }

    /* Start of `ws` specific methods. */
    removeListener(event, handler) {
        switch (event) {
            case 'error':
                return;
            default:
                console.error(`FauxSock.removeListener(): Reached default case: ${event}`);
        }
    }

    setTimeout(value) {
        this.timeoutValue = value;
        return;
    }

    setNoDelay() {
    }
    /* End of `ws` specific methods. */

    get isConnected() {
        return this.connected;
    }

    write(buffer) {
        this.buffer = buffer;
    }

    send(buffer) {
        return buffer.length;
    };

    receive(readLength) {
        if (this.contentString[this.position]) {
            this.buff = Buffer.from(this.contentString[this.position]);
            this.position++;

            return this.buff.slice(0, readLength);
        }

        if (this.receiver.isConnected)
            this.receiver.disconnect();
    }
    close() { };
    close() {
        this.connected = false;
    };
    end() {
        this.exists = false;
        return true;
    };
    destroyed() {
        return this.exists;
    };

    /** WaterShed Socket Specific? */
    destroy() {
        return true;
    };

    /** WaterShed Socket Specific? */
    removeAllListeners() {
        return true;
    }

    on(action, handler) {
        if (action === 'error') {
            this.errorHandler = handler;
        }
        if (action === 'data') {
            this.messageHandler = handler;
        }
        if (action === 'close') {
            this.closeHandler = handler;
        }
        if (action === 'end') {
            this.endHandler = handler;
        }
        // Required for `watershed` WebSockets
        if (action === 'text') {
            this.textHandler = handler;
        }
        // Required for `watershed` WebSockets
        if (action === 'binary') {
            this.binaryHandler = handler;
        }
        // Required for `ws` WebSockets
        if (action === 'data') {
            this.dataHandler = handler;
        }
        // Required for `ws` WebSockets
        if (action === 'message') {
            this._messageHandler = handler;
        }
    };

    setReceiver(receiver) {
        this.receiver = receiver;
    }

    setOnMessageHandler(handler) {
        this.messageHandler = handler;
    };
    setOnErrorHandler(handler) {
        this.errorHandler = handler;
    };
    setOnCloseHandler(handler) {
        this.closeHandler = handler;
    };
}

module.exports.FauxSock = FauxSock;
