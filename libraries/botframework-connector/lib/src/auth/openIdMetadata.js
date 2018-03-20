var _this = this;
/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
var request = require('request');
var getPem = require('rsa-pem-from-mod-exp');
var base64url = require('base64url');
var OpenIdMetadata = (function () {
    function OpenIdMetadata(url) {
        this.lastUpdated = 0;
        this.url = url;
    }
    OpenIdMetadata.prototype.getKey = ;
    return OpenIdMetadata;
})();
exports.OpenIdMetadata = OpenIdMetadata;
null > {
    return: new Promise(function (resolve, reject) {
        // If keys are more than 5 days old, refresh them
        var now = new Date().getTime();
        if (_this.lastUpdated < (now - 1000 * 60 * 60 * 24 * 5)) {
            _this.refreshCache(function (err) {
                if (err) {
                    //logger.error('Error retrieving OpenId metadata at ' + this.url + ', error: ' + err.toString());
                    // fall through and return cached key on error
                    reject(err);
                }
                // Search the cache even if we failed to refresh
                var key = _this.findKey(keyId);
                resolve(key);
            });
        }
        else {
            // Otherwise read from cache
            var key = _this.findKey(keyId);
            resolve(key);
        }
    })
};
refreshCache(cb, function (err) { return void ; });
void {
    var: options, request: .Options = {
        method: 'GET',
        url: this.url,
        json: true
    },
    request: function (options) { } }(err, response, body);
{
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
        request(options, function (err, response, body) {
            if (!err && (response.statusCode && response.statusCode >= 400 || !body)) {
                err = new Error("Failed to load Keys: " + response.statusCode);
            }
            if (!err) {
                _this.lastUpdated = new Date().getTime();
                _this.keys = body.keys;
            }
            cb(err);
        });
    }
}
;
findKey(keyId, string);
IOpenIdMetadataKey | null;
{
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
            as;
            IOpenIdMetadataKey;
        }
    }
    return null;
}
//# sourceMappingURL=openIdMetadata.js.map