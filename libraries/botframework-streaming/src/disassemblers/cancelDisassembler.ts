/**
 * @module botframework-streaming
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { IHeader } from '../interfaces/IHeader';
import { PayloadTypes } from '../payloads/payloadTypes';
import { PayloadSender } from '../payloadTransport/payloadSender';

/**
 * Streaming cancel disassembler.
 */
export class CancelDisassembler {
    private readonly sender: PayloadSender;
    private readonly id: string;
    private readonly payloadType: PayloadTypes;

    /**
     * Initializes a new instance of the `CancelDisassembler` class.
     * @param sender The `PayloadSender` that this Cancel request will be sent by.
     * @param id The ID of the Stream to cancel.
     * @param payloadType The type of the Stream that is being cancelled.
     */
    public constructor(sender: PayloadSender, id: string, payloadType: PayloadTypes) {
        this.sender = sender;
        this.id = id;
        this.payloadType = payloadType;
    }

    /**
     * Initiates the process of disassembling the request and signals the `PayloadSender` to begin sending.
     */
    public disassemble(): void {
        const header: IHeader = {payloadType: this.payloadType, payloadLength: 0, id: this.id, end: true};
        this.sender.sendPayload(header);
    }
}
