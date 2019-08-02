/**
 * @module botframework-streaming-extensions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { SubscribableStream } from '../SubscribableStream';
import { PayloadAssembler } from '../Assemblers/PayloadAssembler';
import { StreamManager } from './StreamManager';
import { IHeader } from '../Models/Header';
import { PayloadTypes } from '../Models/PayloadTypes';

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
        if (header.PayloadType === PayloadTypes.stream) {
            return this.streamManager.getPayloadStream(header);
        } else {
            if (this.activeAssemblers[header.Id] === undefined) {
                let assembler = this.createPayloadAssembler(header);
                if (assembler !== undefined) {
                    this.activeAssemblers[header.Id] = assembler;

                    return assembler.getPayloadStream();
                }
            }
        }

        return undefined;
    }

    public onReceive(header: IHeader, contentStream: SubscribableStream, contentLength: number): void {
        if (header.PayloadType === PayloadTypes.stream) {
            this.streamManager.onReceive(header, contentStream, contentLength);
        } else {
            if (this.activeAssemblers !== undefined && this.activeAssemblers[header.Id] !== undefined) {
                let assembler = this.activeAssemblers[header.Id];
                assembler.onReceive(header, contentStream, contentLength);
            }
            if (header.End) {
                delete this.activeAssemblers[header.Id];
            }
        }
    }

    private createPayloadAssembler(header: IHeader): PayloadAssembler {
        switch (header.PayloadType) {
            case PayloadTypes.request:
                return new PayloadAssembler(this.streamManager, {header: header, onCompleted: this.onReceiveRequest});

            case PayloadTypes.response:
                return new PayloadAssembler(this.streamManager, {header: header, onCompleted: this.onReceiveResponse});

            default:
        }
    }
}
