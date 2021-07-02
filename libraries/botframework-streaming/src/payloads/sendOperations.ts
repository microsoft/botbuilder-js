/**
 * @module botframework-streaming
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { PayloadSender } from '../payloadTransport/payloadSender';
import { StreamingRequest } from '../streamingRequest';
import { StreamingResponse } from '../streamingResponse';
import { CancelDisassembler } from '../disassemblers/cancelDisassembler';
import { HttpContentStreamDisassembler } from '../disassemblers/httpContentStreamDisassembler';
import { RequestDisassembler } from '../disassemblers/requestDisassembler';
import { ResponseDisassembler } from '../disassemblers/responseDisassembler';
import { PayloadTypes } from './payloadTypes';

/**
 * Send operations for streaming payloads.
 */
export class SendOperations {
    private readonly payloadSender: PayloadSender;

    /**
     * Initializes a new instance of the [SendOperations](xref:botframework-streaming.SendOperations) class.
     *
     * @param payloadSender The [PayloadSender](xref:botframework-streaming.PayloadSender) that will send the disassembled data from all of this instance's send operations.
     */
    constructor(payloadSender: PayloadSender) {
        this.payloadSender = payloadSender;
    }

    /**
     * The send operation used to send a [StreamingRequest](xref:botframework-streaming.StreamingRequest).
     *
     * @param id The ID to assign to the [RequestDisassembler](xref:botframework-streaming.RequestDisassembler) used by this operation.
     * @param request The request to send.
     */
    async sendRequest(id: string, request: StreamingRequest): Promise<void> {
        const disassembler = new RequestDisassembler(this.payloadSender, id, request);

        await disassembler.disassemble();

        if (request.streams) {
            request.streams.forEach(
                async (contentStream): Promise<void> => {
                    await new HttpContentStreamDisassembler(this.payloadSender, contentStream).disassemble();
                }
            );
        }
    }

    /**
     * The send operation used to send a [PayloadTypes.response](xref:botframework-streaming.PayloadTypes.response).
     *
     * @param id The ID to assign to the [ResponseDisassembler](xref:botframework-streaming.ResponseDisassembler) used by this operation.
     * @param response The response to send.
     */
    async sendResponse(id: string, response: StreamingResponse): Promise<void> {
        const disassembler = new ResponseDisassembler(this.payloadSender, id, response);

        await disassembler.disassemble();

        if (response.streams) {
            response.streams.forEach(
                async (contentStream): Promise<void> => {
                    await new HttpContentStreamDisassembler(this.payloadSender, contentStream).disassemble();
                }
            );
        }
    }

    /**
     * The send operation used to send a [PayloadTypes.cancelStream](xref:botframework-streaming.PayloadTypes.cancelStream).
     *
     * @param id The ID to assign to the [CancelDisassembler](xref:botframework-streaming.CancelDisassembler) used by this operation.
     */
    async sendCancelStream(id: string): Promise<void> {
        const disassembler = new CancelDisassembler(this.payloadSender, id, PayloadTypes.cancelStream);
        disassembler.disassemble();
    }
}
