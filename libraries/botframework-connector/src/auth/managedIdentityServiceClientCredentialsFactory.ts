/**
 * @module botframework-connector
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { JwtTokenProviderFactoryInterface } from './jwtTokenProviderFactoryInterface';
import { ServiceClientCredentials } from '@azure/ms-rest-js';
import { ServiceClientCredentialsFactory } from './serviceClientCredentialsFactory';
import { ManagedIdentityAppCredentials } from './managedIdentityAppCredentials';

/*
 * A Managed Identity implementation of the [ServiceClientCredentialsFactory](xref:botframework-connector.ServiceClientCredentialsFactory) abstract class.
 */
export class ManagedIdentityServiceClientCredentialsFactory extends ServiceClientCredentialsFactory {
    private readonly appId: string;
    private readonly tokenProviderFactory: JwtTokenProviderFactoryInterface;

    /**
     * Initializes a new instance of the ManagedIdentityServiceClientCredentialsFactory class.
     *
     * @param appId Client ID for the managed identity assigned to the bot.
     * @param tokenProviderFactory The JWT token provider factory to use.
     */
    constructor(appId: string, tokenProviderFactory: JwtTokenProviderFactoryInterface) {
        super();
        if (!appId || appId.trim() === '') {
            throw new Error('ManagedIdentityServiceClientCredentialsFactory.constructor(): missing appid.');
        }

        if (!tokenProviderFactory) {
            throw new Error(
                'ManagedIdentityServiceClientCredentialsFactory.constructor(): missing tokenProviderFactory.'
            );
        }

        this.appId = appId;
        this.tokenProviderFactory = tokenProviderFactory;
    }

    /**
     * @inheritdoc
     */
    public async isValidAppId(appId: string): Promise<boolean> {
        return appId === this.appId;
    }

    /**
     * @inheritdoc
     */
    public async isAuthenticationDisabled(): Promise<boolean> {
        // Auth is always enabled for MSI.
        return false;
    }

    /**
     * @inheritdoc
     */
    public async createCredentials(appId: string, audience: string): Promise<ServiceClientCredentials> {
        if (appId != this.appId) {
            throw new Error('ManagedIdentityServiceClientCredentialsFactory.createCredentials(): Invalid Managed ID.');
        }

        return new ManagedIdentityAppCredentials(this.appId, audience, this.tokenProviderFactory);
    }
}
