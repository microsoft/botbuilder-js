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
 * CertificateAppCredentials auth implementation
 */
export class CertificateAppCredentials extends AppCredentials {
    public certificateThumbprint: string;
    public certificatePrivateKey: string;

    constructor(appId: string, certificateThumbprint: string, certificatePrivateKey: string, channelAuthTenant?: string, oAuthScope?: string) {
        super(appId, channelAuthTenant, oAuthScope);
        this.certificateThumbprint = certificateThumbprint;
        this.certificatePrivateKey = certificatePrivateKey;
    }

    protected async refreshToken(): Promise<adal.TokenResponse> {
        if (!this.refreshingToken) {
            this.refreshingToken = new Promise<adal.TokenResponse>((resolve, reject) => {
                this.authenticationContext.acquireTokenWithClientCertificate(this.oAuthScope, this.appId, this.certificatePrivateKey, this.certificateThumbprint, function(err, tokenResponse) {
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
