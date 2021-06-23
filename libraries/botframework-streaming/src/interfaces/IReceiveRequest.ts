/**
 * @module botframework-streaming
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { ContentStream } from '../contentStream';

/**
 * Streaming receive request definition.
 */
export interface IReceiveRequest {
    /**
     * Request verb; null on responses.
     */
    verb?: string;

    /**
     * Request path; null on responses.
     */
    path?: string;

    /**
     * Gets or sets the collection of stream attachments included in this request.
     */
    streams: ContentStream[];
}
