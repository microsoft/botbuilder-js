/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */
import { IAppInsightsService, ServiceTypes } from '../schema';
import { AzureService } from './azureService';

export class AppInsightsService extends AzureService implements IAppInsightsService {
    public instrumentationKey: string;
    public applicationId: string;
    public apiKeys: { [key: string]: string };

    constructor(source: IAppInsightsService = {} as IAppInsightsService) {
        super(source, ServiceTypes.AppInsights);
        this.apiKeys = this.apiKeys || {};
    }

    // encrypt keys in service
    public encrypt(secret: string, encryptString: (value: string, secret: string) => string): void {
        const that: AppInsightsService = this;
        if (this.instrumentationKey && this.instrumentationKey.length > 0) {
            this.instrumentationKey = encryptString(this.instrumentationKey, secret);
        }
        if (this.apiKeys) {
            Object.keys(this.apiKeys).forEach((prop: string) => {
                that.apiKeys[prop] = encryptString(that.apiKeys[prop], secret);
            });
        }
    }

    // decrypt keys in service
    public decrypt(secret: string, decryptString: (value: string, secret: string) => string): void {
        const that: AppInsightsService = this;
        if (this.instrumentationKey && this.instrumentationKey.length > 0) {
            this.instrumentationKey = decryptString(this.instrumentationKey, secret);
        }
        if (this.apiKeys) {
            Object.keys(this.apiKeys).forEach((prop: string) => {
                that.apiKeys[prop] = decryptString(that.apiKeys[prop], secret);
            });
        }
    }
}
