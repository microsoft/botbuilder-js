/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */
import * as url from 'url';
import { decryptString, encryptString } from '../encrypt';
import { IQnAService, ServiceTypes } from '../schema';
import { ConnectedService } from './connectedService';

export class QnaMakerService extends ConnectedService implements IQnAService {
    public readonly type = ServiceTypes.QnA;
    public kbId = '';
    public subscriptionKey = '';
    public hostname = '';
    public endpointKey = '';

    constructor(source: IQnAService = {} as IQnAService) {
        super(source);
        let { id = '', name = '', kbId = '', subscriptionKey = '', endpointKey = '', hostname = '' } = source;
        this.id = kbId;
        if (hostname) {
            hostname = url.resolve(hostname, '/qnamaker');
        }
        Object.assign(this, { id, name, kbId, subscriptionKey, endpointKey, hostname });
    }

    public toJSON(): IQnAService {
        const { id, name, kbId, subscriptionKey, endpointKey, hostname } = this;
        return { type: ServiceTypes.QnA, id: kbId, name, kbId, subscriptionKey, endpointKey, hostname };
    }

    // encrypt keys in service
    public encrypt(secret: string): void {
        if (this.endpointKey && this.endpointKey.length > 0)
            this.endpointKey = encryptString(this.endpointKey, secret);

        if (this.subscriptionKey && this.subscriptionKey.length > 0)
            this.subscriptionKey = encryptString(this.subscriptionKey, secret);
    }

    // decrypt keys in service
    public decrypt(secret: string): void {
        if (this.endpointKey && this.endpointKey.length > 0)
            this.endpointKey = decryptString(this.endpointKey, secret);

        if (this.subscriptionKey && this.subscriptionKey.length > 0)
            this.subscriptionKey = decryptString(this.subscriptionKey, secret);
    }

}
