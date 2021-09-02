/**
 * @module botframework-connector
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { TokenResponse } from 'adal-node';
import { AppCredentials } from './appCredentials';
import { JwtTokenProviderFactoryInterface } from './jwtTokenProviderFactoryInterface';

/**
 * Managed Service Identity auth implementation.
 */
export class ManagedIdentityAppCredentials extends AppCredentials {
    private readonly tokenProviderFactory: JwtTokenProviderFactoryInterface;

    /**
     * Managed Identity for AAD credentials auth and caching.
     *
     * @param appId Client ID for the managed identity assigned to the bot.
     * @param oAuthScope The scope for the token.
     * @param tokenProviderFactory The JWT token provider factory to use.
     */
    constructor(appId: string, oAuthScope: string, tokenProviderFactory: JwtTokenProviderFactoryInterface) {
        super(appId, null, oAuthScope);

        if (!appId || appId.trim() === '') {
            throw new Error('ManagedIdentityAppCredentials.constructor(): missing appid.');
        }

        if (!tokenProviderFactory) {
            throw new Error('ManagedIdentityAppCredentials.constructor(): missing tokenProviderFactory.');
        }

        this.tokenProviderFactory = tokenProviderFactory;
        super.appId = appId;
    }

    /**
     * @inheritdoc
     */
    protected refreshToken(): Promise<TokenResponse> {
        throw new Error('ManagedIdentityAppCredentials.refreshToken: Method not implemented.');
    }
}
