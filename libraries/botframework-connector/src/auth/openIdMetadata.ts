/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import * as request from 'request';
const getPem: any = require('rsa-pem-from-mod-exp');
const base64url: any = require('base64url');

export class OpenIdMetadata {
    private url: string;
    private lastUpdated: number = 0;
    private keys: IKey[];

    constructor(url: string) {
        this.url = url;
    }

    public getKey(keyId: string): Promise<IOpenIdMetadataKey | null> {
        return new Promise((resolve: any, reject: any): void => {
            // If keys are more than 5 days old, refresh them
            const now: number = new Date().getTime();
            if (this.lastUpdated < (now - 1000 * 60 * 60 * 24 * 5)) {
                this.refreshCache((err: any): void => {
                    if (err) {
                        //logger.error('Error retrieving OpenId metadata at ' + this.url + ', error: ' + err.toString());
                        // fall through and return cached key on error
                        reject(err);
                    }

                    // Search the cache even if we failed to refresh
                    const key: IOpenIdMetadataKey = this.findKey(keyId);
                    resolve(key);
                });
            } else {
                // Otherwise read from cache
                const key: IOpenIdMetadataKey = this.findKey(keyId);
                resolve(key);
            }
        });
    }

    private refreshCache(cb: (err: Error) => void): void {
        const options: request.Options = {
            method: 'GET',
            url: this.url,
            json: true
        };

        request(options, (err: any, response: any, body: any) => {
            if (!err && (response.statusCode && response.statusCode >= 400 || !body)) {
                err = new Error(`Failed to load openID config: ${ response.statusCode }`);
            }

            if (err) {
                cb(err);
            } else {
                const openIdConfig: IOpenIdConfig = <IOpenIdConfig>body;

                const get_key_options: request.Options = {
                    method: 'GET',
                    url: openIdConfig.jwks_uri,
                    json: true
                };

                request(get_key_options, (get_key_error: Error, get_key_response: any, get_key_body: any) => {
                    if (!get_key_error && (get_key_response.statusCode && get_key_response.statusCode >= 400 || !get_key_body)) {
                        get_key_error = new Error(`Failed to load Keys: ${ get_key_response.statusCode }`);
                    }

                    if (!get_key_error) {
                        this.lastUpdated = new Date().getTime();
                        this.keys = <IKey[]>get_key_body.keys;
                    }

                    cb(get_key_error);
                });
            }
        });
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
