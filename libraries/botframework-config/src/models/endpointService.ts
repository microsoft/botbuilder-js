/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */
import { IEndpointService, ServiceTypes } from '../schema';
import { ConnectedService } from './connectedService';

export class EndpointService extends ConnectedService implements IEndpointService {
    public appId: string;
    public appPassword: string;
    public endpoint: string;

    constructor(source: IEndpointService) {
        super(source, ServiceTypes.Endpoint);
    }

    // encrypt keys in service
    public encrypt(secret: string, encryptString: (value: string, secret: string) => string): void {
        if (this.appPassword && this.appPassword.length > 0) {
            this.appPassword = encryptString(this.appPassword, secret);
        }
    }

    // decrypt keys in service
    public decrypt(secret: string, decryptString: (value: string, secret: string) => string): void {
        if (this.appPassword && this.appPassword.length > 0) {
            this.appPassword = decryptString(this.appPassword, secret);
        }
    }

}
