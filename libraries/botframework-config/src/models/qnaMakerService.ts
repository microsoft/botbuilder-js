/**
 * @module botframework-config
 *
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */
import { URL } from 'url';
import { IQnAService, ServiceTypes } from '../schema';
import { ConnectedService } from './connectedService';

/**
 * Defines a QnA Maker service connection.
 *
 * @deprecated See https://aka.ms/bot-file-basics for more information.
 */
export class QnaMakerService extends ConnectedService implements IQnAService {
    /**
     * Knowledge base id.
     */
    kbId: string;

    /**
     * Subscription key for calling admin api.
     */
    subscriptionKey: string;

    /**
     * hostname for private service endpoint Example: https://myqna.azurewebsites.net.
     */
    hostname: string;

    /**
     * Endpoint Key for querying the kb.
     */
    endpointKey: string;

    /**
     * Creates a new QnaMakerService instance.
     *
     * @param source (Optional) JSON based service definition.
     */
    constructor(source: IQnAService = {} as IQnAService) {
        super(source, ServiceTypes.QnA);

        if (!source.hostname) {
            throw TypeError('QnAMakerService requires source parameter to have a hostname.');
        }

        if (!this.hostname.endsWith('/qnamaker')) {
            this.hostname = new URL('/qnamaker', this.hostname).href;
        }
    }

    /**
     * Encrypt properties on this service.
     *
     * @param secret Secret to use to encrypt.
     * @param encryptString Function called to encrypt an individual value.
     */
    encrypt(secret: string, encryptString: (value: string, secret: string) => string): void {
        if (this.endpointKey && this.endpointKey.length > 0) {
            this.endpointKey = encryptString(this.endpointKey, secret);
        }

        if (this.subscriptionKey && this.subscriptionKey.length > 0) {
            this.subscriptionKey = encryptString(this.subscriptionKey, secret);
        }
    }

    /**
     * Decrypt properties on this service.
     *
     * @param secret Secret to use to decrypt.
     * @param decryptString Function called to decrypt an individual value.
     */
    decrypt(secret: string, decryptString: (value: string, secret: string) => string): void {
        if (this.endpointKey && this.endpointKey.length > 0) {
            this.endpointKey = decryptString(this.endpointKey, secret);
        }

        if (this.subscriptionKey && this.subscriptionKey.length > 0) {
            this.subscriptionKey = decryptString(this.subscriptionKey, secret);
        }
    }
}
