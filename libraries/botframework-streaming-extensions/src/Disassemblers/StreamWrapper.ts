/**
 * @module botframework-streaming-extensions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { SubscribableStream } from '../Stream';

export class StreamWrapper {
    public stream: SubscribableStream;
    public streamLength?: number;

    public constructor(stream: SubscribableStream, streamLength?: number) {
        this.stream = stream;
        this.streamLength = streamLength;
    }
}
