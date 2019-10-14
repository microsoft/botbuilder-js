/**
 * @module botframework-streaming
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { HeaderSerializer } from '../Payloads/HeaderSerializer';
import { SubscribableStream } from '../SubscribableStream';
import { PayloadConstants } from '../Payloads/PayloadConstants';
import { TransportDisconnectedEventArgs } from './TransportDisconnectedEventArgs';
import { TransportDisconnectedEventHandler } from './TransportDisconnectedEventHandler';
import { ITransportSender } from '../Interfaces/ITransportSender';
import { IHeader } from '../Interfaces/IHeader';
import { ISendPacket } from '../Interfaces/ISendPacket';

export class PayloadSender {
    public disconnected?: TransportDisconnectedEventHandler;
    private sender: ITransportSender;

    /// <summary>
    /// Returns true if connected to a transport sender.
    /// </summary>
    public get isConnected(): boolean {
        return !!this.sender;
    }

    /// <summary>
    /// Connects to the given transport sender.
    /// </summary>
    /// <param name="sender">The transport sender to connect this payload sender to.</param>
    public connect(sender: ITransportSender): void {
        this.sender = sender;
    }

    /// <summary>
    /// Sends a payload out over the connected transport sender.
    /// </summary>
    /// <param name="header">The header to attach to the outgoing payload.</param>
    /// <param name="payload">The stream of buffered data to send.</param>
    /// <param name="sentCalback">The function to execute when the send has completed.</param>
    public sendPayload(header: IHeader, payload?: SubscribableStream, sentCallback?: () => Promise<void>): void {
        var packet: ISendPacket = {header, payload, sentCallback};
        this.writePacket(packet);
    }

    /// <summary>
    /// Disconnects this payload sender.
    /// </summary>
    /// <param name="e">The disconnected event arguments to include in the disconnected event broadcast.</param>
    public disconnect(e?: TransportDisconnectedEventArgs): void {
        if (this.isConnected) {
            this.sender.close();
            this.sender = null;

            if (this.disconnected) {
                this.disconnected(this, e || TransportDisconnectedEventArgs.Empty);
            }
        }
    }

    private writePacket(packet: ISendPacket): void {
        try {
            let sendHeaderBuffer: Buffer = Buffer.alloc(PayloadConstants.MaxHeaderLength);
            HeaderSerializer.serialize(packet.header, sendHeaderBuffer);
            this.sender.send(sendHeaderBuffer);

            if (packet.header.payloadLength > 0 && packet.payload) {
                let count = packet.header.payloadLength;
                while (count > 0) {
                    let chunk = packet.payload.read(count);
                    this.sender.send(chunk);
                    count -= chunk.length;
                }

                if (packet.sentCallback) {
                    packet.sentCallback();
                }
            }
        } catch (e) {
            this.disconnect(new TransportDisconnectedEventArgs(e.message));
        }
    }
}
