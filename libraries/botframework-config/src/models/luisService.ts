/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */
import { decryptString, encryptString } from '../encrypt';
import { ILuisService, ServiceTypes } from '../schema';
import { ConnectedService } from './connectedService';

export class LuisService extends ConnectedService implements ILuisService {
    public type = ServiceTypes.Luis;
    public appId = '';
    public authoringKey = '';
    public subscriptionKey = '';
    public version = '';

    constructor(source: ILuisService = {} as ILuisService) {
        super(source);
        const { appId = '', authoringKey = '', subscriptionKey = '', version = '' } = source;
        this.id = appId;
        Object.assign(this, { appId, authoringKey, subscriptionKey, version });
    }

    public toJSON(): ILuisService {
        const { appId, authoringKey, id, name, subscriptionKey, type, version } = this;
        return { type: ServiceTypes.Luis, id: appId, name, version, appId, authoringKey, subscriptionKey };
    }

    // encrypt keys in service
    public encrypt(secret: string, iv?: string): void {
        if (this.authoringKey && this.authoringKey.length > 0)
            this.authoringKey = encryptString(this.authoringKey, secret, iv);

        if (this.subscriptionKey && this.subscriptionKey.length > 0)
            this.subscriptionKey = encryptString(this.subscriptionKey, secret, iv);
    }

    // decrypt keys in service
    public decrypt(secret: string, iv?: string): void {
        if (this.authoringKey && this.authoringKey.length > 0)
            this.authoringKey = decryptString(this.authoringKey, secret, iv);

        if (this.subscriptionKey && this.subscriptionKey.length > 0)
            this.subscriptionKey = decryptString(this.subscriptionKey, secret, iv);
    }

}
