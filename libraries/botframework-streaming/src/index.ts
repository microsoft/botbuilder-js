/**
 * @module botframework-streaming
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

export { ContentStream } from './contentStream';
export { HttpContent } from './httpContentStream';
export {
    INodeBuffer,
    INodeIncomingMessage,
    INodeSocket,
    IReceiveRequest,
    IReceiveResponse,
    ISocket,
    IStreamingTransportClient,
    IStreamingTransportServer,
} from './interfaces';
export { NamedPipeClient, NamedPipeServer } from './namedPipe';
export { RequestHandler } from './requestHandler';
export { StreamingRequest } from './streamingRequest';
export { StreamingResponse } from './streamingResponse';
export { SubscribableStream } from './subscribableStream';
export {
    NodeWebSocket,
    NodeWebSocketFactory,
    NodeWebSocketFactoryBase,
    WebSocketClient,
    WebSocketServer,
} from './webSocket';
