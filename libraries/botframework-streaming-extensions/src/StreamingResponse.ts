/**
 * @module botframework-streaming-extensions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { HttpContent, HttpContentStream } from './HttpContentStream';
import { Stream } from './Stream';

export class StreamingResponse {
  public statusCode: number;
  public streams: HttpContentStream[];

  public static create(statusCode: number, body?: HttpContent): StreamingResponse {
    let response = new StreamingResponse();
    response.statusCode = statusCode;
    if (body) {
      response.addStream(body);
    }

    return response;
  }

  public addStream(content: HttpContent) {
    if (!this.streams) {
      this.streams = [];
    }
    this.streams.push(new HttpContentStream(content));
  }

  public setBody(body: any): void {
    let stream = new Stream();
    stream.write(JSON.stringify(body), 'utf8');
    this.addStream(new HttpContent({
      contentType: 'application/json; charset=utf-8',
      contentLength: stream.length
      // tslint:disable-next-line: align
    }, stream));
  }
}
