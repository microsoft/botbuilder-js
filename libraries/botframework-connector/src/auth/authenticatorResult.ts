/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/**
 * Contains tokens and metadata upon successful completion of an acquireToken call.
 */
export interface AuthenticatorResult {
    /**
     * The value of the access token resulting from an authentication process.
     */
    accessToken: string;
    /**
     *  The date and time of expiration relative to Coordinated Universal Time (UTC).
     */
    expiresOn: Date;
}
