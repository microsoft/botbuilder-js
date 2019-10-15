/**
 * @module botframework-streaming
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { ContentStream } from '../contentStream';

/**
 * Streaming response from a receive request.
 */
export interface IReceiveResponse {
    statusCode?: number;
    streams: ContentStream[];
}
