/**
 * @module botframework-connector
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { ConfidentialClientApplication } from '@azure/msal-node';
import { AppCredentials } from './appCredentials';
import { AuthenticatorResult } from './authenticatorResult';
import { MsalAppCredentials } from './msalAppCredentials';

/**
 * CertificateAppCredentials auth implementation
 */
export class CertificateAppCredentials extends AppCredentials {
    certificateThumbprint: string;
    certificatePrivateKey: string;
    x5c: string;

    private credentials: MsalAppCredentials;

    /**
     * Initializes a new instance of the [CertificateAppCredentials](xref:botframework-connector.CertificateAppCredentials) class.
     *
     * @param appId Microsoft application Id related to the certificate.
     * @param certificateThumbprint A hex encoded thumbprint of the certificate.
     * @param certificatePrivateKey A PEM encoded certificate private key.
     * @param channelAuthTenant Tenant ID of the Azure AD tenant where the bot is created.
     *   * Required for SingleTenant app types.
     *   * Optional for MultiTenant app types. **Note**: '_botframework.com_' is the default tenant when no value is provided.
     *
     * More information: https://learn.microsoft.com/en-us/security/zero-trust/develop/identity-supported-account-types.
     * @param oAuthScope Optional. The scope for the token.
     * @param x5c Optional. Enables application developers to achieve easy certificates roll-over in Azure AD:
     * set this parameter to send the public certificate (BEGIN CERTIFICATE) to Azure AD, so that Azure AD can use it to validate the subject name based on a trusted issuer policy.
     */
    constructor(
        appId: string,
        certificateThumbprint: string,
        certificatePrivateKey: string,
        channelAuthTenant?: string,
        oAuthScope?: string,
        x5c?: string
    ) {
        super(appId, channelAuthTenant, oAuthScope);
        this.certificateThumbprint = certificateThumbprint;
        this.certificatePrivateKey = certificatePrivateKey;
        this.x5c = x5c;
    }

    /**
     * @inheritdoc
     */
    async getToken(forceRefresh = false): Promise<string> {
        this.credentials ??= new MsalAppCredentials(
            this.createClientApplication(),
            this.appId,
            this.oAuthEndpoint,
            this.oAuthScope
        );
        return this.credentials.getToken(forceRefresh);
    }

    /**
     * @inheritdoc
     */
    protected refreshToken(): Promise<AuthenticatorResult> {
        // This will never be executed because we are using MsalAppCredentials.getToken underneath.
        throw new Error('Method not implemented.');
    }

    private createClientApplication() {
        return new ConfidentialClientApplication({
            auth: {
                clientId: this.appId,
                authority: this.oAuthEndpoint,
                clientCertificate: {
                    thumbprint: this.certificateThumbprint,
                    privateKey: this.certificatePrivateKey,
                    x5c: this.x5c,
                },
            },
        });
    }
}
