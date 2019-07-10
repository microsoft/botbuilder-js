/**
 * @module botframework-streaming-extensions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Header } from '../Models/Header';
import { Stream } from '../Stream';
import { ITransportSender } from '../Transport/ITransportSender';
import { TransportDisconnectedEventHandler } from './TransportDisconnectedEventHandler';

/// <summary>
/// Interface implemented by PayloadSender classes.
/// </summary>
export interface IPayloadSender {

  isConnected: boolean;

  disconnected?: TransportDisconnectedEventHandler;

  connect(sender: ITransportSender): void;

  sendPayload(header: Header, payload: Stream, sentCallback: () => Promise<void>): void;

  disconnect(disconnectArgs: any): void;
}
