"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
const msrest = require("ms-rest");
const request = require("request");
const settings_1 = require("./settings");
class MicrosoftAppCredentials {
    constructor(credentials) {
        this.accessToken = '';
        this.appId = '';
        this.appPassword = '';
        if (typeof credentials !== 'undefined') {
            if (typeof credentials.appId !== 'undefined') {
                this.appId = credentials.appId;
            }
            if (typeof credentials.appPassword !== 'undefined') {
                this.appPassword = credentials.appPassword;
            }
        }
    }
    signRequest(webResource, cb) {
        if (this.appId !== '' && this.appPassword !== '') {
            this.getAccessToken((err, token) => {
                if (!err && token) {
                    var tokenCredentials = new msrest.TokenCredentials(token);
                    tokenCredentials.signRequest(webResource, cb);
                }
                else {
                    cb(err);
                }
            });
        }
        else {
            cb(null);
        }
    }
    getAccessToken(cb) {
        if (!this.accessToken || new Date().getTime() >= this.accessTokenExpires) {
            // Refresh access token
            var opt = {
                method: 'POST',
                url: MicrosoftAppCredentials.refreshEndpoint,
                form: {
                    grant_type: 'client_credentials',
                    client_id: this.appId,
                    client_secret: this.appPassword,
                    scope: MicrosoftAppCredentials.refreshScope
                }
            };
            request(opt, (err, response, body) => {
                if (!err) {
                    if (body && response.statusCode && response.statusCode < 300) {
                        // Subtract 5 minutes from expires_in so they'll we'll get a
                        // new token before it expires.
                        var oauthResponse = JSON.parse(body);
                        this.accessToken = oauthResponse.access_token;
                        this.accessTokenExpires = new Date().getTime() + ((oauthResponse.expires_in - 300) * 1000);
                        cb(null, this.accessToken);
                    }
                    else {
                        cb(new Error('Refresh access token failed with status code: ' + response.statusCode), null);
                    }
                }
                else {
                    cb(err, null);
                }
            });
        }
        else {
            cb(null, this.accessToken);
        }
    }
}
MicrosoftAppCredentials.refreshEndpoint = settings_1.AuthSettings.refreshEndpoint;
MicrosoftAppCredentials.refreshScope = settings_1.AuthSettings.refreshScope;
exports.MicrosoftAppCredentials = MicrosoftAppCredentials;
