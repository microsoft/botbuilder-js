/**
 * @module botframework-streaming-extensions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { SubscribableStream } from '../Stream';
import { PayloadAssembler } from '../Assemblers/PayloadAssembler';
import { ReceiveRequestAssembler } from '../Assemblers/ReceiveRequestAssembler';
import { ReceiveResponseAssembler } from '../Assemblers/ReceiveResponseAssembler';
import { StreamManager } from './StreamManager';
import { Header } from '../Models/Header';
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

    public getPayloadStream(header: Header): SubscribableStream {
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

    public onReceive(header: Header, contentStream: SubscribableStream, contentLength: number): void {
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

    private createPayloadAssembler(header: Header): PayloadAssembler {
        switch (header.PayloadType) {
            case PayloadTypes.request:
                return new ReceiveRequestAssembler(header, this.streamManager, this.onReceiveRequest);

            case PayloadTypes.response:
                return new ReceiveResponseAssembler(header, this.streamManager, this.onReceiveResponse);

            default:
        }
    }
}
