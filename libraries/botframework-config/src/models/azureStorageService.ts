/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */
import { decryptString, encryptString } from '../encrypt';
import { IAzureStorageService, ServiceTypes } from '../schema';
import { ConnectedService } from './connectedService';

export class AzureStorageService extends ConnectedService implements IAzureStorageService {
    public readonly type = ServiceTypes.AzureStorage;
    public tenantId = '';
    public subscriptionId = '';
    public resourceGroup = '';
    public connectionString = '';

    constructor(source: IAzureStorageService = {} as IAzureStorageService) {
        super(source);
        const { tenantId = '', subscriptionId = '', resourceGroup = '', connectionString='' } = source;
        Object.assign(this, { tenantId, subscriptionId, resourceGroup, connectionString });
    }

    public toJSON(): IAzureStorageService {
        let { id, name, tenantId, subscriptionId, resourceGroup, connectionString } = this;
        return { type: ServiceTypes.AzureStorage, id, name, tenantId, subscriptionId, resourceGroup, connectionString };
    }

    // encrypt keys in service
    public encrypt(secret: string): void {
        if (this.connectionString && this.connectionString.length > 0)
            this.connectionString = encryptString(this.connectionString, secret);
    }

    // decrypt keys in service
    public decrypt(secret: string): void {
        if (this.connectionString && this.connectionString.length > 0)
            this.connectionString = decryptString(this.connectionString, secret);
    }
}
