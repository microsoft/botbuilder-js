/**
 * @module botframework-streaming-extensions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { TransportDisconnectedEventHandler } from '..';
import { Header } from '../Payloads/Models/Header';
import { Stream } from '../Stream';
import { ITransportReceiver } from '../Transport/ITransportReceiver';

export interface IPayloadReceiver {
  isConnected: boolean;

  disconnected?: TransportDisconnectedEventHandler;

  connect(receiver: ITransportReceiver);

  subscribe(getStream: (header: Header) => Stream, receiveAction: (header: Header, stream: Stream, count: number) => void);

  disconnect(disconnectArgs: any);
}
