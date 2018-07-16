/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import * as request from 'request';
let getPem = require('rsa-pem-from-mod-exp');
let base64url = require('base64url');

export class OpenIdMetadata {
    private url: string;
    private lastUpdated = 0;
    private keys: IKey[];

    constructor(url: string) {
        this.url = url;
    }

    public getKey(keyId: string): Promise<IOpenIdMetadataKey | null> {
        return new Promise((resolve, reject) => {
            // If keys are more than 5 days old, refresh them
            let now = new Date().getTime();
            if (this.lastUpdated < (now - 1000 * 60 * 60 * 24 * 5)) {
                this.refreshCache((err) => {
                    if (err) {
                        // logger.error('Error retrieving OpenId metadata at ' + this.url + ', error: ' + err.toString());
                        // fall through and return cached key on error
                        reject(err);
                    }

                    // Search the cache even if we failed to refresh
                    let key = this.findKey(keyId);
                    resolve(key);
                });
            } else {
                // Otherwise read from cache
                let key = this.findKey(keyId);
                resolve(key);
            }
        });
    }

    private refreshCache(cb: (err: Error) => void): void {
        let options: request.Options = {
            method: 'GET',
            url: this.url,
            json: true
        };

        request(options, (err, response, body) => {
            if (!err && (response.statusCode && response.statusCode >= 400 || !body)) {
                err = new Error('Failed to load openID config: ' + response.statusCode);
            }

            if (err) {
                cb(err);
            } else {
                let openIdConfig = <IOpenIdConfig>body;

                // tslint:disable-next-line:no-shadowed-variable
                let options: request.Options = {
                    method: 'GET',
                    url: openIdConfig.jwks_uri,
                    json: true
                };

                // tslint:disable-next-line:no-shadowed-variable
                request(options, (err, response, body) => {
                    if (!err && (response.statusCode && response.statusCode >= 400 || !body)) {
                        err = new Error('Failed to load Keys: ' + response.statusCode);
                    }

                    if (!err) {
                        this.lastUpdated = new Date().getTime();
                        this.keys = <IKey[]>body.keys;
                    }

                    cb(err);
                });
            }
        });
    }

    private findKey(keyId: string): IOpenIdMetadataKey | null {
        if (!this.keys) {
            return null;
        }

        for (let i = 0; i < this.keys.length; i++) {
            if (this.keys[i].kid === keyId) {
                let key = this.keys[i];

                if (!key.n || !key.e) {
                    // Return null for non-RSA keys
                    return null;
                }

                let modulus = base64url.toBase64(key.n);
                let exponent = key.e;

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
