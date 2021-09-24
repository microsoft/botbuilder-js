/**
 * @module botframework-connector
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { DefaultAzureCredential } from '@azure/identity';
import { ok } from 'assert';
import type { JwtTokenProviderFactoryInterface } from './jwtTokenProviderFactoryInterface';

/**
 * @inheritdoc
 */
export class JwtTokenProviderFactory implements JwtTokenProviderFactoryInterface {
    /**
     * @inheritdoc
     */
    createAzureServiceTokenProvider(appId: string): DefaultAzureCredential {
        ok(appId?.trim(), 'jwtTokenProviderFactory.createAzureServiceTokenProvider(): missing appId.');

        return new DefaultAzureCredential({ managedIdentityClientId: appId });
    }
}
