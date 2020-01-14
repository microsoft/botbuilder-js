/**
 * @module botframework-streaming
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/**
 * Partially represents a WebSocket from the HTML Living Standard.
 * For more information, see https://html.spec.whatwg.org/multipage/web-sockets.html.
 * 
 * This interface supports the framework and is not intended to be called directly for your code.
 */
export interface IBrowserWebSocket {
    onclose: (event: any) => void;
    onerror: (event: any) => void;
    onmessage: (event: any) => void;
    onopen: (event: any) => void;
    readyState: number;

    close(): void;
    send(buffer: any): void;
}
