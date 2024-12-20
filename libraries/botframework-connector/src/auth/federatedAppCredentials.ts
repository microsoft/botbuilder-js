/**
 * @module botframework-connector
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { ConfidentialClientApplication, ManagedIdentityApplication } from '@azure/msal-node';
import { ok } from 'assert';
import { AppCredentials } from './appCredentials';
import { AuthenticatorResult } from './authenticatorResult';
import { MsalAppCredentials } from './msalAppCredentials';

/**
 * Federated Credentials auth implementation.
 */
export class FederatedAppCredentials extends AppCredentials {
    private credentials: MsalAppCredentials;
    private managedIdentityClientAssertion: ManagedIdentityApplication;
    private clientAudience: string;

    /**
     * Initializes a new instance of the [FederatedAppCredentials](xref:botframework-connector.FederatedAppCredentials) class.
     *
     * @param {string} appId App ID for the Application.
     * @param {string} clientId Client ID for the managed identity assigned to the bot.
     * @param {string} channelAuthTenant Tenant ID of the Azure AD tenant where the bot is created.
     *   - **Required** for SingleTenant app types.
     *   - **Optional** for MultiTenant app types. **Note**: '_botframework.com_' is the default tenant when no value is provided.
     *
     * More information: https://learn.microsoft.com/en-us/security/zero-trust/develop/identity-supported-account-types.
     * @param {string} oAuthScope **Optional**. The scope for the token.
     * @param {string} clientAudience **Optional**. The Audience used in the Client's Federated Credential. **Default** (_api://AzureADTokenExchange_).
     */
    constructor(
        appId: string,
        clientId: string,
        channelAuthTenant?: string,
        oAuthScope?: string,
        clientAudience?: string,
    ) {
        super(appId, channelAuthTenant, oAuthScope);

        ok(appId?.trim(), 'FederatedAppCredentials.constructor(): missing appId.');

        this.clientAudience = clientAudience ?? 'api://AzureADTokenExchange';
        this.managedIdentityClientAssertion = new ManagedIdentityApplication({
            managedIdentityIdParams: { userAssignedClientId: clientId },
        });
    }

    /**
     * @inheritdoc
     */
    async getToken(forceRefresh = false): Promise<string> {
        this.credentials ??= new MsalAppCredentials(
            this.createClientApplication(await this.fetchExternalToken(forceRefresh)),
            this.oAuthEndpoint,
            this.oAuthEndpoint,
            this.oAuthScope,
        );
        return this.credentials.getToken(forceRefresh);
    }

    /**
     * @inheritdoc
     */
    protected refreshToken(): Promise<AuthenticatorResult> {
        // This will never be executed because we are using MsalAppCredentials.getToken underneath.
        throw new Error('Method not implemented.');
    }

    private createClientApplication(clientAssertion: string) {
        return new ConfidentialClientApplication({
            auth: {
                clientId: this.appId,
                authority: this.oAuthEndpoint,
                clientAssertion,
            },
        });
    }

    private async fetchExternalToken(forceRefresh = false): Promise<string> {
        const response = await this.managedIdentityClientAssertion.acquireToken({
            resource: this.clientAudience,
            forceRefresh,
        });
        return response.accessToken;
    }
}
