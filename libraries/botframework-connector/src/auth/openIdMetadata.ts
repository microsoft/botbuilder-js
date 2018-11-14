/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
// tslint:disable-next-line:no-var-requires no-require-imports
const getPem: any = require('rsa-pem-from-mod-exp');
// tslint:disable-next-line:no-var-requires no-require-imports
const base64url: any = require('base64url');

export class OpenIdMetadata {
    private url: string;
    private lastUpdated: number = 0;
    private keys: IKey[];

    constructor(url: string) {
        this.url = url;
    }

    public async getKey(keyId: string): Promise<IOpenIdMetadataKey | null> {
        // If keys are more than 5 days old, refresh them
        if (this.lastUpdated < (Date.now() - 1000 * 60 * 60 * 24 * 5)) {
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
            return key
        }
    }

    private async refreshCache(): Promise<void> {
        const res = await fetch(this.url);

        if (res.ok) {
            const openIdConfig = await res.json() as IOpenIdConfig;

            const getKeyResponse = await fetch(openIdConfig.jwks_uri);
            if (getKeyResponse.ok) {
                this.lastUpdated = new Date().getTime();
                this.keys = (await getKeyResponse.json()).keys as IKey[];
            } else {
                throw new Error(`Failed to load Keys: ${ getKeyResponse.status }`);
            }

        } else {
            throw new Error(`Failed to load openID config: ${ res.status }`);
        }
    }

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
