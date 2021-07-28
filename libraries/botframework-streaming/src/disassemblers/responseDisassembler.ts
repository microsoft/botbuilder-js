/**
 * @module botframework-streaming
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { PayloadTypes } from '../payloads/payloadTypes';
import { PayloadSender } from '../payloadTransport/payloadSender';
import { StreamingResponse } from '../streamingResponse';
import { PayloadDisassembler } from './payloadDisassembler';
import { IResponsePayload, IStreamWrapper } from '../interfaces';

/**
 * Streaming response disassembler.
 */
export class ResponseDisassembler extends PayloadDisassembler {
    readonly response: StreamingResponse;
    readonly payloadType: PayloadTypes = PayloadTypes.response;

    /**
     * Initializes a new instance of the [ResponseDisassembler](xref:botframework-streaming.ResponseDisassembler) class.
     *
     * @param sender The [PayloadSender](xref:botframework-streaming.PayloadSender) to send the disassembled data to.
     * @param id The ID of this disassembler.
     * @param response The response to be disassembled.
     */
    constructor(sender: PayloadSender, id: string, response: StreamingResponse) {
        super(sender, id);
        this.response = response;
    }

    /**
     * Gets the stream this disassembler is operating on.
     *
     * @returns An [IStreamWrapper](xref:botframework-streaming.IStreamWrapper) with a Subscribable Stream.
     */
    async getStream(): Promise<IStreamWrapper> {
        const payload: IResponsePayload = { statusCode: this.response.statusCode, streams: [] };

        this.response.streams?.forEach(({ description }) => {
            payload.streams.push({
                id: description.id,
                contentType: description.type,
                length: description.length,
            });
        });

        return PayloadDisassembler.serialize(payload);
    }
}
