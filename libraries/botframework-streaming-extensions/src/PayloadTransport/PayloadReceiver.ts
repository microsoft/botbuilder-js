/**
 * @module botframework-streaming-extensions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { TransportDisconnectedEventHandler } from '.';
import { IHeader } from '../Models/Header';
import { PayloadTypes } from '../Models/PayloadTypes';
import { HeaderSerializer } from '../Payloads/HeaderSerializer';
import { SubscribableStream } from '../SubscribableStream';
import { ITransportReceiver } from '../Transport/ITransportReceiver';
import { TransportConstants } from '../Transport/TransportConstants';
import { TransportDisconnectedEventArgs } from './TransportDisconnectedEventArgs';

export class PayloadReceiver {
    public isConnected: boolean;
    public disconnected?: TransportDisconnectedEventHandler;
    private _receiver: ITransportReceiver;
    private _receiveHeaderBuffer: Buffer;
    private _receivePayloadBuffer: Buffer;
    private _getStream: (header: IHeader) => SubscribableStream;
    private _receiveAction: (header: IHeader, stream: SubscribableStream, length: number) => void;

    /// <summary>
    /// Creates a new instance of the PayloadReceiver class.
    /// </summary>
    /// <param name="receiver">The ITransportReceiver object to pull incoming data from.</param>
    public connect(receiver: ITransportReceiver): void {
        if (this.isConnected) {
            throw new Error('Already connected.');
        } else {
            this._receiver = receiver;
            this.isConnected = true;
            this.runReceive();
        }
    }

    /// <summary>
    /// Allows subscribing to this receiver in order to be notified when new data comes in.
    /// </summary>
    /// <param name="getStream">Callback when a new stream has been received.</param>
    /// <param name="receiveAction">Callback when a new message has been received.</param>
    public subscribe(getStream: (header: IHeader) => SubscribableStream, receiveAction: (header: IHeader, stream: SubscribableStream, count: number) => void): void {
        this._getStream = getStream;
        this._receiveAction = receiveAction;
    }

    /// <summary>
    /// Force this receiver to disconnect.
    /// </summary>
    /// <param name="e">Event arguments to include when broadcasting disconnection event.</param>
    public disconnect(e: TransportDisconnectedEventArgs): void {
        let didDisconnect = false;
        try {
            if (this.isConnected) {
                this._receiver.close();
                didDisconnect = true;
                this.isConnected = false;
            }
        } catch (error) {
            this.isConnected = false;
            this.disconnected(error.message, e);
        }
        this._receiver = undefined;
        this.isConnected = false;

        if (didDisconnect) {
            this.disconnected(this, e || TransportDisconnectedEventArgs.Empty);
        }
    }

    private runReceive(): void {
        this.receivePackets()
            .catch();
    }

    private async receivePackets(): Promise<void> {
        let isClosed = false;

        while (this.isConnected && !isClosed) {
            try {
                let readSoFar = 0;
                while (readSoFar < TransportConstants.MaxHeaderLength) {
                    this._receiveHeaderBuffer = await this._receiver.receive(TransportConstants.MaxHeaderLength - readSoFar);

                    if (this._receiveHeaderBuffer) {
                        readSoFar += this._receiveHeaderBuffer.length;
                    }
                }

                let header = HeaderSerializer.deserialize(this._receiveHeaderBuffer);
                let isStream = header.PayloadType === PayloadTypes.stream;

                if (header.PayloadLength > 0) {
                    let bytesActuallyRead = 0;

                    let contentStream = this._getStream(header);

                    while (bytesActuallyRead < header.PayloadLength && bytesActuallyRead < TransportConstants.MaxPayloadLength) {
                        let count = Math.min(header.PayloadLength - bytesActuallyRead, TransportConstants.MaxPayloadLength);
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
                this.disconnect(new TransportDisconnectedEventArgs(error.message));
            }
        }
    }
}
