/**
 * @module botframework-streaming-extensions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { IHeader } from '../Models/Header';
import { SubscribableStream } from '../SubscribableStream';
import { StreamManager } from '../Payloads';
import { ContentStream } from '../ContentStream';
import { IResponsePayload, IRequestPayload, PayloadTypes } from '../Models';
import { ReceiveResponse, ReceiveRequest } from '..';

export interface IAssemblerParams {
    header?: IHeader;
    id?: string;
    onCompleted?: Function;
}

export class PayloadAssembler {
    public id: string;
    public end: boolean;
    public contentLength: number;
    public contentType: string;
    private payloadType: string;
    private stream: SubscribableStream;
    private readonly _onCompleted: Function;
    private readonly _streamManager: StreamManager;

    public constructor(streamManager: StreamManager, params: IAssemblerParams) {
        if(params.header !== undefined){
            this.id = params.header.Id;
            this.payloadType = params.header.PayloadType;
        } else {
            this.id = params.id;
        }

        if(this.id === undefined){
            throw Error('An ID must be supplied when creating an assembler.');
        }
        
        this._streamManager = streamManager;
        this._onCompleted = params.onCompleted;
    }

    public getPayloadStream(): SubscribableStream {
        if (!this.stream) {
            this.stream = this.createPayloadStream();
        }

        return this.stream;
    }

    public onReceive(header: IHeader, stream: SubscribableStream, contentLength: number): void {
        this.end = header.End;
        
        if (header.PayloadType === PayloadTypes.response || header.PayloadType === PayloadTypes.request) {
        this.process(stream)
            .then()
            .catch();
        } else {
            if (header.End) {
                stream.end();
            }
        }
    }

    public close(): void {
        this._streamManager.closeStream(this.id);
    }

    private createPayloadStream(): SubscribableStream {
        return new SubscribableStream();
    }

    private payloadFromJson<T>(json: string): T {
        return JSON.parse((json.charCodeAt(0) === 0xFEFF) ? json.slice(1) : json) as T;
    }

    private stripBOM(input: string): string {
        return (input.charCodeAt(0) === 0xFEFF) ? input.slice(1) : input;
    }

    private async process(stream: SubscribableStream): Promise<void> {
        let streamData: Buffer = stream.read(stream.length) as Buffer;
        if (!streamData) {
            return;
        }

        let streamDataAsString = streamData.toString('utf8');

        if(this.payloadType === PayloadTypes.request){
            await this.processRequest(streamDataAsString);
        } else {
            if(this.payloadType === PayloadTypes.response){
                await this.processResponse(streamDataAsString);
            }
        }
    }

    private async processResponse(streamDataAsString: string): Promise<void> {

        let responsePayload: IResponsePayload = this.payloadFromJson(this.stripBOM(streamDataAsString));
        let receiveResponse: ReceiveResponse = new ReceiveResponse();
        receiveResponse.StatusCode = responsePayload.statusCode;

        await this.processStreams(responsePayload, receiveResponse);
    }

    private async processRequest(streamDataAsString: string): Promise<void> {

        let requestPayload: IRequestPayload = this.payloadFromJson(streamDataAsString);
        let receiveRequest: ReceiveRequest = new ReceiveRequest();
        receiveRequest.Path = requestPayload.path;
        receiveRequest.Verb = requestPayload.verb;

        await this.processStreams(requestPayload, receiveRequest);
    }

    private async processStreams(responsePayload: any, receiveResponse: any) {
        if (responsePayload.streams) {
            responsePayload.streams.forEach((responseStream): void => {
                let contentAssembler: PayloadAssembler = this._streamManager.getPayloadAssembler(responseStream.id);
                contentAssembler.contentType = responseStream.contentType;
                contentAssembler.contentLength = responseStream.length;
                receiveResponse.Streams.push(new ContentStream(responseStream.id, contentAssembler));
            });
        }
        await this._onCompleted(this.id, receiveResponse);
    }    
}
