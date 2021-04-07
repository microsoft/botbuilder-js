/**
 * @module botframework-connector
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import * as adal from 'adal-node';
import * as msal from '@azure/msal-node';
import { AppCredentials } from './appCredentials';

// Determines if an unknown value is of adal.ErrorResponse type
function isErrorResponse(value: unknown): value is adal.ErrorResponse {
    if (value) {
        const { error, errorDescription } = value as adal.ErrorResponse;
        return error != null && errorDescription != null;
    }

    return false;
}

/**
 * MicrosoftAppCredentials auth implementation
 */
export class MicrosoftAppCredentials extends AppCredentials {
    private oAuthClient: msal.ConfidentialClientApplication;

    /**
     * Initializes a new instance of the [MicrosoftAppCredentials](xref:botframework-connector.MicrosoftAppCredentials) class.
     *
     * @param {string} appId The Microsoft app ID.
     * @param {string} appPassword The Microsoft app password.
     * @param {string} channelAuthTenant Optional. The oauth token tenant.
     * @param {string} oAuthScope Optional. The scope for the token.
     */
    public constructor(appId: string, public appPassword: string, channelAuthTenant?: string, oAuthScope?: string) {
        super(appId, channelAuthTenant, oAuthScope);
        // this.oAuthClient = new msal.ConfidentialClientApplication({
        //     auth: {
        //         clientId: this.appId,
        //         clientSecret: this.appPassword,
        //         authority: this.oAuthEndpoint,
        //     }
        // });
    }

    protected async refreshToken(): Promise<adal.TokenResponse> {
        if (!this.refreshingToken) {
            this.refreshingToken = new Promise<adal.TokenResponse>((resolve, reject): void => {
                this.authenticationContext.acquireTokenWithClientCredentials(
                    this.oAuthScope,
                    this.appId,
                    this.appPassword,
                    (err, tokenResponse) => {
                        if (err) {
                            reject(err);
                        } else if (isErrorResponse(tokenResponse)) {
                            reject(tokenResponse.error);
                        } else {
                            resolve(tokenResponse);
                        }
                    }
                );
            });
        }

        return this.refreshingToken;
    }

    protected async refreshToken2(): Promise<msal.AuthenticationResult> {
        // for now, just creating a new cca each call while debugging
        this.oAuthClient = new msal.ConfidentialClientApplication({
            auth: {
                clientId: this.appId,
                clientSecret: this.appPassword,
                authority: this.oAuthEndpoint,
            }
        });
        // TODO save this to a member on Credentials -- might not be necessary?
        let authRes: msal.AuthenticationResult;
        // if (!this.refreshingToken) {
            // currently keeping behavior the same as when we targeted ADAL
            // right now we are always request all default scopes
            // MSAL allows us to be more specific with scopes, if need be
            // TODO look up how to do this again
            const clientCredentialRequest = {
                scopes: [this.oAuthScope + '/.default'],
            };

            authRes = await this.oAuthClient.acquireTokenByClientCredential(clientCredentialRequest);
            console.log(`token from msal: ${authRes}`);
        // }

        return authRes;
    }
}
