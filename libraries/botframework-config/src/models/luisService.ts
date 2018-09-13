/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */
import { ILuisService, ServiceTypes } from '../schema';
import { ConnectedService } from './connectedService';

export class LuisService extends ConnectedService implements ILuisService {
    public appId: string;
    public authoringKey: string;
    public subscriptionKey: string;
    public version: string ;
    public region: string ;

    constructor(source: ILuisService = {} as ILuisService, serviceType?: ServiceTypes) {
        super(source, serviceType || ServiceTypes.Luis);
    }

    // get endpoint for the luis service
    public getEndpoint() { 
        return `https://${this.region}.api.cognitive.microsoft.com`;
    }

    // encrypt keys in service
    public encrypt(secret: string, encryptString: (value: string, secret: string) => string): void {
        if (this.authoringKey && this.authoringKey.length > 0) {
            this.authoringKey = encryptString(this.authoringKey, secret);
        }
        if (this.subscriptionKey && this.subscriptionKey.length > 0) {
            this.subscriptionKey = encryptString(this.subscriptionKey, secret);
        }
    }

    // decrypt keys in service
    public decrypt(secret: string, decryptString: (value: string, secret: string) => string): void {
        if (this.authoringKey && this.authoringKey.length > 0) {
            this.authoringKey = decryptString(this.authoringKey, secret);
        }
        if (this.subscriptionKey && this.subscriptionKey.length > 0) {
            this.subscriptionKey = decryptString(this.subscriptionKey, secret);
        }
    }

}
