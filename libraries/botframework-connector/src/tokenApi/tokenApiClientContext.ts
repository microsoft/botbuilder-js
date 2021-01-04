/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { ServiceClient, ServiceClientCredentials } from '@azure/ms-rest-js';
import { TokenApiClientOptions } from './models';
import { resolveUserAgent } from '../userAgent';

export class TokenApiClientContext extends ServiceClient {
    credentials: ServiceClientCredentials;

    /**
     * Initializes a new instance of the TokenApiClientContext class.
     * @param credentials Subscription credentials which uniquely identify client subscription.
     * @param [options] The parameter options
     */
    constructor(credentials: ServiceClientCredentials, options: TokenApiClientOptions = {}) {
        if (credentials === null || credentials === undefined) {
            throw new Error("'credentials' cannot be null.");
        }

        options.userAgent = resolveUserAgent(options.userAgent, 'botframework-Token');

        super(credentials, options);

        this.baseUri = options.baseUri ?? this.baseUri ?? 'https://token.botframework.com';
        this.requestContentType = 'application/json; charset=utf-8';
        this.credentials = credentials;
    }
}
