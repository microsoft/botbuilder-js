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
import { ManagedIdentityAuthenticator } from './managedIdentityAuthenticator';
import {ok} from 'assert';

/**
 * Managed Service Identity auth implementation.
 */
export class ManagedIdentityAppCredentials extends AppCredentials {
    private readonly tokenProviderFactory: JwtTokenProviderFactoryInterface;
    private authenticator: ManagedIdentityAuthenticator;

    /**
     * Managed Identity for AAD credentials auth and caching.
     *
     * @param appId Client ID for the managed identity assigned to the bot.
     * @param oAuthScope The scope for the token.
     * @param tokenProviderFactory The JWT token provider factory to use.
     */
    constructor(appId: string, oAuthScope: string, tokenProviderFactory: JwtTokenProviderFactoryInterface) {
        super(appId, null, oAuthScope);

        ok(appId?.trim(), 'ManagedIdentityAppCredentials.constructor(): missing appid.');
        ok(tokenProviderFactory, 'ManagedIdentityAppCredentials.constructor(): missing tokenProviderFactory.');

        this.tokenProviderFactory = tokenProviderFactory;
        super.appId = appId;
    }

    /**
     * @inheritdoc
     */
    protected async refreshToken(): Promise<TokenResponse> {
        this.authenticator ??= new ManagedIdentityAuthenticator(
            this.appId,
            this.oAuthScope,
            this.tokenProviderFactory
        );

        const token = await this.authenticator.getToken();
        return {
            accessToken: token.token,
            expiresOn: new Date(token.expiresOnTimestamp),
            tokenType: 'Bearer',
            expiresIn: (token.expiresOnTimestamp - Date.now()) / 1000,
            resource: this.oAuthScope,
        };
    }
}
