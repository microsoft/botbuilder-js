/**
 * @module botbuilder-core
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

 /**
  * Internal interface representing the "WebResource" from @azure/ms-rest-js@1.2.6
  */
interface WebResource {}

/**
 * AppCredentials
 * @remarks
 * Runtime-agnostic interface representing "ServiceClientCredentials" from @azure/ms-rest-js@1.2.6
 */
export interface AppCredentials {
    /**
     * Signs a request with the Authentication header.
     *
     * @param {WebResource} webResource The WebResource/request to be signed.
     * @returns {Promise<WebResource>} The signed request object;
    */
    signRequest(webResource: WebResource): Promise<WebResource>;
}
