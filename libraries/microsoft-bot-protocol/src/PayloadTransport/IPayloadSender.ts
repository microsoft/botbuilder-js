import { Header } from '../Payloads/Models/Header';
import { Stream } from '../Stream';
import { ITransportSender } from '../Transport/ITransportSender';
import { TransportDisconnectedEventHandler } from './TransportDisconnectedEventHandler';

export interface IPayloadSender {

  isConnected: boolean;

  disconnected?: TransportDisconnectedEventHandler;

  connect(sender: ITransportSender): void;

  sendPayload(header: Header, payload: Stream, sentCallback: () => Promise<void>): void;

  disconnect(disconnectArgs: any): void;
}
