/**
 * @module botframework-streaming
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { IStreamWrapper } from '../interfaces';
import { PayloadTypes } from '../payloads/payloadTypes';
import type { PayloadSender } from '../payloadTransport/payloadSender';
import type { StreamingRequest } from '../streamingRequest';
import { PayloadDisassembler } from './payloadDisassembler';

/**
 * Streaming request disassembler.
 */
export class RequestDisassembler extends PayloadDisassembler {
    payloadType: PayloadTypes = PayloadTypes.request;

    /**
     * Initializes a new instance of the [RequestDisassembler](xref:botframework-streaming.RequestDisassembler) class.
     *
     * @param sender The [PayloadSender](xref:botframework-streaming.PayloadSender) to send the disassembled data to.
     * @param id The ID of this disassembler.
     * @param request The request to be disassembled.
     */
    constructor(sender: PayloadSender, id: string, public request?: StreamingRequest) {
        super(sender, id);
    }

    /**
     * Gets the stream this disassembler is operating on.
     *
     * @returns An [IStreamWrapper](xref:botframework-streaming.IStreamWrapper) with a Subscribable Stream.
     */
    async getStream(): Promise<IStreamWrapper> {
        const payload = { verb: this.request?.verb, path: this.request?.path, streams: [] };
        this.request?.streams?.forEach(function (stream) {
            payload.streams.push(stream.description);
        });

        return PayloadDisassembler.serialize(payload);
    }
}
