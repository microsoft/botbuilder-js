/**
 * @module botframework-streaming-extensions
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
import { PayloadTypes } from '../Models/PayloadTypes';

export class SendOperations {
    private readonly payloadSender: PayloadSender;

    constructor(payloadSender: PayloadSender) {
        this.payloadSender = payloadSender;
    }

    public async sendRequestAsync(id: string, request: StreamingRequest): Promise<void> {
        let disassembler = new RequestDisassembler(this.payloadSender, id, request);

        await disassembler.disassemble();

        if (request.Streams) {
            request.Streams.forEach(async (contentStream) => {
                await new HttpContentStreamDisassembler(this.payloadSender, contentStream).disassemble();
            });
        }
    }

    public async sendResponseAsync(id: string, response: StreamingResponse): Promise<void> {
        let disassembler = new ResponseDisassembler(this.payloadSender, id, response);

        await disassembler.disassemble();

        if (response.streams) {
            response.streams.forEach(async (contentStream) => {
                await new HttpContentStreamDisassembler(this.payloadSender, contentStream).disassemble();
            });
        }
    }

    public async sendCancelStreamAsync(id: string): Promise<void> {
        let disassembler = new CancelDisassembler(this.payloadSender, id, PayloadTypes.cancelStream);
        disassembler.disassemble();
    }
}
