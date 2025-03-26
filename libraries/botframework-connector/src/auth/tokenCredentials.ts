// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See License.txt in the project root for license information.

import {
    HttpHeaders,
    Constants,
    WebResourceLike,
    ServiceClientCredentials,
} from 'botbuilder-stdlib/lib/azureCoreHttpCompat';

/**
 * A credentials object that uses a token string and a authorzation scheme to authenticate.
 */
export class TokenCredentials implements ServiceClientCredentials {
    token: string;
    authorizationScheme: string = Constants.HeaderConstants.AUTHORIZATION_SCHEME;

    /**
     * Creates a new TokenCredentials object.
     *
     * @class
     * @param {string} token The token.
     * @param {string} [authorizationScheme] The authorization scheme.
     */
    constructor(token: string, authorizationScheme: string = Constants.HeaderConstants.AUTHORIZATION_SCHEME) {
        if (!token) {
            throw new Error('token cannot be null or undefined.');
        }
        this.token = token;
        this.authorizationScheme = authorizationScheme;
    }

    /**
     * Signs a request with the Authentication header.
     *
     * @param {WebResourceLike} webResource The WebResourceLike to be signed.
     * @returns {Promise<WebResourceLike>} The signed request object.
     */
    signRequest(webResource: WebResourceLike): Promise<WebResourceLike> {
        if (!webResource.headers) webResource.headers = new HttpHeaders();
        webResource.headers.set(Constants.HeaderConstants.AUTHORIZATION, `${this.authorizationScheme} ${this.token}`);
        return Promise.resolve(webResource);
    }
}
