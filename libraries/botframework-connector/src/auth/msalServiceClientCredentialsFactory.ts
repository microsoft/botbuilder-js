/**
 * @module botframework-connector
 */
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ConfidentialClientApplication } from '@azure/msal-node';
import { MsalAppCredentials } from './msalAppCredentials';
import { ServiceClientCredentials } from '@azure/ms-rest-js';
import { ServiceClientCredentialsFactory } from './serviceClientCredentialsFactory';
import { AuthenticationConstants } from './authenticationConstants';
import { GovernmentConstants } from './governmentConstants';

/**
 * An implementation of ServiceClientCredentialsFactory that generates MsalAppCredentials
 */
export class MsalServiceClientCredentialsFactory implements ServiceClientCredentialsFactory {
    private readonly appId: string;

    /**
     * Create an MsalServiceClientCredentialsFactory instance using runtime configuration and an
     * `@azure/msal-node` `ConfidentialClientApplication`.
     *
     * @param appId App ID for validation.
     * @param clientApplication An `@azure/msal-node` `ConfidentialClientApplication` instance.
     */
    constructor(appId: string, private readonly clientApplication: ConfidentialClientApplication) {
        this.appId = appId;
    }

    /**
     * @inheritdoc
     */
    async isValidAppId(appId: string): Promise<boolean> {
        return appId === this.appId;
    }

    /**
     * @inheritdoc
     */
    async isAuthenticationDisabled(): Promise<boolean> {
        return !this.appId;
    }

    /**
     * @inheritdoc
     */
    async createCredentials(
        appId: string,
        audience: string,
        loginEndpoint: string,
        _validateAuthority: boolean
    ): Promise<ServiceClientCredentials> {
        if (await this.isAuthenticationDisabled()) {
            return MsalAppCredentials.Empty;
        }

        if (!(await this.isValidAppId(appId))) {
            throw new Error('Invalid appId.');
        }

        const normalizedEndpoint = loginEndpoint.toLowerCase();

        if (normalizedEndpoint.startsWith(AuthenticationConstants.ToChannelFromBotLoginUrlPrefix)) {
            return new MsalAppCredentials(
                this.clientApplication,
                appId,
                undefined,
                audience || AuthenticationConstants.ToBotFromChannelTokenIssuer
            );
        }

        if (normalizedEndpoint === GovernmentConstants.ToChannelFromBotLoginUrl.toLowerCase()) {
            return new MsalAppCredentials(
                this.clientApplication,
                appId,
                GovernmentConstants.ToChannelFromBotLoginUrl,
                audience || GovernmentConstants.ToChannelFromBotOAuthScope
            );
        }

        return new MsalAppCredentials(this.clientApplication, appId, loginEndpoint, audience);
    }
}
