/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { ServiceClientContext, ServiceClientCredentials } from "botbuilder-stdlib/lib/azureCoreHttpCompat";
import * as Models from "./models";

const packageName = 'botframework-token';
const packageVersion = '4.0.0';

export class TokenApiClientContext extends ServiceClientContext {
    /**
     * Initializes a new instance of the TokenApiClientContext class.
     * @param credentials Subscription credentials which uniquely identify client subscription.
     * @param [options] The parameter options
     */
    constructor(credentials: ServiceClientCredentials, options?: Models.TokenApiClientOptions) {
        super(credentials, {
            ...options,
            baseUri: options?.baseUri || 'https://token.botframework.com',
            userAgent: `${packageName}/${packageVersion} ${options?.userAgent || ''}`,
        });
    }
}
