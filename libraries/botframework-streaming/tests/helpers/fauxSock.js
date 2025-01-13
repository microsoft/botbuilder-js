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
    removeListener(event, _handler) {
        switch (event) {
            case 'error':
                return;
            default:
                console.error(`FauxSock.removeListener(): Reached default case: ${event}`);
        }
    }

    setTimeout(value) {
        this.timeoutValue = value;
    }

    setNoDelay() {}
    /* End of `ws` specific methods. */

    get isConnected() {
        return this.connected;
    }

    write(buffer) {
        this.buffer = buffer;
    }

    send(buffer) {
        return buffer.length;
    }

    receive(readLength) {
        if (this.contentString[this.position]) {
            this.buff = Buffer.from(this.contentString[this.position]);
            this.position++;

            return this.buff.slice(0, readLength);
        }

        if (this.receiver.isConnected) this.receiver.disconnect();
    }
    close() {
        if (this.connected) {
            this.connected = false;
            this.closeHandler?.();
        }
    }
    end() {
        this.exists = false;
        return true;
    }
    destroyed() {
        return this.exists;
    }

    on(action, handler) {
        switch (action) {
            case 'error':
                this.errorHandler = handler;
                break;
            case 'close':
                this.closeHandler = handler;
                break;
            case 'end':
                this.endHandler = handler;
                break;
            case 'message':
                this.messageHandler = handler; // Required for `ws` WebSockets
                break;
            default:
                throw new Error(`TestError: Unknown action ("${action}") passed to FauxSock.on()`);
        }
    }

    setReceiver(receiver) {
        this.receiver = receiver;
    }

    setOnMessageHandler(handler) {
        this.messageHandler = handler;
    }
    setOnErrorHandler(handler) {
        this.errorHandler = handler;
    }
    setOnCloseHandler(handler) {
        this.closeHandler = handler;
    }
}

module.exports.FauxSock = FauxSock;
