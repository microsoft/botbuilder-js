/**
 * @module botframework-connector
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import * as getPem from 'rsa-pem-from-mod-exp';
import base64url from 'base64url';
import fetch from 'cross-fetch';
import { AuthenticationError } from "./authenticationError";
import { StatusCodes } from "botframework-schema";

/**
 * Class in charge of manage OpenId metadata.
 */
export class OpenIdMetadata {
    private url: string;
    private lastUpdated: number = 0;
    private keys: IKey[];

    /**
     * Initializes a new instance of the `OpenIdMetadata` class.
     * @param url Metadata Url.
     */
    constructor(url: string) {
        this.url = url;
    }

    /**
     * Gets the Signing key.
     * @param keyId The key ID to search for.
     */
    public async getKey(keyId: string): Promise<IOpenIdMetadataKey | null> {
        // If keys are more than 24 hours old, refresh them
        if (this.lastUpdated < (Date.now() - 1000 * 60 * 60 * 24)) {
            try {
                await this.refreshCache();

                // Search the cache even if we failed to refresh
                const key: IOpenIdMetadataKey = this.findKey(keyId);
                return key;
            } catch (err) {
                //logger.error('Error retrieving OpenId metadata at ' + this.url + ', error: ' + err.toString());
                // fall through and return cached key on error
                throw err;
            }
        } else {
            // Otherwise read from cache
            const key: IOpenIdMetadataKey = this.findKey(keyId);
            // Refresh the cache if a key is not found (max once per hour)
            if (!key && this.lastUpdated < (Date.now() - 1000 * 60 * 60)) {
                await this.refreshCache();
                return this.findKey(keyId);
            }
            return key;
        }
    }

    /**
     * @private
     */
    private async refreshCache(): Promise<void> {
        const res = await fetch(this.url);

        if (res.ok) {
            const openIdConfig = await res.json() as IOpenIdConfig;

            const getKeyResponse = await fetch(openIdConfig.jwks_uri);
            if (getKeyResponse.ok) {
                this.lastUpdated = new Date().getTime();
                this.keys = (await getKeyResponse.json()).keys as IKey[];
            } else {
                throw new AuthenticationError(`Failed to load Keys: ${ getKeyResponse.status }`, StatusCodes.INTERNAL_SERVER_ERROR);
            }

        } else {
            throw new AuthenticationError(`Failed to load openID config: ${ res.status }`, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * @private
     */
    private findKey(keyId: string): IOpenIdMetadataKey | null {
        if (!this.keys) {
            return null;
        }

        for (const key of this.keys) {
            if (key.kid === keyId) {

                if (!key.n || !key.e) {
                    // Return null for non-RSA keys
                    return null;
                }

                const modulus: any = base64url.toBase64(key.n);
                const exponent: string = key.e;

                return { key: getPem(modulus, exponent), endorsements: key.endorsements } as IOpenIdMetadataKey;
            }
        }

        return null;
    }
}

interface IOpenIdConfig {
    issuer: string;
    authorization_endpoint: string;
    jwks_uri: string;
    id_token_signing_alg_values_supported: string[];
    token_endpoint_auth_methods_supported: string[];
}

interface IKey {
    kty: string;
    use: string;
    kid: string;
    x5t: string;
    n: string;
    e: string;
    x5c: string[];
    endorsements?: string[];
}

export interface IOpenIdMetadataKey {
    key: string;
    endorsements?: string[];
}
