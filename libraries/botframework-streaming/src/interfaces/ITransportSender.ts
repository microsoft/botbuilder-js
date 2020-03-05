/**
 * @module botframework-streaming
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { ITransport } from './ITransport';
import { INodeBuffer } from './INodeBuffer';

/**
 * Definition of a streaming transport that can send requests.
 */
export interface ITransportSender extends ITransport {
    send(buffer: INodeBuffer): number;
}
