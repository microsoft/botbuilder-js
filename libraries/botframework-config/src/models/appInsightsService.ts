/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */
import { decryptString, encryptString } from '../encrypt';
import { IAppInsightsService, ServiceTypes } from '../schema';
import { ConnectedService } from './connectedService';

export class AppInsightsService extends ConnectedService implements IAppInsightsService {
    public readonly type = ServiceTypes.AppInsights;
    public tenantId = '';
    public subscriptionId = '';
    public resourceGroup = '';
    public instrumentationKey = '';

    constructor(source: IAppInsightsService = {} as IAppInsightsService) {
        super(source);
        const { tenantId = '', subscriptionId = '', resourceGroup = '', instrumentationKey = '' } = source;
        Object.assign(this, { tenantId, subscriptionId, resourceGroup, instrumentationKey });
    }

    public toJSON(): IAppInsightsService {
        let { id, name, tenantId, subscriptionId, resourceGroup, instrumentationKey } = this;
        return { type: ServiceTypes.AppInsights, id, name, tenantId, subscriptionId, resourceGroup, instrumentationKey };
    }

    // encrypt keys in service
    public encrypt(secret: string): void {
        if (this.instrumentationKey && this.instrumentationKey.length > 0)
            this.instrumentationKey = encryptString(this.instrumentationKey, secret);
    }

    // decrypt keys in service
    public decrypt(secret: string): void {
        if (this.instrumentationKey && this.instrumentationKey.length > 0)
            this.instrumentationKey = decryptString(this.instrumentationKey, secret);
    }
}
