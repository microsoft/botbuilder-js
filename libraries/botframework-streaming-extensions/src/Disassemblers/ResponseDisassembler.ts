/**
 * @module botframework-streaming-extensions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { PayloadTypes } from '../Payloads/PayloadTypes';
import { IResponsePayload } from '../Interfaces/IResponsePayload';
import { IStreamDescription } from '../Interfaces/IStreamDescription';
import { PayloadSender } from '../PayloadTransport/PayloadSender';
import { StreamingResponse } from '../StreamingResponse';
import { PayloadDisassembler } from './PayloadDisassembler';
import { IStreamWrapper } from '../Interfaces/IStreamWrapper';

export class ResponseDisassembler extends PayloadDisassembler {
    public readonly response: StreamingResponse;
    public readonly payloadType: PayloadTypes = PayloadTypes.response;

    public constructor(sender: PayloadSender, id: string, response: StreamingResponse) {
        super(sender, id);

        this.response = response;
    }

    public async getStream(): Promise<IStreamWrapper> {
        let payload: IResponsePayload = {statusCode: this.response.statusCode}

        if (this.response.streams) {
            payload.streams = [];

            for (let i = 0; i < this.response.streams.length; i++) {
                let contentStream = this.response.streams[i];
                let description: IStreamDescription = await PayloadDisassembler.getStreamDescription(contentStream);
                payload.streams.push(description);
            }
        }

        return PayloadDisassembler.serialize(payload);
    }
}
