/**
 * @module botframework-streaming-extensions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { PayloadTypes } from '../Payloads/PayloadTypes';
import { IRequestPayload } from '../Interfaces/IRequestPayload';
import { PayloadSender } from '../PayloadTransport/PayloadSender';
import { StreamingRequest } from '../StreamingRequest';
import { PayloadDisassembler } from './PayloadDisassembler';
import { IStreamWrapper } from '../Interfaces/IStreamWrapper';

export class RequestDisassembler extends PayloadDisassembler {
    public request: StreamingRequest;
    public payloadType: PayloadTypes = PayloadTypes.request;

    public constructor(sender: PayloadSender, id: string, request?: StreamingRequest) {
        super(sender, id);
        this.request = request;
    }

    public async getStream(): Promise<IStreamWrapper> {
        let payload: IRequestPayload = {verb: this.request.verb, path: this.request.path};    
        if (this.request.streams) {
            payload.streams = this.DescribePayloadStreams(this.request.streams);
        }
        return PayloadDisassembler.serialize(payload);
    }
}
