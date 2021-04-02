/**
 * @module botframework-connector
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import * as adal from 'adal-node';
import * as msal from '@azure/msal-node'; // TODO - narrow import
import { AppCredentials } from './appCredentials';

/**
 * CertificateAppCredentials auth implementation
 */
export class CertificateAppCredentials extends AppCredentials {
    public certificateThumbprint: string;
    public certificatePrivateKey: string;
    private oAuthClient: msal.ConfidentialClientApplication;

    /**
     * Initializes a new instance of the [CertificateAppCredentials](xref:botframework-connector.CertificateAppCredentials) class.
     * @param appId Microsoft application Id related to the certificate.
     * @param certificateThumbprint A hex encoded thumbprint of the certificate.
     * @param certificatePrivateKey A PEM encoded certificate private key.
     * @param channelAuthTenant Optional. The oauth token tenant.
     * @param oAuthScope Optional. The scope for the token.
     */
    constructor(
        appId: string,
        certificateThumbprint: string,
        certificatePrivateKey: string,
        channelAuthTenant?: string,
        oAuthScope?: string
    ) {
        super(appId, channelAuthTenant, oAuthScope);
        this.certificateThumbprint = certificateThumbprint;
        this.certificatePrivateKey = certificatePrivateKey;

        this.oAuthClient = new msal.ConfidentialClientApplication({
            auth: {
                clientId: this.appId,
                authority: this.oAuthEndpoint,
                clientCertificate: {
                    thumbprint: certificateThumbprint,
                    privateKey: certificatePrivateKey
                }
            }
        });
    }

    /**
     * Get a token using Azure Active Directory Authentication Library (ADAL).
     * 
     * @deprecated since version 4.14.x due to the deprecation of ADAL. Consider using `refreshToken2` (TODO change name),
     * which leverages Microsoft's newer and favored Microsoft Authentication Library (MSAL).
     * 
     * For more details, see https://docs.microsoft.com/en-us/azure/active-directory/develop/msal-migration#frequently-asked-questions-faq.
     * @protected
     */
    protected async refreshToken(): Promise<adal.TokenResponse> {
        return new Promise<adal.TokenResponse>((resolve, reject) => {
            this.authenticationContext.acquireTokenWithClientCertificate(
                this.oAuthScope,
                this.appId,
                this.certificatePrivateKey,
                this.certificateThumbprint,
                function (err, tokenResponse) { // TODO -- fat arrow ok?
                    if (err) {
                        reject(err);
                    } else {
                        resolve(tokenResponse as adal.TokenResponse);
                    }
                }
            );
        });
    }

    protected async refreshToken2(): Promise<msal.AuthenticationResult> {
        // TODO save this to a member on Credentials -- might not be necessary?
        let authRes: msal.AuthenticationResult;
        // if (!this.refreshingToken) {
            const clientCredentialRequest = {
                scopes: [this.oAuthScope + '/.default'],
            };

            authRes = await this.oAuthClient.acquireTokenByClientCredential(clientCredentialRequest);
            console.log(`token from msal: ${authRes}`);
        // }

        return authRes;
    }
}
