/**
 * @module botframework-streaming
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { SubscribableStream } from '../subscribableStream';
import { PayloadAssembler } from '../assemblers/payloadAssembler';
import { StreamManager } from './streamManager';
import { IHeader } from '../interfaces/IHeader';
import { PayloadTypes } from './payloadTypes';

/**
 * Orchestrates assemly of payloads
 */
export class PayloadAssemblerManager {
    private readonly onReceiveRequest;
    private readonly onReceiveResponse;
    private readonly streamManager: StreamManager;
    private readonly activeAssemblers: { [id: string]: PayloadAssembler } = {};

    public constructor(streamManager: StreamManager, onReceiveResponse: Function, onReceiveRequest: Function) {
        this.streamManager = streamManager;
        this.onReceiveRequest = onReceiveRequest;
        this.onReceiveResponse = onReceiveResponse;
    }

    public getPayloadStream(header: IHeader): SubscribableStream {
        if (header.payloadType === PayloadTypes.stream) {
            return this.streamManager.getPayloadStream(header);
        } else if (!this.activeAssemblers[header.id]) {
            let assembler = this.createPayloadAssembler(header);

            if (assembler) {
                this.activeAssemblers[header.id] = assembler;
                return assembler.getPayloadStream();
            }
        }
    }

    public onReceive(header: IHeader, contentStream: SubscribableStream, contentLength: number): void {
        if (header.payloadType === PayloadTypes.stream) {
            this.streamManager.onReceive(header, contentStream, contentLength);
        } else {
            if (this.activeAssemblers && this.activeAssemblers[header.id]) {
                let assembler = this.activeAssemblers[header.id];
                assembler.onReceive(header, contentStream, contentLength);
            }
            if (header.end) {
                delete this.activeAssemblers[header.id];
            }
        }
    }

    private createPayloadAssembler(header: IHeader): PayloadAssembler {
        if (header.payloadType === PayloadTypes.request) {
            return new PayloadAssembler(this.streamManager, {header: header, onCompleted: this.onReceiveRequest});
        } else if (header.payloadType === PayloadTypes.response) {
            return new PayloadAssembler(this.streamManager, {header: header, onCompleted: this.onReceiveResponse});
        }
    }
}
