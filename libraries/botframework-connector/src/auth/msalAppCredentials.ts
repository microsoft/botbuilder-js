// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { AppCredentials } from './appCredentials';
import { ConfidentialClientApplication, NodeAuthOptions } from '@azure/msal-node';
import { TokenResponse } from 'adal-node';

export interface Certificate {
    thumbprint: string;
    privateKey: string;
}

/**
 * An implementation of AppCredentials that uses @azure/msal-node to fetch tokens.
 */
export class MsalAppCredentials extends AppCredentials {
    /**
     * A reference used for Empty auth scenarios
     */
    static Empty = new MsalAppCredentials();

    private readonly clientApplication?: ConfidentialClientApplication;

    /**
     * Create an MsalAppCredentials instance using a confidential client application.
     *
     * @param clientApplication An @azure/msal-node ConfidentialClientApplication instance.
     * @param appId The application ID.
     * @param authority The authority to use for fetching tokens
     * @param scope The oauth scope to use when fetching tokens.
     */
    constructor(clientApplication: ConfidentialClientApplication, appId: string, authority: string, scope: string);

    /**
     * Create an MsalAppCredentials instance using a confidential client application.
     *
     * @param appId The application ID.
     * @param appPassword The application password.
     * @param authority The authority to use for fetching tokens
     * @param scope The oauth scope to use when fetching tokens.
     */
    constructor(appId: string, appPassword: string, authority: string, scope: string);

    /**
     * Create an MsalAppCredentials instance using a confidential client application.
     *
     * @param appId The application ID.
     * @param certificate The client certificate details.
     * @param authority The authority to use for fetching tokens
     * @param scope The oauth scope to use when fetching tokens.
     */
    constructor(appId: string, certificate: Certificate, authority: string, scope: string);

    /**
     * @internal
     */
    constructor();

    /**
     * @internal
     */
    constructor(
        maybeClientApplicationOrAppId?: ConfidentialClientApplication | string,
        maybeAppIdOrAppPasswordOrCertificate?: string | Certificate,
        maybeAuthority?: string,
        maybeScope?: string
    ) {
        const appId =
            typeof maybeClientApplicationOrAppId === 'string'
                ? maybeClientApplicationOrAppId
                : typeof maybeAppIdOrAppPasswordOrCertificate === 'string'
                ? maybeAppIdOrAppPasswordOrCertificate
                : undefined;

        super(appId, undefined, maybeScope);

        if (typeof maybeClientApplicationOrAppId !== 'string') {
            this.clientApplication = maybeClientApplicationOrAppId;
        } else {
            const auth: NodeAuthOptions = {
                authority: maybeAuthority,
                clientId: appId,
            };

            auth.clientCertificate =
                typeof maybeAppIdOrAppPasswordOrCertificate !== 'string'
                    ? maybeAppIdOrAppPasswordOrCertificate
                    : undefined;

            auth.clientSecret =
                typeof maybeAppIdOrAppPasswordOrCertificate === 'string'
                    ? maybeAppIdOrAppPasswordOrCertificate
                    : undefined;

            this.clientApplication = new ConfidentialClientApplication({ auth });
        }
    }

    /**
     * @inheritdoc
     */
    async getToken(forceRefresh: boolean): Promise<string> {
        if (!this.clientApplication) {
            throw new Error('getToken should not be called for empty credentials.');
        }

        const scopePostfix = '/.default';
        let scope = this.oAuthScope;
        if (!scope.endsWith(scopePostfix)) {
            scope = `${scope}${scopePostfix}`;
        }

        const token = await this.clientApplication.acquireTokenByClientCredential({
            scopes: [scope],
            skipCache: forceRefresh,
        });

        const { accessToken } = token ?? {};
        if (typeof accessToken !== 'string') {
            throw new Error('Authentication: No access token received from MSAL.');
        }

        return accessToken;
    }

    protected async refreshToken(): Promise<TokenResponse> {
        throw new Error('NotImplemented');
    }
}
