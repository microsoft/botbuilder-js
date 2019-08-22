/**
 * @module botframework-streaming-extensions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { PayloadTypes } from '../payloads/PayloadTypes';
import { PayloadSender } from '../payloadtransport/PayloadSender';
import { StreamingRequest } from '../StreamingRequest';
import { PayloadDisassembler } from './payloadDisassembler';
import { IStreamWrapper } from '../interfaces/IStreamWrapper';
import { IRequestPayload } from '../interfaces/IRequestPayload';

export class RequestDisassembler extends PayloadDisassembler {
    public request: StreamingRequest;
    public payloadType: PayloadTypes = PayloadTypes.request;

    public constructor(sender: PayloadSender, id: string, request?: StreamingRequest) {
        super(sender, id);
        this.request = request;
    }

    public async getStream(): Promise<IStreamWrapper> {
        let payload: IRequestPayload = {verb: this.request.verb, path: this.request.path, streams: []};    
        if (this.request.streams) {
            this.request.streams.forEach(function(stream){
                payload.streams.push(stream.description);
            })
        }
        return PayloadDisassembler.serialize(payload);
    }
}
