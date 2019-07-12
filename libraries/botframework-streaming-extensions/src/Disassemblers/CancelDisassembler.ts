/**
 * @module botframework-streaming-extensions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Header } from '../Models/Header';
import { PayloadTypes } from '../Models/PayloadTypes';
import { PayloadSender } from '../PayloadTransport/PayloadSender';

export class CancelDisassembler {
    private readonly sender: PayloadSender;
    private readonly id: string;
    private readonly payloadType: PayloadTypes;

    constructor(sender: PayloadSender, id: string, payloadType: PayloadTypes) {
        this.sender = sender;
        this.id = id;
        this.payloadType = payloadType;
    }

    public disassemble(): void {
        const header = new Header(this.payloadType, 0, this.id, true);

        this.sender.sendPayload(header, undefined, undefined);
    }
}
