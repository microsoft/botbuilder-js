/**
 * @module botframework-connector
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { AccessToken, DefaultAzureCredential } from '@azure/identity';
import { retry } from 'botbuilder-stdlib';
import { JwtTokenProviderFactoryInterface } from './jwtTokenProviderFactoryInterface';
import { ok } from 'assert';

/**
 * Abstraction to acquire tokens from a Managed Service Identity.
 */
export class ManagedIdentityAuthenticator {
    private readonly tokenProvider: DefaultAzureCredential;
    private readonly resource: string;

    /**
     * Initializes a new instance of the ManagedIdentityAuthenticator class.
     *
     * @param appId Client id for the managed identity to be used for acquiring tokens.
     * @param resource Resource for which to acquire the token.
     * @param tokenProviderFactory The JWT token provider factory to use.
     */
    constructor(appId: string, resource: string, tokenProviderFactory: JwtTokenProviderFactoryInterface) {
        ok(appId?.trim(), 'ManagedIdentityAuthenticator.constructor(): missing appid.');
        ok(resource?.trim(), 'ManagedIdentityAuthenticator.constructor(): missing resource.');
        ok(tokenProviderFactory, 'ManagedIdentityAuthenticator.constructor(): missing tokenProviderFactory.');

        this.resource = resource;
        this.tokenProvider = tokenProviderFactory.createAzureServiceTokenProvider(appId);
    }

    /**
     * Acquires the security token.
     *
     * @returns {Promise<AccessToken>} An [AccessToken](xref:botframework-connector.AccessToken).
     */
    public async getToken(): Promise<AccessToken> {
        // Retry gradually, starting from 10 ms up to 5 times.
        return retry(() => this.tokenProvider.getToken(this.resource), 5, 10);
    }
}
