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
        let s: Buffer = stream.read(stream.length) as Buffer;
        if (!s) {
            return;
        }
        let ps = s.toString('utf8');
        let rp: RequestPayload = this.requestPayloadfromJson(ps);
        let rr: ReceiveRequest = new ReceiveRequest();
        rr.Path = rp.path;
        rr.Verb = rp.verb;

        if (rp.streams) {
            rp.streams.forEach( (s): void => {
                let a: ContentStreamAssembler = this._streamManager.getPayloadAssembler(s.id);
                a.contentType = s.contentType;
                a.contentLength = s.length;
                rr.Streams.push(new ContentStream(s.id, a));
            });
        }

        await this._onCompleted(this.id, rr);
    }
}
