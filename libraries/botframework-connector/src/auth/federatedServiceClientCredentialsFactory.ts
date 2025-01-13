/**
 * @module botframework-connector
 */
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ok } from 'assert';
import type { ServiceClientCredentials } from '@azure/core-http';
import { ServiceClientCredentialsFactory } from './serviceClientCredentialsFactory';
import { FederatedAppCredentials } from './federatedAppCredentials';

/**
 * A Federated Credentials implementation of the [ServiceClientCredentialsFactory](xref:botframework-connector.ServiceClientCredentialsFactory) interface.
 */
export class FederatedServiceClientCredentialsFactory extends ServiceClientCredentialsFactory {
    /**
     * Initializes a new instance of the [FederatedServiceClientCredentialsFactory](xref:botframework-connector.FederatedServiceClientCredentialsFactory) class.
     *
     * @param {string} appId App ID for the Application.
     * @param {string} clientId Client ID for the managed identity assigned to the bot.
     * @param {string} tenantId Tenant ID of the Azure AD tenant where the bot is created.
     *   - **Required** for SingleTenant app types.
     *   - **Optional** for MultiTenant app types. **Note**: '_botframework.com_' is the default tenant when no value is provided.
     *
     * More information: https://learn.microsoft.com/en-us/security/zero-trust/develop/identity-supported-account-types.
     * @param {string} clientAudience **Optional**. The Audience used in the Client's Federated Credential. **Default** (_api://AzureADTokenExchange_).
     */
    constructor(
        private appId: string,
        private clientId: string,
        private tenantId?: string,
        private clientAudience?: string,
    ) {
        super();

        ok(appId?.trim(), 'FederatedServiceClientCredentialsFactory.constructor(): missing appId.');
        ok(clientId?.trim(), 'FederatedServiceClientCredentialsFactory.constructor(): missing clientId.');
    }

    /**
     * @inheritdoc
     */
    async isValidAppId(appId = ''): Promise<boolean> {
        return appId === this.appId;
    }

    /**
     * @inheritdoc
     */
    async isAuthenticationDisabled(): Promise<boolean> {
        // Auth is always enabled for FIC.
        return;
    }

    /**
     * @inheritdoc
     */
    async createCredentials(appId: string, audience: string): Promise<ServiceClientCredentials> {
        ok(
            await this.isValidAppId(appId),
            'FederatedServiceClientCredentialsFactory.createCredentials(): Invalid App ID.',
        );

        return new FederatedAppCredentials(this.appId, this.clientId, this.tenantId, audience, this.clientAudience);
    }
}
