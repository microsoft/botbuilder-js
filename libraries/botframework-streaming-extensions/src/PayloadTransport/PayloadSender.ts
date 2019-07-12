/**
 * @module botframework-streaming-extensions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Header } from '../Models/Header';
import { HeaderSerializer } from '../Payloads/HeaderSerializer';
import { Stream } from '../Stream';
import { ITransportSender } from '../Transport/ITransportSender';
import { TransportConstants } from '../Transport/TransportConstants';
import { SendPacket } from './SendPacket';
import { TransportDisconnectedEventArgs } from './TransportDisconnectedEventArgs';
import { TransportDisconnectedEventHandler } from './TransportDisconnectedEventHandler';

export class PayloadSender {
  public disconnected?: TransportDisconnectedEventHandler;
  private sender: ITransportSender;
  private readonly sendHeaderBuffer: Buffer = Buffer.alloc(TransportConstants.MaxHeaderLength);

  /// <summary>
  /// Returns true if connected to a transport sender.
  /// </summary>
  public get isConnected(): boolean {
    return this.sender !== undefined;
  }

  /// <summary>
  /// Connects to the given transport sender.
  /// </summary>
  /// <param name="sender">The transport sender to connect this payload sender to.</param>
  public connect(sender: ITransportSender) {
    this.sender = sender;
  }

  /// <summary>
  /// Sends a payload out over the connected transport sender.
  /// </summary>
  /// <param name="header">The header to attach to the outgoing payload.</param>
  /// <param name="payload">The stream of buffered data to send.</param>
  /// <param name="sentCalback">The function to execute when the send has completed.</param>
  public sendPayload(header: Header, payload: Stream, sentCallback: () => Promise<void>): void {
    this.writePacket(new SendPacket(header, payload, sentCallback));
  }

  /// <summary>
  /// Disconnects this payload sender.
  /// </summary>
  /// <param name="e">The disconnected event arguments to include in the disconnected event broadcast.</param>
  public disconnect(e: TransportDisconnectedEventArgs) {
    if (this.isConnected) {
      this.sender.close();
      this.sender = undefined;

      if (this.disconnected) {
        this.disconnected(this, e || TransportDisconnectedEventArgs.Empty);
      }
    }
  }

  private writePacket(packet: SendPacket): void {
    try {
      HeaderSerializer.serialize(packet.header, this.sendHeaderBuffer);
      this.sender.send(this.sendHeaderBuffer);

      if (packet.header.PayloadLength > 0 && packet.payload) {
        let count = packet.header.PayloadLength;
        while (count > 0) {
          // TODO: Min(count, a max chunk size)
          let chunk = packet.payload.read(count);
          this.sender.send(chunk);
          count -= chunk.length;
        }

        if (packet.sentCallback) {
          // tslint:disable-next-line: no-floating-promises
          packet.sentCallback();
        }
      }
    } catch (e) {
      this.disconnect(new TransportDisconnectedEventArgs(e.message));
    }
  }
}
