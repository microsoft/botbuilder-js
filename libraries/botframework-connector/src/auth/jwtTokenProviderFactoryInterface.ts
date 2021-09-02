/**
 * @module botframework-connector
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { DefaultAzureCredential } from '@azure/identity';

/*
 * A factory that can create OAuth token providers for generating JWT auth tokens.
 */
export interface JwtTokenProviderFactoryInterface {
    /*
     * Creates a new instance of the <see cref="DefaultAzureCredential"/> class.
     * @param appId Client id for the managed identity to be used for acquiring tokens.
     * @returns A new instance of the <see cref="DefaultAzureCredential"/> class.
     */
    createAzureServiceTokenProvider(appId: string): DefaultAzureCredential;
}
