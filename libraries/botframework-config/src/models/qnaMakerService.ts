/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */
import { URL } from 'url';
import { IQnAService, ServiceTypes } from '../schema';
import { ConnectedService } from './connectedService';

export class QnaMakerService extends ConnectedService implements IQnAService {
    public kbId: string;
    public subscriptionKey: string;
    public hostname: string;
    public endpointKey: string;

    constructor(source: IQnAService = {} as IQnAService) {
        super(source, ServiceTypes.QnA);

        this.hostname = new URL('/qnamaker', this.hostname).href;
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
