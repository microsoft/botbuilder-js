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
import { IHeader, IReceiveResponse, IReceiveRequest } from '../interfaces';
import { PayloadTypes } from './payloadTypes';

/**
 * Orchestrates assembly of payloads.
 */
export class PayloadAssemblerManager {
    private readonly activeAssemblers: { [id: string]: PayloadAssembler } = {};

    /**
     * Initializes a new instance of the [PayloadAssemblerManager](xref:botframework-streaming.PayloadAssemblerManager) class.
     *
     * @param streamManager The [StreamManager](xref:botframework-streaming.StreamManager) managing the stream being assembled.
     * @param onReceiveResponse Function that executes when new bytes are received on a `response` stream.
     * @param onReceiveRequest Function that executes when new bytes are received on a `request` stream.
     */
    constructor(
        private readonly streamManager: StreamManager,
        private readonly onReceiveResponse: (id: string, receiveResponse: IReceiveResponse) => Promise<void>,
        private readonly onReceiveRequest: (id: string, receiveRequest: IReceiveRequest) => Promise<void>
    ) {}

    /**
     * Retrieves the assembler's payload as a stream.
     *
     * @param header The Header of the Stream to retrieve.
     * @returns A [SubscribableStream](xref:botframework-streaming.SubscribableStream) of the assembler's payload.
     */
    getPayloadStream(header: IHeader): SubscribableStream {
        if (header.payloadType === PayloadTypes.stream) {
            return this.streamManager.getPayloadStream(header);
        } else if (!this.activeAssemblers[header.id]) {
            const assembler = this.createPayloadAssembler(header);

            if (assembler) {
                this.activeAssemblers[header.id] = assembler;
                return assembler.getPayloadStream();
            }
        }
    }

    /**
     * The action the assembler executes when new bytes are received on the incoming stream.
     *
     * @param header The stream's Header.
     * @param contentStream The incoming stream being assembled.
     * @param contentLength The length of the stream, if finite.
     */
    onReceive(header: IHeader, contentStream: SubscribableStream, contentLength: number): void {
        if (header.payloadType === PayloadTypes.stream) {
            this.streamManager.onReceive(header, contentStream, contentLength);
        } else {
            if (this.activeAssemblers && this.activeAssemblers[header.id]) {
                const assembler = this.activeAssemblers[header.id];
                assembler.onReceive(header, contentStream, contentLength);
            }
            if (header.end) {
                delete this.activeAssemblers[header.id];
            }
        }
    }

    private createPayloadAssembler(header: IHeader): PayloadAssembler {
        if (header.payloadType === PayloadTypes.request) {
            return new PayloadAssembler(this.streamManager, {
                header,
                onCompleted: this.onReceiveRequest,
            });
        } else if (header.payloadType === PayloadTypes.response) {
            return new PayloadAssembler(this.streamManager, {
                header,
                onCompleted: this.onReceiveResponse,
            });
        }
    }
}
