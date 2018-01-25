const msRest = require('ms-rest');
const request = require('request');
const settings = require('./settings');

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

    signRequest(webResource, callback) {
        if (this.appId !== '' && this.appPassword !== '') {
            this.getAccessToken((err, token) => {
                if (!err && token) {
                    var credentials = new msRest.TokenCredentials(token);
                    credentials.signRequest(webResource, callback);
                } else {
                    callback(err);
                }
            });
        } else {
            callback(null);
        }
    }

    getAccessToken(callback) {
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
                        callback(null, this.accessToken);
                    } else {
                        callback(new Error('Refresh access token failed with status code: ' + response.statusCode), null);
                    }
                } else {
                    callback(err, null);
                }
            });
        } else {
            callback(null, this.accessToken);
        }
    }
}

MicrosoftAppCredentials.refreshEndpoint = settings.AuthSettings.refreshEndpoint;
MicrosoftAppCredentials.refreshScope = settings.AuthSettings.refreshScope;

exports.MicrosoftAppCredentials = MicrosoftAppCredentials;