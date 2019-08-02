/**
 * @module botframework-streaming-extensions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { ContentStream } from '../ContentStream';
import { Header } from '../Models/Header';
import { RequestPayload } from '../Models/RequestPayload';
import { StreamManager } from '../Payloads/StreamManager';
import { ReceiveRequest } from '../ReceiveRequest';
import { SubscribableStream } from '../SubscribableStream';
import { ContentStreamAssembler } from './ContentStreamAssembler';
import { PayloadAssembler } from './PayloadAssembler';

export class ReceiveRequestAssembler extends PayloadAssembler {
    private readonly _onCompleted: Function;
    private readonly _streamManager: StreamManager;

    public constructor(header: Header, streamManager: StreamManager, onCompleted: Function) {
        super(header.Id);
        this._streamManager = streamManager;
        this._onCompleted = onCompleted;
    }

    public createPayloadStream(): SubscribableStream {
        return new SubscribableStream();
    }

    public onReceive(header: Header, stream: SubscribableStream, contentLength: number): void {
        super.onReceive(header, stream, contentLength);
        this.processRequest(stream)
            .then()
            .catch();
    }

    public requestPayloadfromJson(json: string): RequestPayload {
        return JSON.parse((json.charCodeAt(0) === 0xFEFF) ? json.slice(1) : json) as RequestPayload;
    }

    public close(): void {
        throw new Error('Method not implemented.');
    }

    private async processRequest(stream: SubscribableStream): Promise<void> {
        let streamData: Buffer = stream.read(stream.length) as Buffer;
        if (!streamData) {
            return;
        }
        let streamDataAsString = streamData.toString('utf8');
        let requestPayload: RequestPayload = this.requestPayloadfromJson(streamDataAsString);
        let receiveRequest: ReceiveRequest = new ReceiveRequest();
        receiveRequest.Path = requestPayload.path;
        receiveRequest.Verb = requestPayload.verb;

        if (requestPayload.streams) {
            requestPayload.streams.forEach( (requestStream): void => {
                let contentAssembler: ContentStreamAssembler = this._streamManager.getPayloadAssembler(requestStream.id);
                contentAssembler.contentType = requestStream.contentType;
                contentAssembler.contentLength = requestStream.length;
                receiveRequest.Streams.push(new ContentStream(requestStream.id, contentAssembler));
            });
        }

        await this._onCompleted(this.id, receiveRequest);
    }
}
