/**
 * @module botframework-config
 */
/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */
import { URL } from 'url';
import { IQnAService, ServiceTypes } from '../schema';
import { ConnectedService } from './connectedService';

/**
 * Defines a QnA Maker service connection.
 */
export class QnaMakerService extends ConnectedService implements IQnAService {
    /**
     * Knowledge base id.
     */
    public kbId: string;

    /**
     * Subscription key for calling admin api.
     */
    public subscriptionKey: string;

    /**
     * hostname for private service endpoint Example: https://myqna.azurewebsites.net.
     */
    public hostname: string;

    /**
     * Endpoint Key for querying the kb.
     */
    public endpointKey: string;

    /**
     * Creates a new QnaMakerService instance.
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

    // encrypt keys in service
    public encrypt(secret: string, encryptString: (value: string, secret: string) => string): void {
        if (this.endpointKey && this.endpointKey.length > 0) {
            this.endpointKey = encryptString(this.endpointKey, secret);
        }

        if (this.subscriptionKey && this.subscriptionKey.length > 0) {
            this.subscriptionKey = encryptString(this.subscriptionKey, secret);
        }
    }

    // decrypt keys in service
    public decrypt(secret: string, decryptString: (value: string, secret: string) => string): void {
        if (this.endpointKey && this.endpointKey.length > 0) {
            this.endpointKey = decryptString(this.endpointKey, secret);
        }

        if (this.subscriptionKey && this.subscriptionKey.length > 0) {
            this.subscriptionKey = decryptString(this.subscriptionKey, secret);
        }
    }

}
