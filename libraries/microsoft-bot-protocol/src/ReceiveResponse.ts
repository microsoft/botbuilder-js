import { ContentStream } from './ContentStream';

export class ReceiveResponse {
  public StatusCode: number;
  public Streams: ContentStream[];

  constructor() {
    this.Streams = [];
  }
}
