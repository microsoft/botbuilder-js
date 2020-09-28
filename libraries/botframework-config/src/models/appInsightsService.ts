/**
 * @module botframework-config
 */
/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */
import { IAppInsightsService, ServiceTypes } from '../schema';
import { AzureService } from './azureService';

/**
 * Defines an App Insights service connection.
 */
export class AppInsightsService extends AzureService implements IAppInsightsService {
    /**
     * Instrumentation key for logging data to appInsights.
     */
    public instrumentationKey: string;

    /**
     * (Optional) application ID used for programmatic access to AppInsights.
     */
    public applicationId: string;

    /**
     * (Optional) named api keys for programmatic access to AppInsights.
     */
    public apiKeys: { [key: string]: string };

    /**
     * Creates a new AppInsightService instance.
     * @param source (Optional) JSON based service definition.
     */
    constructor(source: IAppInsightsService = {} as IAppInsightsService) {
        super(source, ServiceTypes.AppInsights);
        this.apiKeys = this.apiKeys || {};
    }

    /**
     * Encrypt properties on this service.
     * @param secret Secret to use to encrypt.
     * @param encryptString Function called to encrypt an individual value.
     */
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

    /**
     * Decrypt properties on this service.
     * @param secret Secret to use to decrypt.
     * @param decryptString Function called to decrypt an individual value.
     */
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
