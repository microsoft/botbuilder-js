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
     * Initializes a new instance of the `SendOperations` class.
     * @param payloadSender The `PayloadSender` that will send the disassembled data from all of this instance's send operations.
     */
    public constructor(payloadSender: PayloadSender) {
        this.payloadSender = payloadSender;
    }

    /**
     * The send operation used to send a `StreamingRequest`.
     * @param id The ID to assign to the `RequestDisassembler` used by this operation.
     * @param request The request to send.
     */
    public async sendRequest(id: string, request: StreamingRequest): Promise<void> {
        let disassembler = new RequestDisassembler(this.payloadSender, id, request);

        await disassembler.disassemble();

        if (request.streams) {
            request.streams.forEach(async (contentStream): Promise<void> => {
                await new HttpContentStreamDisassembler(this.payloadSender, contentStream).disassemble();
            });
        }
    }

    /**
     * The send operation used to send a `PayloadTypes.response`.
     * @param id The ID to assign to the `ResponseDisassembler` used by this operation.
     * @param response The response to send.
     */
    public async sendResponse(id: string, response: StreamingResponse): Promise<void> {
        let disassembler = new ResponseDisassembler(this.payloadSender, id, response);

        await disassembler.disassemble();

        if (response.streams) {
            response.streams.forEach(async (contentStream): Promise<void> => {
                await new HttpContentStreamDisassembler(this.payloadSender, contentStream).disassemble();
            });
        }
    }

    /**
     * The send operation used to send a `PayloadTypes.cancelStream`.
     * @param id The ID to assign to the `CancelDisassembler` used by this operation.
     */
    public async sendCancelStream(id: string): Promise<void> {
        let disassembler = new CancelDisassembler(this.payloadSender, id, PayloadTypes.cancelStream);
        disassembler.disassemble();
    }
}
