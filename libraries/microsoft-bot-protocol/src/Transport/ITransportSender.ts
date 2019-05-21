import { ITransport } from './ITransport';

export interface ITransportSender extends ITransport {
  send(buffer: Buffer): number;
}
