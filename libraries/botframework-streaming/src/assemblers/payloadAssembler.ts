/**
 * @module botframework-streaming
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { SubscribableStream } from '../subscribableStream';
import { StreamManager, PayloadTypes } from '../payloads';
import { ContentStream } from '../contentStream';
import { IAssemblerParams } from '../interfaces/IAssemblerParams';
import { IHeader } from '../interfaces/IHeader';
import { IResponsePayload } from '../interfaces/IResponsePayload';
import { IReceiveResponse, IReceiveRequest } from '../interfaces';
import { IRequestPayload } from '../interfaces/IRequestPayload';

/**
 * Assembles payloads for streaming library.
 */
export class PayloadAssembler {
    public id: string;
    public end: boolean;
    public contentLength: number;
    public payloadType: string;
    private stream: SubscribableStream;
    private readonly _onCompleted: Function;
    private readonly _streamManager: StreamManager;
    private readonly _byteOrderMark = 0xFEFF;
    private readonly _utf: string = 'utf8';

    /**
     * Initializes a new instance of the `PayloadAssembler` class.
     * @param streamManager The `StreamManager` managing the stream being assembled.
     * @param params Parameters for a streaming assembler.
     */
    public constructor(streamManager: StreamManager, params: IAssemblerParams) {
        if(params.header){
            this.id = params.header.id;
            this.payloadType = params.header.payloadType;
            this.contentLength = params.header.payloadLength;
            this.end = params.header.end;
        } else {
            this.id = params.id;
        }

        if(!this.id){
            throw Error('An ID must be supplied when creating an assembler.');
        }

        this._streamManager = streamManager;
        this._onCompleted = params.onCompleted;
    }

    /**
     * Retrieves the assembler's payload as a stream.
     * @returns >A `SubscribableStream` of the assembler's payload.
     */
    public getPayloadStream(): SubscribableStream {
        if (!this.stream) {
            this.stream = this.createPayloadStream();
        }

        return this.stream;
    }

    /**
     * The action the assembler executes when new bytes are received on the incoming stream.
     * @param header The stream's Header.
     * @param stream The incoming stream being assembled.
     * @param contentLength The length of the stream, if finite.
     */
    public onReceive(header: IHeader, stream: SubscribableStream, contentLength: number): void {
        this.end = header.end;

        if (header.payloadType === PayloadTypes.response || header.payloadType === PayloadTypes.request) {
            this.process(stream)
                .then()
                .catch();
        } else if (header.end) {
            stream.end();
        }
    }

    /**
     * Closes the assembler.
     */
    public close(): void {
        this._streamManager.closeStream(this.id);
    }

    /**
     * Creates a new `SubscribableStream` instance.
     * @returns The new stream ready for consumption.
     */
    private createPayloadStream(): SubscribableStream {
        return new SubscribableStream();
    }

    /**
     * @private
     */
    private payloadFromJson<T>(json: string): T {
        return JSON.parse((json.charCodeAt(0) === this._byteOrderMark) ? json.slice(1) : json) as T;
    }

    /**
     * @private
     */
    private stripBOM(input: string): string {
        return (input.charCodeAt(0) === this._byteOrderMark) ? input.slice(1) : input;
    }

    /**
     * @private
     */
    private async process(stream: SubscribableStream): Promise<void> {
        let streamData: Buffer = stream.read(stream.length) as Buffer;
        if (!streamData) {
            return;
        }

        let streamDataAsString = streamData.toString(this._utf);

        if(this.payloadType === PayloadTypes.request){
            await this.processRequest(streamDataAsString);
        } else if(this.payloadType === PayloadTypes.response){
            await this.processResponse(streamDataAsString);
        }
    }

    /**
     * @private
     */
    private async processResponse(streamDataAsString: string): Promise<void> {

        let responsePayload: IResponsePayload = this.payloadFromJson(this.stripBOM(streamDataAsString));
        let receiveResponse: IReceiveResponse = { streams: [], statusCode: responsePayload.statusCode };

        await this.processStreams(responsePayload, receiveResponse);
    }

    /**
     * @private
     */
    private async processRequest(streamDataAsString: string): Promise<void> {

        let requestPayload: IRequestPayload = this.payloadFromJson(streamDataAsString);
        let receiveRequest: IReceiveRequest = { streams: [], path: requestPayload.path, verb: requestPayload.verb };

        await this.processStreams(requestPayload, receiveRequest);
    }

    /**
     * @private
     */
    private async processStreams(responsePayload: any, receiveResponse: any) {
        if (responsePayload.streams) {
            responsePayload.streams.forEach((responseStream): void => {
                let contentAssembler: PayloadAssembler = this._streamManager.getPayloadAssembler(responseStream.id);
                contentAssembler.payloadType = responseStream.contentType;
                contentAssembler.contentLength = responseStream.length;
                receiveResponse.streams.push(new ContentStream(responseStream.id, contentAssembler));
            });
        }
        await this._onCompleted(this.id, receiveResponse);
    }
}
