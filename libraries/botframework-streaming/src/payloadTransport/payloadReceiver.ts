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
import { ITransportReceiver } from '../interfaces/ITransportReceiver';
import { IHeader } from '../interfaces/IHeader';
import { INodeBuffer } from '../interfaces/INodeBuffer';

/**
 * Payload receiver for streaming.
 */
export class PayloadReceiver {
    public isConnected: boolean;
    public disconnected: TransportDisconnectedEventHandler = function(sender, events){};
    private _receiver: ITransportReceiver;
    private _receiveHeaderBuffer: INodeBuffer;
    private _receivePayloadBuffer: INodeBuffer;
    private _getStream: (header: IHeader) => SubscribableStream;
    private _receiveAction: (header: IHeader, stream: SubscribableStream, length: number) => void;

    /**
     * Connects to a transport receiver
     *
     * @param receiver The [ITransportReceiver](xref:botframework-streaming.ITransportReceiver) object to pull incoming data from.
     */
    public connect(receiver: ITransportReceiver): void {
        if (this.isConnected) {
            throw new Error('Already connected.');
        } else {
            this._receiver = receiver;
            this.isConnected = true;
            this.runReceive();
        }
    }

    /**
     * Allows subscribing to this receiver in order to be notified when new data comes in.
     *
     * @param getStream Callback when a new stream has been received.
     * @param receiveAction Callback when a new message has been received.
     */
    public subscribe(getStream: (header: IHeader) => SubscribableStream, receiveAction: (header: IHeader, stream: SubscribableStream, count: number) => void): void {
        this._getStream = getStream;
        this._receiveAction = receiveAction;
    }

    /**
     * Force this receiver to disconnect.
     *
     * @param e Event arguments to include when broadcasting disconnection event.
     */
    public disconnect(e?: TransportDisconnectedEvent): void {
        let didDisconnect;
        try {
            if (this.isConnected) {
                this._receiver.close();
                didDisconnect = true;
                this.isConnected = false;
            }
        } catch (error) {
            this.isConnected = false;
            this.disconnected(this, new TransportDisconnectedEvent(error.message));
        }
        this._receiver = null;
        this.isConnected = false;

        if (didDisconnect) {
            this.disconnected(this, e || TransportDisconnectedEvent.Empty);
        }
    }

    private runReceive(): void {
        this.receivePackets()
            .catch();
    }

    private async receivePackets(): Promise<void> {
        let isClosed;

        while (this.isConnected && !isClosed) {
            try {
                let readSoFar = 0;
                while (readSoFar < PayloadConstants.MaxHeaderLength) {
                    this._receiveHeaderBuffer = await this._receiver.receive(PayloadConstants.MaxHeaderLength - readSoFar);

                    if (this._receiveHeaderBuffer) {
                        readSoFar += this._receiveHeaderBuffer.length;
                    }
                }

                let header = HeaderSerializer.deserialize(this._receiveHeaderBuffer);
                let isStream = header.payloadType === PayloadTypes.stream;

                if (header.payloadLength > 0) {
                    let bytesActuallyRead = 0;

                    let contentStream = this._getStream(header);

                    while (bytesActuallyRead < header.payloadLength && bytesActuallyRead < PayloadConstants.MaxPayloadLength) {
                        let count = Math.min(header.payloadLength - bytesActuallyRead, PayloadConstants.MaxPayloadLength);
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
            } catch (error) {
                isClosed = true;
                this.disconnect(new TransportDisconnectedEvent(error.message));
            }
        }
    }
}
