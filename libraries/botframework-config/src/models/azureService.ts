/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */
import { IAzureService, ServiceTypes } from '../schema';
import { ConnectedService } from './connectedService';

export class AzureService extends ConnectedService implements IAzureService {
    public tenantId = '';
    public subscriptionId = '';
    public resourceGroup = '';
    public serviceName = '';

    constructor(source: IAzureService = {} as IAzureService, type: ServiceTypes) {
        super(source, type);
        const { tenantId = '', subscriptionId = '', resourceGroup = '', serviceName = '' } = source;
        Object.assign(this, { tenantId, subscriptionId, resourceGroup, serviceName });
    }

    public toJSON(): IAzureService {
        let { type, id, name, tenantId, subscriptionId, resourceGroup, serviceName } = this;
        return { type, id, name, tenantId, subscriptionId, resourceGroup, serviceName };
    }

    // encrypt keys in service
    public encrypt(secret: string, iv?: string): void {

    }

    // decrypt keys in service
    public decrypt(secret: string, iv?: string): void {

    }
}
