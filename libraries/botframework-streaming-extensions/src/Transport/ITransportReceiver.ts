/**
 * @module botframework-streaming-extensions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { ITransport } from './ITransport';

export interface ITransportReceiver extends ITransport {
    receiveAsync(count: number): Promise<Buffer>;
}
