/**
 * @module botframework-streaming-extensions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { IHeader } from '../Models/Header';
import { SubscribableStream } from '../SubscribableStream';

export class SendPacket {
    public header: IHeader;
    public payload: SubscribableStream;
    public sentCallback: () => Promise<void>;

    public constructor(header: IHeader, payload: SubscribableStream, sentCallback: () => Promise<void>) {
        this.header = header;
        this.payload = payload;
        this.sentCallback = sentCallback;
    }
}
