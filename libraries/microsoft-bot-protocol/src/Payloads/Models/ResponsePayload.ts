import { StreamDescription } from './StreamDescription';

export class ResponsePayload {
  public statusCode: number;
  public streams: StreamDescription[];

  constructor(statusCode: number) {
    this.statusCode = statusCode;
  }
}
