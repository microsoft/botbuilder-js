/**
 * @module botframework-streaming
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { TransportDisconnectedEventHandler } from '.';
import { PayloadTypes } from '../payloads/payloadTypes';
import { HeaderSerializer } from '../payloads/headerSerializer';
import { SubscribableStream } from '../subscribableStream';
import { PayloadConstants } from '../payloads/payloadConstants';
import { TransportDisconnectedEvent } from './transportDisconnectedEvent';
import { IHeader, INodeBuffer, ITransportReceiver } from '../interfaces';

/**
 * Payload receiver for streaming.
 */
export class PayloadReceiver {
    disconnected?: TransportDisconnectedEventHandler;

    private _receiver: ITransportReceiver;
    private _receiveHeaderBuffer: INodeBuffer;
    private _receivePayloadBuffer: INodeBuffer;

    private _getStream: (header: IHeader) => SubscribableStream;
    private _receiveAction: (header: IHeader, stream: SubscribableStream, length: number) => void;

    /**
     * Get current connected state
     *
     * @returns true if connected to a transport sender.
     */
    get isConnected(): boolean {
        return this._receiver != null;
    }

    /**
     * Connects to a transport receiver
     *
     * @param receiver The [ITransportReceiver](xref:botframework-streaming.ITransportReceiver) object to pull incoming data from.
     * @returns a promise that resolves when the receiver is complete
     */
    connect(receiver: ITransportReceiver): Promise<void> {
        this._receiver = receiver;
        return this.receivePackets();
    }

    /**
     * Allows subscribing to this receiver in order to be notified when new data comes in.
     *
     * @param getStream Callback when a new stream has been received.
     * @param receiveAction Callback when a new message has been received.
     */
    subscribe(
        getStream: (header: IHeader) => SubscribableStream,
        receiveAction: (header: IHeader, stream: SubscribableStream, count: number) => void
    ): void {
        this._getStream = getStream;
        this._receiveAction = receiveAction;
    }

    /**
     * Force this receiver to disconnect.
     *
     * @param event Event arguments to include when broadcasting disconnection event.
     */
    disconnect(event = TransportDisconnectedEvent.Empty): void {
        if (!this.isConnected) {
            return;
        }

        try {
            this._receiver.close();
            this.disconnected?.(this, event);
        } catch (err) {
            this.disconnected?.(this, new TransportDisconnectedEvent(err.message));
        } finally {
            this._receiver = null;
        }
    }

    private async receivePackets(): Promise<void> {
        while (this.isConnected) {
            try {
                let readSoFar = 0;
                while (readSoFar < PayloadConstants.MaxHeaderLength) {
                    this._receiveHeaderBuffer = await this._receiver.receive(
                        PayloadConstants.MaxHeaderLength - readSoFar
                    );

                    if (this._receiveHeaderBuffer) {
                        readSoFar += this._receiveHeaderBuffer.length;
                    }
                }

                const header = HeaderSerializer.deserialize(this._receiveHeaderBuffer);
                const isStream = header.payloadType === PayloadTypes.stream;

                if (header.payloadLength > 0) {
                    let bytesActuallyRead = 0;

                    const contentStream = this._getStream(header);

                    while (
                        bytesActuallyRead < header.payloadLength &&
                        bytesActuallyRead < PayloadConstants.MaxPayloadLength
                    ) {
                        const count = Math.min(
                            header.payloadLength - bytesActuallyRead,
                            PayloadConstants.MaxPayloadLength
                        );
                        this._receivePayloadBuffer = await this._receiver.receive(count);
                        bytesActuallyRead += this._receivePayloadBuffer.byteLength;
                        contentStream.write(this._receivePayloadBuffer);

                        // If this is a stream we want to keep handing it up as it comes in
                        if (isStream) {
                            this._receiveAction(header, contentStream, bytesActuallyRead);
                        }
                    }

                    if (!isStream) {
                        this._receiveAction(header, contentStream, bytesActuallyRead);
                    }
                }
            } catch (err) {
                this.disconnect(new TransportDisconnectedEvent(err.message));
            }
        }
    }
}
