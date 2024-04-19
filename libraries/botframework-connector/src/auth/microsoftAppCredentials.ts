/**
 * @module botframework-connector
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { AppCredentials } from './appCredentials';
import { AuthenticatorResult } from './authenticatorResult';
import { MsalAppCredentials } from './msalAppCredentials';

/**
 * MicrosoftAppCredentials auth implementation
 */
export class MicrosoftAppCredentials extends AppCredentials {
    /**
     * An empty set of credentials.
     */
    static readonly Empty = new MicrosoftAppCredentials(null, null);

    private credentials: MsalAppCredentials;

    /**
     * Initializes a new instance of the [MicrosoftAppCredentials](xref:botframework-connector.MicrosoftAppCredentials) class.
     *
     * @param {string} appId The Microsoft app ID.
     * @param {string} appPassword The Microsoft app password.
     * @param {string} channelAuthTenant Tenant ID of the Azure AD tenant where the bot is created.
     *   * Required for SingleTenant app types.
     *   * Optional for MultiTenant app types. **Note**: '_botframework.com_' is the default tenant when no value is provided.
     *
     * More information: https://learn.microsoft.com/en-us/security/zero-trust/develop/identity-supported-account-types.
     * @param {string} oAuthScope Optional. The scope for the token.
     */
    constructor(appId: string, public appPassword: string, channelAuthTenant?: string, oAuthScope?: string) {
        super(appId, channelAuthTenant, oAuthScope);
    }

    /**
     * @inheritdoc
     */
    async getToken(forceRefresh = false): Promise<string> {
        this.credentials ??= new MsalAppCredentials(this.appId, this.appPassword, this.oAuthEndpoint, this.oAuthScope);
        return this.credentials.getToken(forceRefresh);
    }

    /**
     * @inheritdoc
     */
    protected refreshToken(): Promise<AuthenticatorResult> {
        // This will never be executed because we are using MsalAppCredentials.getToken underneath.
        throw new Error('Method not implemented.');
    }
}
