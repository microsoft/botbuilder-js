/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import * as adal from 'adal-node';
import { AppCredentials } from './appCredentials';

/**
 * MicrosoftAppCredentials auth implementation
 */
export class MicrosoftAppCredentials extends AppCredentials {
    public appPassword: string;

    /**
     * Initializes a new instance of the `MicrosoftAppCredentials` class.
     * @param appId The Microsoft app ID.
     * @param appPassword The Microsoft app password.
     * @param channelAuthTenant Optional. The oauth token tenant.
     * @param oAuthScope Optional. The scope for the token.
     */
    public constructor(appId: string, appPassword: string, channelAuthTenant?: string, oAuthScope?: string) {
        super(appId, channelAuthTenant, oAuthScope);
        this.appPassword = appPassword;
    }

    /**
     * @protected
     */
    protected async refreshToken(): Promise<adal.TokenResponse> {
        if (!this.refreshingToken) {
            this.refreshingToken = new Promise<adal.TokenResponse>((resolve, reject): void => {
                this.authenticationContext.acquireTokenWithClientCredentials(this.oAuthScope, this.appId, this.appPassword, function(err, tokenResponse): void {
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
