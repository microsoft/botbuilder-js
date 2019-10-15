/**
 * @module botframework-streaming
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { IHeader } from './IHeader';
import { SubscribableStream } from '../subscribableStream';

/**
 * Streaming send packet definition.
 */
export interface ISendPacket {
    header: IHeader;
    payload: SubscribableStream;
    sentCallback: () => Promise<void>;
}
