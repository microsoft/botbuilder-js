import { Header } from '../Payloads/Models/Header';
import { Stream } from '../Stream';

export class SendPacket {
  public header: Header;
  public payload: Stream;
  public sentCallback: () => Promise<void>;

  constructor(header: Header, payload: Stream, sentCallback: () => Promise<void>) {
    this.header = header;
    this.payload = payload;
    this.sentCallback = sentCallback;
  }
}
