// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as adal from 'adal-node';
import type { ServiceClientCredentials } from '@azure/ms-rest-js';
import { tests } from 'botbuilder-stdlib';
import { MicrosoftAppCredentials } from './microsoftAppCredentials';
import { ServiceClientCredentialsFactory } from './serviceClientCredentialsFactory';
import { AuthenticationConstants } from './authenticationConstants';
import { GovernmentConstants } from './governmentConstants';

/**
 * A simple implementation of the [ServiceClientCredentialsFactory](xref:botframework-connector.ServiceClientCredentialsFactory) interface.
 */
export class PasswordServiceClientCredentialFactory implements ServiceClientCredentialsFactory {
    /**
     * The app ID for this credential.
     */
    appId: string | null;

    /**
     * The app password for this credential.
     */
    password: string | null;

    constructor(appId: string, password: string) {
        this.appId = appId;
        this.password = password;
    }

    async isValidAppId(appId = ''): Promise<boolean> {
        return appId === this.appId;
    }

    async isAuthenticationDisabled(): Promise<boolean> {
        return tests.isStringNullOrEmpty(this.appId);
    }

    async createCredentials(
        appId: string,
        audience: string,
        loginEndpoint: string,
        validateAuthority: boolean
    ): Promise<ServiceClientCredentials> {
        if (!(await this.isValidAppId(appId))) {
            throw new Error('appId did not match');
        }

        let credentials: MicrosoftAppCredentials;
        let normalizedEndpoint = loginEndpoint?.toLowerCase();
        if (normalizedEndpoint?.startsWith(AuthenticationConstants.ToChannelFromBotLoginUrlPrefix)) {
            credentials =
                this.appId == null
                    ? MicrosoftAppCredentials.Empty
                    : new MicrosoftAppCredentials(this.appId, this.password, undefined, audience);
        } else if (normalizedEndpoint == GovernmentConstants.ToChannelFromBotLoginUrl) {
            credentials =
                this.appId == null
                    ? new MicrosoftAppCredentials(
                          undefined,
                          undefined,
                          undefined,
                          GovernmentConstants.ToChannelFromBotOAuthScope
                      )
                    : new MicrosoftAppCredentials(this.appId, this.password, undefined, audience);
            normalizedEndpoint = loginEndpoint;
        } else {
            credentials =
                this.appId == null
                    ? new PrivateCloudAppCredentials(
                          undefined,
                          undefined,
                          undefined,
                          normalizedEndpoint,
                          validateAuthority
                      )
                    : new PrivateCloudAppCredentials(
                          this.appId,
                          this.password,
                          audience,
                          normalizedEndpoint,
                          validateAuthority
                      );
        }
        credentials.oAuthEndpoint = normalizedEndpoint;
        return credentials;
    }
}

class PrivateCloudAppCredentials extends MicrosoftAppCredentials {
    private readonly _validateAuthority: boolean;
    private __oAuthEndpoint: string;

    constructor(
        appId: string,
        password: string,
        oAuthScope: string,
        oAuthEndpoint: string,
        validateAuthority: boolean
    ) {
        super(appId, password, undefined, oAuthScope);
        this.oAuthEndpoint = oAuthEndpoint;
        this._validateAuthority = validateAuthority;
    }

    /**
     * Gets a value indicating whether to validate the Authority.
     *
     * @returns The ValidateAuthority value to use.
     */
    get validateAuthority(): boolean {
        return this._validateAuthority;
    }

    /**
     * Gets the OAuth endpoint to use.
     *
     * @returns The OAuthEndpoint to use.
     */
    public get oAuthEndpoint(): string {
        return this.__oAuthEndpoint;
    }

    /**
     * Sets the OAuth endpoint to use.
     */
    public set oAuthEndpoint(value: string) {
        // aadApiVersion is set to '1.5' to avoid the "spn:" concatenation on the audience claim
        // For more info, see https://github.com/AzureAD/azure-activedirectory-library-for-nodejs/issues/128
        this.__oAuthEndpoint = value;
        this.authenticationContext = new adal.AuthenticationContext(value, this.validateAuthority, undefined, '1.5');
    }
}
