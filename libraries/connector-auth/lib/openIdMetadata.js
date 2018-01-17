"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const request = require("request");
var getPem = require('rsa-pem-from-mod-exp');
var base64url = require('base64url');
class OpenIdMetadata {
    constructor(url) {
        this.lastUpdated = 0;
        this.url = url;
    }
    getKey(keyId, cb) {
        var now = new Date().getTime();
        if (this.lastUpdated < (now - 1000 * 60 * 60 * 24 * 5)) {
            this.refreshCache((err) => {
                if (err) {
                }
                var key = this.findKey(keyId);
                cb(key);
            });
        }
        else {
            var key = this.findKey(keyId);
            cb(key);
        }
    }
    refreshCache(cb) {
        var options = {
            method: 'GET',
            url: this.url,
            json: true
        };
        request(options, (err, response, body) => {
            if (!err && (response.statusCode >= 400 || !body)) {
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
                    if (!err && (response.statusCode >= 400 || !body)) {
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
