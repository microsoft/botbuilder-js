/**
 * @module botframework-streaming
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { HeaderSerializer } from '../payloads/headerSerializer';
import { IHeader, ISendPacket, ITransportSender } from '../interfaces';
import { PayloadConstants } from '../payloads/payloadConstants';
import { SubscribableStream } from '../subscribableStream';
import { TransportDisconnectedEvent } from './transportDisconnectedEvent';
import { TransportDisconnectedEventHandler } from './transportDisconnectedEventHandler';

/**
 * Streaming payload sender.
 */
export class PayloadSender {
    disconnected?: TransportDisconnectedEventHandler;

    private _sender: ITransportSender;

    /**
     * Get current connected state
     *
     * @returns true if connected to a transport sender.
     */
    get isConnected(): boolean {
        return this._sender != null;
    }

    /**
     * Connects to the given transport sender.
     *
     * @param sender The transport sender to connect this payload sender to.
     */
    connect(sender: ITransportSender): void {
        this._sender = sender;
    }

    /**
     * Sends a payload out over the connected transport sender.
     *
     * @param header The header to attach to the outgoing payload.
     * @param payload The stream of buffered data to send.
     * @param sentCallback The function to execute when the send has completed.
     */
    sendPayload(header: IHeader, payload?: SubscribableStream, sentCallback?: () => Promise<void>): void {
        const packet: ISendPacket = { header, payload, sentCallback };
        this.writePacket(packet);
    }

    /**
     * Disconnects this payload sender.
     *
     * @param event The disconnected event arguments to include in the disconnected event broadcast.
     */
    disconnect(event = TransportDisconnectedEvent.Empty): void {
        if (!this.isConnected) {
            return;
        }

        try {
            this._sender.close();
            this.disconnected?.(this, event);
        } catch (err) {
            this.disconnected?.(this, new TransportDisconnectedEvent(err.message));
        } finally {
            this._sender = null;
        }
    }

    private writePacket(packet: ISendPacket): void {
        try {
            if (packet.header.payloadLength > 0 && packet.payload) {
                let leftOver = packet.header.payloadLength;

                while (leftOver > 0) {
                    const count =
                        leftOver <= PayloadConstants.MaxPayloadLength ? leftOver : PayloadConstants.MaxPayloadLength;
                    const chunk = packet.payload.read(count);
                    const header = packet.header;
                    header.payloadLength = count;
                    header.end = leftOver <= PayloadConstants.MaxPayloadLength;

                    const sendHeaderBuffer: Buffer = Buffer.alloc(PayloadConstants.MaxHeaderLength);

                    HeaderSerializer.serialize(header, sendHeaderBuffer);

                    this._sender.send(sendHeaderBuffer);

                    this._sender.send(chunk);
                    leftOver -= chunk.length;
                }

                if (packet.sentCallback) {
                    packet.sentCallback();
                }
            }
        } catch (err) {
            this.disconnect(new TransportDisconnectedEvent(err.message));
        }
    }
}
