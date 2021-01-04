/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { ConnectorClientOptions } from './models';
import { ServiceClient, ServiceClientCredentials } from '@azure/ms-rest-js';
import { resolveUserAgent } from '../userAgent';

export class ConnectorClientContext extends ServiceClient {
    credentials: ServiceClientCredentials;

    /**
     * Initializes a new instance of the ConnectorClientContext class.
     * @param {ServiceClientCredentials} credentials Subscription credentials which uniquely identify client subscription.
     * @param {ConnectorClientContext} options The parameter options
     */
    constructor(credentials: ServiceClientCredentials, options: ConnectorClientOptions = {}) {
        if (credentials === null || credentials === undefined) {
            throw new Error("'credentials' cannot be null.");
        }

        options.userAgent = resolveUserAgent(options.userAgent);

        super(credentials, options);

        this.baseUri = options.baseUri ?? this.baseUri ?? 'https://api.botframework.com';
        this.requestContentType = 'application/json; charset=utf-8';
        this.credentials = credentials;
    }
}
