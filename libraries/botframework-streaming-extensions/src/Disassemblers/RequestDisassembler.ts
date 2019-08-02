/**
 * @module botframework-streaming-extensions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { PayloadTypes } from '../Payloads/PayloadTypes';
import { IRequestPayload } from '../Interfaces/IRequestPayload';
import { IStreamDescription } from '../Interfaces/IStreamDescription';
import { PayloadSender } from '../PayloadTransport/PayloadSender';
import { StreamingRequest } from '../StreamingRequest';
import { PayloadDisassembler } from './PayloadDisassembler';
import { IStreamWrapper } from '../Interfaces/IStreamWrapper';

export class RequestDisassembler extends PayloadDisassembler {
    public request: StreamingRequest;
    public payloadType: PayloadTypes = PayloadTypes.request;

    public constructor(sender: PayloadSender, id: string, request: StreamingRequest) {
        super(sender, id);
        this.request = request;
    }

    public async getStream(): Promise<IStreamWrapper> {
        let payload: IRequestPayload = { verb: this.request.Verb, path: this.request.Path};

        if (this.request.Streams) {
            payload.streams = [];

            for (let i = 0; i < this.request.Streams.length; i++) {
                let contentStream = this.request.Streams[i];
                let description: IStreamDescription = await PayloadDisassembler.getStreamDescription(contentStream);
                payload.streams.push(description);
            }
        }

        return PayloadDisassembler.serialize(payload);
    }
}
