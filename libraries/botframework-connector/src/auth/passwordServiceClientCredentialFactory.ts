// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as adal from 'adal-node';
import * as t from 'runtypes';
import { ServiceClientCredentials } from '@azure/ms-rest-js';
import { Maybe, tests } from 'botbuilder-stdlib';
import { MicrosoftAppCredentials } from './microsoftAppCredentials';
import { ServiceClientCredentialsFactory } from './serviceClientCredentialsFactory';
import { AuthenticationConstants } from './authenticationConstants';
import { GovernmentConstants } from './governmentConstants';

// Implementation of string.IsNullOrEmpty(): https://docs.microsoft.com/en-us/dotnet/api/system.string.isnullorempty?view=netcore-3.1
const stringIsNullOrEmpty = (val: unknown): val is Maybe<string> => {
    return tests.isNil(val) || (tests.isString(val) && !val.length);
};

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

    async isValidAppId(appId: string): Promise<boolean> {
        return appId === this.appId;
    }

    async isAuthenticationDisabled(): Promise<boolean> {
        return stringIsNullOrEmpty(this.appId);
    }

    async createCredentials(
        appId: string,
        audience: string,
        loginEndpoint: string,
        validateAuthority: boolean
    ): Promise<ServiceClientCredentials> {
        t.Record({
            appId: t.String.withConstraint((s) => s === this.appId),
            audience: t.String.optional(),
            loginEndpoint: t.String.optional(),
            validateAuthority: t.Boolean.optional(),
        }).check({ appId, audience, loginEndpoint, validateAuthority });

        const normalizedEndpoint = loginEndpoint.toLowerCase();
        if (normalizedEndpoint.startsWith(AuthenticationConstants.ToChannelFromBotLoginUrlPrefix)) {
            return this.appId == null
                ? MicrosoftAppCredentials.Empty
                : new MicrosoftAppCredentials(this.appId, this.password, undefined, audience);
        } else if (normalizedEndpoint === GovernmentConstants.ToChannelFromBotLoginUrl) {
            return this.appId == null
                ? new MicrosoftAppCredentials(null, null, null, GovernmentConstants.ToChannelFromBotOAuthScope)
                : new MicrosoftAppCredentials(
                      this.appId,
                      this.password,
                      null,
                      GovernmentConstants.ToChannelFromBotOAuthScope
                  );
        } else {
            return this.appId == null
                ? new PrivateCloudAppCredentials(null, null, null, loginEndpoint, validateAuthority)
                : new PrivateCloudAppCredentials(
                      this.appId,
                      this.password,
                      audience,
                      normalizedEndpoint,
                      validateAuthority
                  );
        }
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
     * 
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
