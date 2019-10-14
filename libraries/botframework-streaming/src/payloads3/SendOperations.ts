/**
 * @module botframework-streaming
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { PayloadSender } from '../PayloadTransport/PayloadSender';
import { StreamingRequest } from '../StreamingRequest';
import { StreamingResponse } from '../StreamingResponse';
import { CancelDisassembler } from '../Disassemblers/CancelDisassembler';
import { HttpContentStreamDisassembler } from '../Disassemblers/HttpContentStreamDisassembler';
import { RequestDisassembler } from '../Disassemblers/RequestDisassembler';
import { ResponseDisassembler } from '../Disassemblers/ResponseDisassembler';
import { PayloadTypes } from './PayloadTypes';

export class SendOperations {
    private readonly payloadSender: PayloadSender;

    public constructor(payloadSender: PayloadSender) {
        this.payloadSender = payloadSender;
    }

    public async sendRequest(id: string, request: StreamingRequest): Promise<void> {
        let disassembler = new RequestDisassembler(this.payloadSender, id, request);

        await disassembler.disassemble();

        if (request.streams) {
            request.streams.forEach(async (contentStream): Promise<void> => {
                await new HttpContentStreamDisassembler(this.payloadSender, contentStream).disassemble();
            });
        }
    }

    public async sendResponse(id: string, response: StreamingResponse): Promise<void> {
        let disassembler = new ResponseDisassembler(this.payloadSender, id, response);

        await disassembler.disassemble();

        if (response.streams) {
            response.streams.forEach(async (contentStream): Promise<void> => {
                await new HttpContentStreamDisassembler(this.payloadSender, contentStream).disassemble();
            });
        }
    }

    public async sendCancelStream(id: string): Promise<void> {
        let disassembler = new CancelDisassembler(this.payloadSender, id, PayloadTypes.cancelStream);
        disassembler.disassemble();
    }
}
