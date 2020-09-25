/**
 * @module botframework-streaming
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { PayloadTypes } from '../payloads/payloadTypes';
import { PayloadSender } from '../payloadTransport/payloadSender';
import { StreamingRequest } from '../streamingRequest';
import { PayloadDisassembler } from './payloadDisassembler';
import { IStreamWrapper } from '../interfaces/IStreamWrapper';
import { IRequestPayload } from '../interfaces/IRequestPayload';

/**
 * Streaming request disassembler.
 */
export class RequestDisassembler extends PayloadDisassembler {
    public request: StreamingRequest;
    public payloadType: PayloadTypes = PayloadTypes.request;

    /**
     * Initializes a new instance of the `RequestDisassembler` class.
     * @param sender The `PayloadSender` to send the disassembled data to.
     * @param id The ID of this disassembler.
     * @param request The request to be disassembled.
     */
    public constructor(sender: PayloadSender, id: string, request?: StreamingRequest) {
        super(sender, id);
        this.request = request;
    }

    /**
     * Gets the stream this disassembler is operating on.
     * @returns An `IStreamWrapper` with a Subscribable Stream.
     */
    public async getStream(): Promise<IStreamWrapper> {
        let payload: IRequestPayload = {verb: this.request.verb, path: this.request.path, streams: []};
        if (this.request.streams) {
            this.request.streams.forEach(function(stream){
                payload.streams.push(stream.description);
            });
        }
        return PayloadDisassembler.serialize(payload);
    }
}
