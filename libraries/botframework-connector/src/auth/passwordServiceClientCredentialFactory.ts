// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { AuthenticationConstants } from './authenticationConstants';
import { GovernmentConstants } from './governmentConstants';
import { MicrosoftAppCredentials } from './microsoftAppCredentials';
import { MicrosoftGovernmentAppCredentials } from './microsoftGovernmentAppCredentials';
import { ServiceClientCredentials } from '@azure/ms-rest-js';
import { ServiceClientCredentialsFactory } from './serviceClientCredentialsFactory';

class PrivateCloudAppCredentials extends MicrosoftAppCredentials {
    constructor(
        appId: string,
        password: string,
        oauthScope: string,
        private readonly oauthEndpoint: string,
        private readonly validateAuthority: boolean
    ) {
        super(appId, password, undefined, oauthScope);
    }
}

export class PasswordServiceClientCredentialFactory extends ServiceClientCredentialsFactory {
    constructor(private readonly appId?: string, private readonly password?: string) {
        super();
    }

    isValidAppId(appId: string): Promise<boolean> {
        return Promise.resolve(appId === this.appId);
    }

    isAuthenticationDisabled(): Promise<boolean> {
        return Promise.resolve(this.appId == null);
    }

    createCredentials(
        appId: string,
        oauthScope: string,
        loginEndpoint: string,
        validateAuthority: boolean
    ): Promise<ServiceClientCredentials> {
        if (loginEndpoint.startsWith(AuthenticationConstants.ToChannelFromBotLoginUrlPrefix)) {
            return Promise.resolve(
                this.appId == null
                    ? MicrosoftAppCredentials.Empty
                    : new MicrosoftAppCredentials(appId, this.password, undefined, oauthScope)
            );
        } else if (loginEndpoint === GovernmentConstants.ToChannelFromBotLoginUrl) {
            return Promise.resolve(
                this.appId == null
                    ? MicrosoftGovernmentAppCredentials.Empty
                    : new MicrosoftAppCredentials(appId, this.appId, oauthScope)
            );
        } else {
            return Promise.resolve(
                this.appId == null
                    ? new PrivateCloudAppCredentials(null, null, null, loginEndpoint, validateAuthority)
                    : new PrivateCloudAppCredentials(appId, this.password, oauthScope, loginEndpoint, validateAuthority)
            );
        }
    }
}
