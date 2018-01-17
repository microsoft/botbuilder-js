"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
                    if (body && response.statusCode < 300) {
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
