/**
 * @module botframework-connector
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { DefaultAzureCredential } from '@azure/identity';
import { JwtTokenProviderFactoryInterface } from './jwtTokenProviderFactoryInterface';

/**
 * @inheritdoc
 */
export class JwtTokenProviderFactory implements JwtTokenProviderFactoryInterface {
    /**
     * @inheritdoc
     */
    createAzureServiceTokenProvider(appId: string): DefaultAzureCredential {
        if (!appId || appId.trim() === '') {
            throw new Error('jwtTokenProviderFactory.createAzureServiceTokenProvider(): missing appid.');
        }

        return new DefaultAzureCredential({ managedIdentityClientId: appId });
    }
}
