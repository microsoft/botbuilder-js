/**
 * @module botframework-streaming
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { PayloadTypes } from '../payloads';
import type { PayloadSender } from '../payloadTransport';

/**
 * Streaming cancel disassembler.
 */
export class CancelDisassembler {
    /**
     * Initializes a new instance of the [CancelDisassembler](xref:botframework-streaming.CancelDisassembler) class.
     *
     * @param sender The [PayloadSender](xref:botframework-streaming.PayloadSender) that this Cancel request will be sent by.
     * @param id The ID of the Stream to cancel.
     * @param payloadType The type of the Stream that is being cancelled.
     */
    constructor(
        private readonly sender: PayloadSender,
        private readonly id: string,
        private readonly payloadType: PayloadTypes
    ) {}

    /**
     * Initiates the process of disassembling the request and signals the [PayloadSender](xref:botframework-streaming.PayloadSender) to begin sending.
     */
    disassemble(): void {
        const header = {
            payloadType: this.payloadType,
            payloadLength: 0,
            id: this.id,
            end: true,
        };
        this.sender.sendPayload(header);
    }
}
