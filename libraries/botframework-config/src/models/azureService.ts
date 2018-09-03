/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */
import { IAzureService, ServiceTypes } from '../schema';
import { ConnectedService } from './connectedService';

export class AzureService extends ConnectedService implements IAzureService {
    public tenantId: string = '';
    public subscriptionId: string = '';
    public resourceGroup: string = '';
    public serviceName: string = '';

    constructor(source: IAzureService = {} as IAzureService, type: ServiceTypes) {
        super(source, type);
        const { tenantId = '', subscriptionId = '', resourceGroup = '', serviceName = '' } = source;
        Object.assign(this, { tenantId, subscriptionId, resourceGroup, serviceName });
    }

    public toJSON(): IAzureService {
        const { type, id, name, tenantId, subscriptionId, resourceGroup, serviceName } = this;

        return { type, id, name, tenantId, subscriptionId, resourceGroup, serviceName };
    }

    // encrypt keys in service
    public encrypt(secret: string, encryptString: (value: string, secret: string) => string): void {
        return;
    }

    // decrypt keys in service
    public decrypt(secret: string, decryptString: (value: string, secret: string) => string): void {
        return;
    }
}
