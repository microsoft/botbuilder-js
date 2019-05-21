import { HttpContent, HttpContentStream } from './HttpContentStream';
import { Stream } from './Stream';

export class Request {
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

  public static create(method: string, route?: string, body?: HttpContent): Request {
    let request = new Request();
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
    let stream = new Stream();
    stream.write(body, 'utf8');
    this.addStream(new HttpContent({
      contentType: 'application/json; charset=utf-8',
      contentLength: stream.length
    },
      // tslint:disable-next-line: align
      stream));
  }
}
