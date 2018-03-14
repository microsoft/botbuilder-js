var _this = this;
/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
var url = require('url');
var msrest = require('ms-rest-js');
var request = require('request');
var constants_1 = require('./constants');
/**
 * MicrosoftAppCredentials auth implementation and cache
 */
var MicrosoftAppCredentials = (function () {
    function MicrosoftAppCredentials() {
    }
    MicrosoftAppCredentials.prototype.Map = ;
    MicrosoftAppCredentials.readonly = trustedHostNames;
    return MicrosoftAppCredentials;
})();
exports.MicrosoftAppCredentials = MicrosoftAppCredentials;
new Map([
    ['state.botframework.com', new Date(8640000000000000)] // Date.MAX_VALUE
]);
readonly;
cache: Map < string, OAuthResponse > ;
new Map();
appPassword: string;
appId: string;
readonly;
oAuthEndpoint: string = constants_1.Constants.ToChannelFromBotLoginUrl;
readonly;
oAuthScope: string = constants_1.Constants.ToChannelFromBotOAuthScope;
readonly;
tokenCacheKey: string;
refreshingToken: Promise( | null, null);
constructor(appId, string, appPassword, string);
{
    this.appId = appId;
    this.appPassword = appPassword;
    this.tokenCacheKey = appId + "-cache";
}
async;
signRequest(webResource, msrest.WebResource);
Promise < msrest.WebResource > {
    if: function () { }, this: .shouldSetToken(webResource) };
{
    var token = await;
    this.getToken();
    return new msrest.TokenCredentials(token).signRequest(webResource);
}
return webResource;
async;
getToken(forceRefresh, boolean = false);
Promise < string > {
    if: function () { } };
!forceRefresh;
{
    // check the global cache for the token. If we have it, and it's valid, we're done.
    var oAuthToken_1 = MicrosoftAppCredentials.cache.get(this.tokenCacheKey);
    if (oAuthToken_1) {
        // we have the token. Is it valid?
        if (oAuthToken_1.expiration_time > new Date(Date.now())) {
            return oAuthToken_1.access_token;
        }
    }
}
// We need to refresh the token, because:
// 1. The user requested it via the forceRefresh parameter
// 2. We have it, but it's expired
// 3. We don't have it in the cache.
var oAuthToken = await;
this.refreshToken();
MicrosoftAppCredentials.cache.set(this.tokenCacheKey, oAuthToken);
return oAuthToken.access_token;
refreshToken();
Promise < OAuthResponse > {
    if: function () { } };
!this.refreshingToken;
{
    this.refreshingToken = new Promise(function (resolve, reject) {
        // Refresh access token
        var opt = {
            method: 'POST',
            url: _this.oAuthEndpoint,
            form: {
                grant_type: 'client_credentials',
                client_id: _this.appId,
                client_secret: _this.appPassword,
                scope: _this.oAuthScope
            }
        };
        request(opt, function (err, response, body) {
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
    });
}
return this.refreshingToken;
trustServiceUrl(serviceUrl, string, expiration ?  : Date);
void {
    if: function () { } };
!expiration;
{
    expiration = new Date(Date.now() + 86400000); // 1 day
}
var uri = url.parse(serviceUrl);
if (uri.host) {
    MicrosoftAppCredentials.trustedHostNames.set(uri.host, expiration);
}
isTrustedServiceUrl(serviceUrl, string);
boolean;
{
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
shouldSetToken(webResource, msrest.WebResource);
{
    return MicrosoftAppCredentials.isTrustedServiceUrl(webResource.url);
}
isTrustedUrl(url, string);
boolean;
{
    var expiration = MicrosoftAppCredentials.trustedHostNames.get(url);
    if (expiration) {
        // check if the trusted service url is still valid
        return expiration.getTime() > (Date.now() - 300000); // 5 Minutes
    }
    return false;
}
//# sourceMappingURL=microsoftAppCredentials.js.map