import { Stream } from '../../Stream';

export class StreamWrapper {
  public stream: Stream;
  public streamLength?: number;

  constructor(stream: Stream, streamLength?: number) {
    this.stream = stream;
    this.streamLength = streamLength;
  }
}
