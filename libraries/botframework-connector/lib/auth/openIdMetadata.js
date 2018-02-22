"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
const request = require("request");
var getPem = require('rsa-pem-from-mod-exp');
var base64url = require('base64url');
class OpenIdMetadata {
    constructor(url) {
        this.lastUpdated = 0;
        this.url = url;
    }
    getKey(keyId) {
        return new Promise((resolve, reject) => {
            // If keys are more than 5 days old, refresh them
            var now = new Date().getTime();
            if (this.lastUpdated < (now - 1000 * 60 * 60 * 24 * 5)) {
                this.refreshCache((err) => {
                    if (err) {
                        //logger.error('Error retrieving OpenId metadata at ' + this.url + ', error: ' + err.toString());
                        // fall through and return cached key on error
                        reject(err);
                    }
                    // Search the cache even if we failed to refresh
                    var key = this.findKey(keyId);
                    resolve(key);
                });
            }
            else {
                // Otherwise read from cache
                var key = this.findKey(keyId);
                resolve(key);
            }
        });
    }
    refreshCache(cb) {
        var options = {
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
            }
            else {
                var openIdConfig = body;
                var options = {
                    method: 'GET',
                    url: openIdConfig.jwks_uri,
                    json: true
                };
                request(options, (err, response, body) => {
                    if (!err && (response.statusCode && response.statusCode >= 400 || !body)) {
                        err = new Error("Failed to load Keys: " + response.statusCode);
                    }
                    if (!err) {
                        this.lastUpdated = new Date().getTime();
                        this.keys = body.keys;
                    }
                    cb(err);
                });
            }
        });
    }
    findKey(keyId) {
        if (!this.keys) {
            return null;
        }
        for (var i = 0; i < this.keys.length; i++) {
            if (this.keys[i].kid == keyId) {
                var key = this.keys[i];
                if (!key.n || !key.e) {
                    // Return null for non-RSA keys
                    return null;
                }
                var modulus = base64url.toBase64(key.n);
                var exponent = key.e;
                return { key: getPem(modulus, exponent), endorsements: key.endorsements };
            }
        }
        return null;
    }
}
exports.OpenIdMetadata = OpenIdMetadata;
//# sourceMappingURL=openIdMetadata.js.map