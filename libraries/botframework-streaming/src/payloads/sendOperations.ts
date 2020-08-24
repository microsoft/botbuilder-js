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

    public constructor(payloadSender: PayloadSender) {
        this.payloadSender = payloadSender;
    }

    public async sendRequest(id: string, request: StreamingRequest): Promise<void> {
        const disassembler = new RequestDisassembler(this.payloadSender, id, request);

        await disassembler.disassemble();

        if (request.streams) {
            request.streams.forEach(async (contentStream): Promise<void> => {
                await new HttpContentStreamDisassembler(this.payloadSender, contentStream).disassemble();
            });
        }
    }

    public async sendResponse(id: string, response: StreamingResponse): Promise<void> {
        const disassembler = new ResponseDisassembler(this.payloadSender, id, response);

        await disassembler.disassemble();

        if (response.streams) {
            response.streams.forEach(async (contentStream): Promise<void> => {
                await new HttpContentStreamDisassembler(this.payloadSender, contentStream).disassemble();
            });
        }
    }

    public async sendCancelStream(id: string): Promise<void> {
        const disassembler = new CancelDisassembler(this.payloadSender, id, PayloadTypes.cancelStream);
        disassembler.disassemble();
    }
}
