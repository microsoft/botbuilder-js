import { StreamDescription } from './StreamDescription';

export class RequestPayload {
  public verb: string;
  public path: string;
  public streams: StreamDescription[];

  constructor(verb: string, path: string) {
    this.verb = verb;
    this.path = path;
  }
}
