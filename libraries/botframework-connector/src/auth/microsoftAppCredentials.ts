/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import * as adal from 'adal-node'
import { AppCredentials } from './appCredentials';

/**
 * MicrosoftAppCredentials auth implementation
 */
export class MicrosoftAppCredentials extends AppCredentials {
    public appPassword: string;

    constructor(appId: string, appPassword: string, channelAuthTenant?: string, oAuthScope?: string) {
        super(appId, channelAuthTenant);
        this.appPassword = appPassword;

        // AppCredentials.oAuthScope has an initial an initial value of AuthenticationConstants.ToBotFromChannelTokenIssuer,
        // Only change it if there is an actual value provided in the constructor for MicrosoftAppCredentials.
        this.oAuthScope = oAuthScope ? oAuthScope : this.oAuthScope;
    }

    protected async refreshToken(): Promise<adal.TokenResponse> {
        if (!this.refreshingToken) {
            this.refreshingToken = new Promise<adal.TokenResponse>((resolve, reject) => {
                this.authenticationContext.acquireTokenWithClientCredentials(this.oAuthScope, this.appId, this.appPassword, function(err, tokenResponse) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(tokenResponse as adal.TokenResponse);
                    }
                  });

            });
        }
        return this.refreshingToken;
    }
}
