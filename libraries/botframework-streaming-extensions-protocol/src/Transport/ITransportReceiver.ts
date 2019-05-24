import { ITransport } from './ITransport';

export interface ITransportReceiver extends ITransport {
  receiveAsync(count: number): Promise<Buffer>;
}
