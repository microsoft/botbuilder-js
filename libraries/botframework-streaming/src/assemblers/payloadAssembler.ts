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
import {
    IAssemblerParams,
    IHeader,
    IResponsePayload,
    IReceiveResponse,
    IReceiveRequest,
    IRequestPayload,
} from '../interfaces';

/**
 * Assembles payloads for streaming library.
 *
 * @internal
 */
export class PayloadAssembler {
    id: string;
    end: boolean;
    contentLength: number;
    payloadType: string | PayloadTypes;
    private stream: SubscribableStream;
    private readonly _onCompleted: (id: string, receiveResponse: IReceiveResponse | IReceiveRequest) => Promise<void>;
    private readonly _byteOrderMark = 0xfeff;
    private readonly _utf: BufferEncoding = 'utf8';

    /**
     * Initializes a new instance of the [PayloadAssembler](xref:botframework-streaming.PayloadAssembler) class.
     *
     * @param streamManager The [StreamManager](xref:botframework-streaming.StreamManager) managing the stream being assembled.
     * @param params Parameters for a streaming assembler.
     */
    constructor(private readonly streamManager: StreamManager, params: IAssemblerParams) {
        if (params.header) {
            this.id = params.header.id;
            this.payloadType = params.header.payloadType;
            this.contentLength = params.header.payloadLength;
            this.end = params.header.end;
        } else {
            this.id = params.id;
        }

        if (!this.id) {
            throw Error('An ID must be supplied when creating an assembler.');
        }

        this._onCompleted = params.onCompleted;
    }

    /**
     * Retrieves the assembler's payload as a stream.
     *
     * @returns A [SubscribableStream](xref:botframework-streaming.SubscribableStream) of the assembler's payload.
     */
    getPayloadStream(): SubscribableStream {
        if (!this.stream) {
            this.stream = this.createPayloadStream();
        }

        return this.stream;
    }

    /**
     * The action the assembler executes when new bytes are received on the incoming stream.
     *
     * @param header The stream's Header.
     * @param stream The incoming stream being assembled.
     * @param _contentLength The length of the stream, if finite.
     */
    onReceive(header: IHeader, stream: SubscribableStream, _contentLength: number): void {
        this.end = header.end;

        if (header.payloadType === PayloadTypes.response || header.payloadType === PayloadTypes.request) {
            this.process(stream).then().catch();
        } else if (header.end) {
            stream.end();
        }
    }

    /**
     * Closes the assembler.
     */
    close(): void {
        this.streamManager.closeStream(this.id);
    }

    /**
     * Creates a new [SubscribableStream](xref:botframework-streaming.SubscribableStream) instance.
     *
     * @returns The new stream ready for consumption.
     */
    private createPayloadStream(): SubscribableStream {
        return new SubscribableStream();
    }

    private payloadFromJson<T>(json: string): T {
        return JSON.parse(json.charCodeAt(0) === this._byteOrderMark ? json.slice(1) : json) as T;
    }

    private stripBOM(input: string): string {
        return input.charCodeAt(0) === this._byteOrderMark ? input.slice(1) : input;
    }

    private async process(stream: SubscribableStream): Promise<void> {
        const streamData: Buffer = stream.read(stream.length) as Buffer;
        if (!streamData) {
            return;
        }

        const streamDataAsString = streamData.toString(this._utf);

        if (this.payloadType === PayloadTypes.request) {
            await this.processRequest(streamDataAsString);
        } else if (this.payloadType === PayloadTypes.response) {
            await this.processResponse(streamDataAsString);
        }
    }

    private async processResponse(streamDataAsString: string): Promise<void> {
        const responsePayload = this.payloadFromJson<IResponsePayload>(this.stripBOM(streamDataAsString));
        const receiveResponse: IReceiveResponse = { streams: [], statusCode: responsePayload.statusCode };

        await this.processStreams(responsePayload, receiveResponse);
    }

    private async processRequest(streamDataAsString: string): Promise<void> {
        const requestPayload = this.payloadFromJson<IRequestPayload>(streamDataAsString);
        const receiveRequest: IReceiveRequest = { streams: [], path: requestPayload.path, verb: requestPayload.verb };

        await this.processStreams(requestPayload, receiveRequest);
    }

    private async processStreams(
        responsePayload: IResponsePayload | IRequestPayload,
        receiveResponse: IReceiveResponse | IReceiveRequest
    ): Promise<void> {
        responsePayload.streams?.forEach((responseStream) => {
            // There was a bug in how streams were handled. In .NET, the StreamDescription definiton mapped the
            // "type" JSON property to `contentType`, but in Typescript there was no mapping. This is a workaround
            // to resolve this inconsistency.
            //
            // .NET code:
            // https://github.com/microsoft/botbuilder-dotnet/blob/a79036ddf6625ec3fd68a6f7295886eb7831bc1c/libraries/Microsoft.Bot.Streaming/Payloads/Models/StreamDescription.cs#L28-L29
            const contentType =
                ((responseStream as unknown) as Record<string, string>).type ?? responseStream.contentType;

            const contentAssembler = this.streamManager.getPayloadAssembler(responseStream.id);

            contentAssembler.payloadType = contentType;
            contentAssembler.contentLength = responseStream.length;

            receiveResponse.streams.push(new ContentStream(responseStream.id, contentAssembler));
        });

        await this._onCompleted(this.id, receiveResponse);
    }
}
