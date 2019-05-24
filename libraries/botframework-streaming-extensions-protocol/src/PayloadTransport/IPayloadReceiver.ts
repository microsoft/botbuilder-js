import { Header } from '../Payloads/Models/Header';
import { Stream } from '../Stream';
import { ITransportReceiver } from '../Transport/ITransportReceiver';

export interface IPayloadReceiver {
  isConnected: boolean;

  // tslint:disable-next-line: prefer-method-signature
  disconnected: (sender: object, args: any) => void;

  connect(receiver: ITransportReceiver);

  subscribe(getStream: (header: Header) => Stream, receiveAction: (header: Header, stream: Stream, count: number) => void);

  disconnect(disconnectArgs: any);
}
