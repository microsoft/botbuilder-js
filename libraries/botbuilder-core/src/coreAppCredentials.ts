/**
 * @module botbuilder-core
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/**
 * Internal interface representing the "WebResource" from @azure/ms-rest-js
 */
interface CoreWebResource {
    url?: string;
    method?: any;
    body?: any;
    headers?: any;
}

/**
 * CoreAppCredentials
 * @remarks
 * Runtime-agnostic interface representing "ServiceClientCredentials" from @azure/ms-rest-js
 */
export interface CoreAppCredentials {
    /**
     * Signs a request with the Authentication header.
     *
     * @param {WebResource} webResource The WebResource/request to be signed.
     * @returns {Promise<WebResource>} The signed request object;
     */
    signRequest(webResource: CoreWebResource): Promise<CoreWebResource>;
}
