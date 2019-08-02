/**
 * @module botframework-streaming-extensions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { PayloadAssembler } from './Assemblers/PayloadAssembler';
import { IHeader } from './Models/Header';
import { PayloadAssemblerManager } from './Payloads/PayloadAssemblerManager';
import { RequestManager } from './Payloads/RequestManager';
import { SendOperations } from './Payloads/SendOperations';
import { StreamManager } from './Payloads/StreamManager';
import { PayloadReceiver } from './PayloadTransport/PayloadReceiver';
import { PayloadSender } from './PayloadTransport/PayloadSender';
import { ReceiveRequest } from './ReceiveRequest';
import { ReceiveResponse } from './ReceiveResponse';
import { RequestHandler } from './RequestHandler';
import { SubscribableStream } from './SubscribableStream';
import { StreamingRequest } from './StreamingRequest';
import { generateGuid } from './Utilities/protocol-base';

export class ProtocolAdapter {
    private readonly requestHandler: RequestHandler;
    private readonly payloadSender: PayloadSender;
    private readonly payloadReceiver: PayloadReceiver;
    private readonly requestManager: RequestManager;
    private readonly sendOperations: SendOperations;
    private readonly streamManager: StreamManager;
    private readonly assemblerManager: PayloadAssemblerManager;

    /// <summary>
    /// Creates a new instance of the protocol adapter class.
    /// </summary>
    /// <param name="requestHandler">The handler that will process incoming requests.</param>
    /// <param name="requestManager">The manager that will process outgoing requests.</param>
    /// <param name="sender">The sender for use with outgoing requests.</param>
    /// <param name="receiver">The receiver for use with incoming requests.</param>
    public constructor(requestHandler: RequestHandler, requestManager: RequestManager, sender: PayloadSender, receiver: PayloadReceiver) {
        this.requestHandler = requestHandler;
        this.requestManager = requestManager;
        this.payloadSender = sender;
        this.payloadReceiver = receiver;
        this.sendOperations = new SendOperations(this.payloadSender);
        this.streamManager = new StreamManager(this.onCancelStream);
        this.assemblerManager = new PayloadAssemblerManager(this.streamManager, (id: string, response: ReceiveResponse): Promise<void> => this.onReceiveResponse(id, response), (id: string, request: ReceiveRequest): Promise<void> => this.onReceiveRequest(id, request));
        this.payloadReceiver.subscribe((header: IHeader): SubscribableStream => this.assemblerManager.getPayloadStream(header), (header: IHeader, contentStream: SubscribableStream, contentLength: number): void => this.assemblerManager.onReceive(header, contentStream, contentLength));
    }

    /// <summary>
    /// Sends a request over the attached request manager.
    /// </summary>
    /// <param name="request">The outgoing request to send.</param>
    /// <param name="cancellationToken">Optional cancellation token.</param>
    public async sendRequest(request: StreamingRequest): Promise<ReceiveResponse> {
        let requestId: string = generateGuid();
        await this.sendOperations.sendRequest(requestId, request);

        return this.requestManager.getResponse(requestId);
    }

    private async onReceiveRequest(id: string, request: ReceiveRequest): Promise<void> {
        if (this.requestHandler !== undefined) {
            let response = await this.requestHandler.processRequest(request);

            if (response !== undefined) {
                await this.sendOperations.sendResponse(id, response);
            }
        }
    }

    private async onReceiveResponse(id: string, response: ReceiveResponse): Promise<void> {
        await this.requestManager.signalResponse(id, response);
    }

    private onCancelStream(contentStreamAssembler: PayloadAssembler): void {
        this.sendOperations.sendCancelStream(contentStreamAssembler.id)
            .catch();
    }
}
