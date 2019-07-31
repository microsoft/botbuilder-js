/**
 * @module botframework-streaming-extensions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Header } from '../Models/Header';
import { SubscribableStream } from '../SubscribableStream';

export class SendPacket {
    public header: Header;
    public payload: SubscribableStream;
    public sentCallback: () => Promise<void>;

    public constructor(header: Header, payload: SubscribableStream, sentCallback: () => Promise<void>) {
        this.header = header;
        this.payload = payload;
        this.sentCallback = sentCallback;
    }
}
