/**
 * @module botframework-streaming-extensions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { ContentStream } from '../ContentStream';

export interface IReceiveRequest {
    /// Request verb, null on responses
    /// </summary>
    Verb?: string;

    /// <summary>
    /// Request path; null on responses
    /// </summary>
    Path?: string;

    /// <summary>
    /// Gets or sets the collection of stream attachments included in this request.
    /// </summary>
    Streams: ContentStream[];
}
