/**
 * @module botframework-streaming-extensions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { HttpContent, HttpContentStream } from './HttpContentStream';
import { Stream } from './Stream';

export class StreamingRequest {
  /// <summary>
  /// Request verb, null on responses
  /// </summary>
  public Verb: string;

  /// <summary>
  /// Request path; null on responses
  /// </summary>
  public Path: string;

  /// <summary>
  /// List of associated streams
  /// </summary>
  public Streams: HttpContentStream[];

  public static create(method: string, route?: string, body?: HttpContent): StreamingRequest {
    let request = new StreamingRequest();
    request.Verb = method;
    request.Path = route;
    if (body) {
      request.setBody(body);
    }

    return request;
  }

  public addStream(content: HttpContent) {
    if (!content) {
      throw new Error('Argument Undefined Exception: content undefined.');
    }
    if (!this.Streams) {
      this.Streams = [];
    }
    this.Streams.push(new HttpContentStream(content));
  }

  public setBody(body: any): void {
    if (typeof body === 'string') {
      let stream = new Stream();
      stream.write(body, 'utf8');
      this.addStream(new HttpContent({
        contentType: 'application/json; charset=utf-8',
        contentLength: stream.length
      },
        // tslint:disable-next-line: align
        stream));
    } else {
      if (typeof body === 'object') {
        this.addStream(body);
      }
    }
  }
}
