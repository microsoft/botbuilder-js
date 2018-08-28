/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */
import { IAppInsightsService, ServiceTypes } from '../schema';
import { AzureService } from './azureService';

export class AppInsightsService extends AzureService implements IAppInsightsService {
    public instrumentationKey = '';
    public applicationId = '';
    public apiKeys: { [key: string]: string } = {};

    constructor(source: IAppInsightsService = {} as IAppInsightsService) {
        super(source, ServiceTypes.AppInsights);
        const { instrumentationKey = '', applicationId, apiKeys } = source;
        Object.assign(this, { instrumentationKey, applicationId, apiKeys });
    }

    public toJSON(): IAppInsightsService {
        let { id, type, name, tenantId, subscriptionId, resourceGroup, serviceName, instrumentationKey, applicationId, apiKeys } = this;
        return { type, id, name, tenantId, subscriptionId, resourceGroup, serviceName, instrumentationKey, applicationId, apiKeys };
    }

    // encrypt keys in service
    public encrypt(secret: string, encryptString: (value: string, secret:string) => string): void {
        if (this.instrumentationKey && this.instrumentationKey.length > 0)
            this.instrumentationKey = encryptString(this.instrumentationKey, secret);
        if (this.apiKeys) {
            for (let prop in this.apiKeys) {
                this.apiKeys[prop] = encryptString(this.apiKeys[prop], secret);
            }
        }
    }

    // decrypt keys in service
    public decrypt(secret: string, decryptString: (value: string, secret:string) => string): void {
        if (this.instrumentationKey && this.instrumentationKey.length > 0)
            this.instrumentationKey = decryptString(this.instrumentationKey, secret);
        if (this.apiKeys) {
            for (let prop in this.apiKeys) {
                this.apiKeys[prop] = decryptString(this.apiKeys[prop], secret);
            }
        }
    }
}
