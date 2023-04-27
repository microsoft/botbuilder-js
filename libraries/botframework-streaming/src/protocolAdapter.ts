/**
 * @module botframework-streaming
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { PayloadAssembler } from './assemblers/payloadAssembler';
import { PayloadAssemblerManager } from './payloads/payloadAssemblerManager';
import { RequestManager } from './payloads/requestManager';
import { SendOperations } from './payloads/sendOperations';
import { StreamManager } from './payloads/streamManager';
import { PayloadReceiver } from './payloadTransport/payloadReceiver';
import { PayloadSender } from './payloadTransport/payloadSender';
import { RequestHandler } from './requestHandler';
import { SubscribableStream } from './subscribableStream';
import { StreamingRequest } from './streamingRequest';
import { generateGuid } from './utilities/protocol-base';
import { IReceiveResponse, IReceiveRequest } from './interfaces';
import { IHeader } from './interfaces/IHeader';

/**
 * Creates a protocol adapter for Streaming.
 */
export class ProtocolAdapter {
    private readonly requestHandler: RequestHandler;
    private readonly payloadSender: PayloadSender;
    private readonly payloadReceiver: PayloadReceiver;
    private readonly requestManager: RequestManager;
    private readonly sendOperations: SendOperations;
    private readonly streamManager: StreamManager;
    private readonly assemblerManager: PayloadAssemblerManager;

    /**
     * Creates a new instance of the protocol adapter class.
     *
     * @param requestHandler The [RequestHandler](xref:botframework-streaming.RequestHandler) that will process incoming requests.
     * @param requestManager The [RequestManager](xref:botframework-streaming.RequestManager) that will process outgoing requests.
     * @param sender The [PayloadSender](xref:botframework-streaming.PayloadSender) for use with outgoing requests.
     * @param receiver The [PayloadReceiver](xref:botframework-streaming.PayloadReceiver) for use with incoming requests.
     */
    constructor(
        requestHandler: RequestHandler,
        requestManager: RequestManager,
        sender: PayloadSender,
        receiver: PayloadReceiver
    ) {
        this.requestHandler = requestHandler;
        this.requestManager = requestManager;
        this.payloadSender = sender;
        this.payloadReceiver = receiver;
        this.sendOperations = new SendOperations(this.payloadSender);
        this.streamManager = new StreamManager(this.onCancelStream);
        this.assemblerManager = new PayloadAssemblerManager(
            this.streamManager,
            (id: string, response: IReceiveResponse): Promise<void> => this.onReceiveResponse(id, response),
            (id: string, request: IReceiveRequest): Promise<void> => this.onReceiveRequest(id, request)
        );
        this.payloadReceiver.subscribe(
            (header: IHeader): SubscribableStream => this.assemblerManager.getPayloadStream(header),
            (header: IHeader, contentStream: SubscribableStream, contentLength: number): void =>
                this.assemblerManager.onReceive(header, contentStream, contentLength)
        );
    }

    /**
     * Sends a request over the attached request manager.
     *
     * @param request The outgoing request to send.
     * @returns The response to the specified request.
     */
    async sendRequest(request: StreamingRequest): Promise<IReceiveResponse> {
        const requestId: string = generateGuid();

        // Register the request in the request manager before sending it to the server.
        // Otherwise, if the server respond quickly, it may miss the request.
        const getResponsePromise = this.requestManager.getResponse(requestId);

        await this.sendOperations.sendRequest(requestId, request);

        return getResponsePromise;
    }

    /**
     * Executes the receive pipeline when a request comes in.
     *
     * @param id The id the resources created for the response will be assigned.
     * @param request The incoming request to process.
     */
    async onReceiveRequest(id: string, request: IReceiveRequest): Promise<void> {
        if (this.requestHandler) {
            const response = await this.requestHandler.processRequest(request);

            if (response) {
                await this.sendOperations.sendResponse(id, response);
            }
        }
    }

    /**
     * Executes the receive pipeline when a response comes in.
     *
     * @param id The id the resources created for the response will be assigned.
     * @param response The incoming response to process.
     */
    async onReceiveResponse(id: string, response: IReceiveResponse): Promise<void> {
        await this.requestManager.signalResponse(id, response);
    }

    /**
     * Executes the receive pipeline when a cancellation comes in.
     *
     * @param contentStreamAssembler The payload assembler processing the incoming data that this cancellation request targets.
     */
    onCancelStream(contentStreamAssembler: PayloadAssembler): void {
        this.sendOperations.sendCancelStream(contentStreamAssembler.id).catch();
    }
}
