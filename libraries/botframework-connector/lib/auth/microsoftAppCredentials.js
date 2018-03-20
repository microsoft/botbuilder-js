"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
const url = require("url");
const msrest = require("ms-rest-js");
const request = require("request");
const constants_1 = require("./constants");
/**
 * MicrosoftAppCredentials auth implementation and cache
 */
class MicrosoftAppCredentials {
    constructor(appId, appPassword) {
        this.oAuthEndpoint = constants_1.Constants.ToChannelFromBotLoginUrl;
        this.oAuthScope = constants_1.Constants.ToChannelFromBotOAuthScope;
        this.refreshingToken = null;
        this.appId = appId;
        this.appPassword = appPassword;
        this.tokenCacheKey = `${appId}-cache`;
    }
    signRequest(webResource) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.shouldSetToken(webResource)) {
                let token = yield this.getToken();
                return new msrest.TokenCredentials(token).signRequest(webResource);
            }
            return webResource;
        });
    }
    getToken(forceRefresh = false) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!forceRefresh) {
                // check the global cache for the token. If we have it, and it's valid, we're done.
                let oAuthToken = MicrosoftAppCredentials.cache.get(this.tokenCacheKey);
                if (oAuthToken) {
                    // we have the token. Is it valid?
                    if (oAuthToken.expiration_time > new Date(Date.now())) {
                        return oAuthToken.access_token;
                    }
                }
            }
            // We need to refresh the token, because:
            // 1. The user requested it via the forceRefresh parameter
            // 2. We have it, but it's expired
            // 3. We don't have it in the cache.
            let oAuthToken = yield this.refreshToken();
            MicrosoftAppCredentials.cache.set(this.tokenCacheKey, oAuthToken);
            return oAuthToken.access_token;
        });
    }
    refreshToken() {
        if (!this.refreshingToken) {
            this.refreshingToken = new Promise((resolve, reject) => {
                // Refresh access token
                var opt = {
                    method: 'POST',
                    url: this.oAuthEndpoint,
                    form: {
                        grant_type: 'client_credentials',
                        client_id: this.appId,
                        client_secret: this.appPassword,
                        scope: this.oAuthScope
                    }
                };
                request(opt, (err, response, body) => {
                    this.refreshingToken = null;
                    if (!err) {
                        if (body && response.statusCode && response.statusCode < 300) {
                            // Subtract 5 minutes from expires_in so they'll we'll get a
                            // new token before it expires.
                            var oauthResponse = JSON.parse(body);
                            oauthResponse.expiration_time = new Date(Date.now() + (oauthResponse.expires_in * 1000) - 300000);
                            resolve(oauthResponse);
                        }
                        else {
                            reject(new Error('Refresh access token failed with status code: ' + response.statusCode));
                        }
                    }
                    else {
                        reject(err);
                    }
                });
            }).catch((err) => {
                this.refreshingToken = null;
                throw err;
            });
        }
        return this.refreshingToken;
    }
    /**
     * Adds the host of service url to trusted hosts.
     * If expiration time is not provided, the expiration date will be current (utc) date + 1 day.
     * @param  {string} serviceUrl The service url
     * @param  {Date} expiration? The expiration date after which this service url is not trusted anymore
     */
    static trustServiceUrl(serviceUrl, expiration) {
        if (!expiration) {
            expiration = new Date(Date.now() + 86400000); // 1 day
        }
        var uri = url.parse(serviceUrl);
        if (uri.host) {
            MicrosoftAppCredentials.trustedHostNames.set(uri.host, expiration);
        }
    }
    /**
     * Checks if the service url is for a trusted host or not.
     * @param  {string} serviceUrl The service url
     * @returns {boolean} True if the host of the service url is trusted; False otherwise.
     */
    static isTrustedServiceUrl(serviceUrl) {
        try {
            var uri = url.parse(serviceUrl);
            if (uri.host) {
                return MicrosoftAppCredentials.isTrustedUrl(uri.host);
            }
        }
        catch (e) {
        }
        return false;
    }
    shouldSetToken(webResource) {
        return MicrosoftAppCredentials.isTrustedServiceUrl(webResource.url);
    }
    static isTrustedUrl(url) {
        let expiration = MicrosoftAppCredentials.trustedHostNames.get(url);
        if (expiration) {
            // check if the trusted service url is still valid
            return expiration.getTime() > (Date.now() - 300000); // 5 Minutes
        }
        return false;
    }
}
MicrosoftAppCredentials.trustedHostNames = new Map([
    ['state.botframework.com', new Date(8640000000000000)] // Date.MAX_VALUE
]);
MicrosoftAppCredentials.cache = new Map();
exports.MicrosoftAppCredentials = MicrosoftAppCredentials;
//# sourceMappingURL=microsoftAppCredentials.js.map