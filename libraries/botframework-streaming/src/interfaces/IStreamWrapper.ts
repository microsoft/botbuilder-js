/**
 * @module botframework-streaming
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { SubscribableStream } from '../subscribableStream';

export interface IStreamWrapper {
    stream: SubscribableStream;
    streamLength?: number;
}
