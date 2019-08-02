/**
 * @module botframework-streaming-extensions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { IHeader } from '../Interfaces/IHeader';
import { PayloadTypes } from '../Payloads/PayloadTypes';
import { PayloadSender } from '../PayloadTransport/PayloadSender';

export class CancelDisassembler {
    private readonly sender: PayloadSender;
    private readonly id: string;
    private readonly payloadType: PayloadTypes;

    public constructor(sender: PayloadSender, id: string, payloadType: PayloadTypes) {
        this.sender = sender;
        this.id = id;
        this.payloadType = payloadType;
    }

    public disassemble(): void {
        const header: IHeader = {PayloadType: this.payloadType, PayloadLength: 0, Id: this.id, End: true};
        this.sender.sendPayload(header, undefined, undefined);
    }
}
