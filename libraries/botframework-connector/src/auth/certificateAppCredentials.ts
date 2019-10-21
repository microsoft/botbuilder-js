/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import * as adal from 'adal-node'
import { AuthenticationConstants } from './authenticationConstants';
import { AppCredentials } from './appCredentials';

/**
 * CertificateAppCredentials auth implementation
 */
export class CertificateAppCredentials extends AppCredentials {

    public appPassword: string;
    public certificateThumbprint: string;
    public certificatekey: string;

    public oAuthEndpoint: string;
    public oAuthScope: string = AuthenticationConstants.ToBotFromChannelTokenIssuer;

    constructor(appId: string, certificateThumbprint: string, certificatekey: string, channelAuthTenant?: string) {
        super(appId, channelAuthTenant);
        this.certificateThumbprint = certificateThumbprint;
        this.certificatekey = certificatekey;
    }

    protected async refreshToken(): Promise<adal.TokenResponse> {
        if (!this.refreshingToken) {
            this.refreshingToken = new Promise<adal.TokenResponse>((resolve, reject) => {
                this.authenticationContext.acquireTokenWithClientCertificate(this.oAuthScope, this.appId, this.certificatekey, this.certificateThumbprint, function(err, tokenResponse) {
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
