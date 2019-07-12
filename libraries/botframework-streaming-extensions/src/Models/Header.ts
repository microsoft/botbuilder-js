/**
 * @module botframework-streaming-extensions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { TransportConstants } from '../Transport/TransportConstants';

export class Header {
    public PayloadType: string;

    public PayloadLength: number;

    public Id: string;

    public End: boolean;

    constructor(payloadType: string, payloadLength: number, id: string, end: boolean) {
        this.PayloadType = payloadType;
        this.clampLength(payloadLength, TransportConstants.MaxLength, TransportConstants.MinLength);
        this.PayloadLength = payloadLength;
        this.Id = id;
        this.End = end;
    }

    private clampLength(value, max, min): void {
        if (value > max) {
            throw new Error(`Length must be less than ${ TransportConstants.MaxLength.toString() }`);
        }
        if (value < min) {
            throw new Error(`Length must be greater than ${ TransportConstants.MinLength.toString() }`);
        }
    }
}
