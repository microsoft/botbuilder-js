import { HttpContent, HttpContentStream } from './HttpContentStream';
import { Stream } from './Stream';

export class Response {
  public statusCode: number;
  public streams: HttpContentStream[];

  public static create(statusCode: number, body?: HttpContent): Response {
    let response = new Response();
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
