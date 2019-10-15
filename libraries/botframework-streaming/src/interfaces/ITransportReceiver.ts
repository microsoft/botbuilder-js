/**
 * @module botframework-streaming
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { ITransport } from './ITransport';

/**
 * Definition of a streaming transport that can receive requests.
 */
export interface ITransportReceiver extends ITransport {
    receive(count: number): Promise<Buffer>;
}
