/**
 * @module botframework-streaming-extensions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { ContentStream } from '../ContentStream';
import { Header } from '../Models/Header';
import { ResponsePayload } from '../Models/ResponsePayload';
import { StreamManager } from '../Payloads/StreamManager';
import { ReceiveResponse } from '../ReceiveResponse';
import { SubscribableStream } from '../SubscribableStream';
import { ContentStreamAssembler } from './ContentStreamAssembler';
import { PayloadAssembler } from './PayloadAssembler';

export class ReceiveResponseAssembler extends PayloadAssembler {
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
        this.processResponse(stream)
            .then()
            .catch();
    }

    public responsePayloadfromJson(json: string): ResponsePayload {
        return JSON.parse(json) as ResponsePayload;
    }

    public close(): void {
        throw new Error('Method not implemented.');
    }

    private stripBOM(input: string): string {
        return (input.charCodeAt(0) === 0xFEFF) ? input.slice(1) : input;
    }

    private async processResponse(stream: SubscribableStream): Promise<void> {
        let streamData: Buffer = stream.read(stream.length) as Buffer;
        if (!streamData) {
            return;
        }
        let streamDataAsString = streamData.toString('utf8');
        let responsePayload: ResponsePayload = this.responsePayloadfromJson(this.stripBOM(streamDataAsString));
        let receiveResponse: ReceiveResponse = new ReceiveResponse();
        receiveResponse.StatusCode = responsePayload.statusCode;

        if (responsePayload.streams) {
            responsePayload.streams.forEach( (responseStream): void => {
                let contentAssembler: ContentStreamAssembler = this._streamManager.getPayloadAssembler(responseStream.id);
                contentAssembler.contentType = responseStream.contentType;
                contentAssembler.contentLength = responseStream.length;
                receiveResponse.Streams.push(new ContentStream(responseStream.id, contentAssembler));
            });
        }

        await this._onCompleted(this.id, receiveResponse);
    }
}
