/**
 * @module botframework-streaming-extensions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { ContentStream } from './ContentStream';

export class ReceiveResponse {
    public StatusCode: number;
    public Streams: ContentStream[];

    /// <summary>
    /// Creates a new instance of the ReceiveResponse class.
    /// </summary>
    constructor() {
        this.Streams = [];
    }
}
