/**
 * @module botframework-connector
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { AccessToken, AuthenticationError, DefaultAzureCredential } from '@azure/identity';
import { retry } from '../../../botbuilder-stdlib/lib';
import * as adal from 'adal-node';
import { JwtTokenProviderFactoryInterface } from './jwtTokenProviderFactoryInterface';

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
        if (!appId || appId.trim() === '') {
            throw new Error('ManagedIdentityAuthenticator.constructor(): missing appid.');
        }

        if (!resource || resource.trim() === '') {
            throw new Error('ManagedIdentityAuthenticator.constructor(): missing resource.');
        }

        if (!tokenProviderFactory) {
            throw new Error('ManagedIdentityAuthenticator.constructor(): missing tokenProviderFactory.');
        }

        this.resource = resource;
        this.tokenProvider = tokenProviderFactory.createAzureServiceTokenProvider(appId);
    }

    /**
     * ..
     *
     * @param forceRefresh ..
     * @returns ...
     */
    // public async getToken(): Promise<AccessToken> {
    //     const result = await retry(() => this.acquireToken(), this.handleTokenProviderException());
    //     const result2 = adal.ac
    //     return result;
    // }

    // private async acquireToken(): Promise<AccessToken> {
    //     const authResult = await this.tokenProvider.getToken(this.resource);
    //     return authResult;
    // }

    // private handleTokenProviderException(error: Error, retryCount: number): number {
    //     if (error.name === 'AuthenticationError') {
    //         return 0;
    //     } else {
    //         retryCount;
    //     }
    // }
}
