import * as msrest from 'ms-rest';
import * as request from 'request';
import { AuthSettings, BotCredentials } from './settings';

export class MicrosoftAppCredentials implements msrest.ServiceClientCredentials {

    private static refreshEndpoint: string = AuthSettings.refreshEndpoint;
    private static refreshScope: string = AuthSettings.refreshScope;

    private accessToken = '';
    private accessTokenExpires: number;
    private appId = '';
    private appPassword = '';

    public constructor(credentials: BotCredentials) {
        if (typeof credentials !== 'undefined') {
            if (typeof credentials.appId !== 'undefined') {
                this.appId = credentials.appId;
            }

            if (typeof credentials.appPassword !== 'undefined') {
                this.appPassword = credentials.appPassword;
            }
        }
    }

    public signRequest(webResource: msrest.WebResource, cb: { (err: Error): void }): void {
        if (this.appId !== '' && this.appPassword !== '') {
            this.getAccessToken((err, token) => {
                if (!err && token) {
                    const tokenCredentials = new msrest.TokenCredentials(token);
                    tokenCredentials.signRequest(webResource, cb);
                } else {
                    cb(err);
                }
            });

        } else {
            cb(null);
        }
    }

    private getAccessToken(cb: (err: Error, accessToken: string) => void): void {
        if (!this.accessToken || new Date().getTime() >= this.accessTokenExpires) {
            // Refresh access token
            const opt: request.Options = {
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
                        // Subtract 5 minutes from expires_in so they'll we'll get a
                        // new token before it expires.
                        const oauthResponse = JSON.parse(body);
                        this.accessToken = oauthResponse.access_token;
                        this.accessTokenExpires = new Date().getTime() + ((oauthResponse.expires_in - 300) * 1000);
                        cb(null, this.accessToken);
                    } else {
                        cb(new Error('Refresh access token failed with status code: ' + response.statusCode), null);
                    }
                } else {
                    cb(err, null);
                }
            });
        } else {
            cb(null, this.accessToken);
        }
    }

}
