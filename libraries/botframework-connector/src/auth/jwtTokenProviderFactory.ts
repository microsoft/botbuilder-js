/**
 * @module botframework-connector
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { DefaultAzureCredential } from '@azure/identity';
import { JwtTokenProviderFactoryInterface } from './jwtTokenProviderFactoryInterface';
import {ok} from 'assert';

/**
 * @inheritdoc
 */
export class JwtTokenProviderFactory implements JwtTokenProviderFactoryInterface {
    /**
     * @inheritdoc
     */
    createAzureServiceTokenProvider(appId: string): DefaultAzureCredential {
        ok(appId?.trim(), 'jwtTokenProviderFactory.createAzureServiceTokenProvider(): missing appid.');

        return new DefaultAzureCredential({ managedIdentityClientId: appId });
    }
}
