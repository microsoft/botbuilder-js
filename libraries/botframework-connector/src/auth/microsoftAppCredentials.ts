/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import * as url from 'url';
import * as msrest from 'ms-rest-js';
import * as request from 'request';
import { Constants } from './constants';

/**
 * MicrosoftAppCredentials auth implementation and cache
 */
export class MicrosoftAppCredentials implements msrest.ServiceClientCredentials {

    private static readonly trustedHostNames: Map<string, Date> = new Map<string, Date>([
        ['state.botframework.com', new Date(8640000000000000)]              // Date.MAX_VALUE
    ]);

    private static readonly cache: Map<string, OAuthResponse> = new Map<string, OAuthResponse>();

    appPassword: string;
    appId: string;

    readonly oAuthEndpoint: string = Constants.ToChannelFromBotLoginUrl;
    readonly oAuthScope: string = Constants.ToChannelFromBotOAuthScope;
    readonly tokenCacheKey: string;
    private refreshingToken: Promise<OAuthResponse> | null = null;

    constructor(appId: string, appPassword: string) {
        this.appId = appId;
        this.appPassword = appPassword;
        this.tokenCacheKey = `${appId}-cache`;
    }

    async signRequest(webResource: msrest.WebResource): Promise<msrest.WebResource> {
        if (this.shouldSetToken(webResource)) {
            let token = await this.getToken();
            return new msrest.TokenCredentials(token).signRequest(webResource);
        }

        return webResource;
    }

    async getToken(forceRefresh: boolean = false): Promise<string> {
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
        let oAuthToken = await this.refreshToken();
        MicrosoftAppCredentials.cache.set(this.tokenCacheKey, oAuthToken);
        return oAuthToken.access_token;
    }

    private refreshToken(): Promise<OAuthResponse> {
        if (!this.refreshingToken) {
            this.refreshingToken = new Promise<OAuthResponse>((resolve, reject) => {
                // Refresh access token
                var opt: request.Options = {
                    method: 'POST',
                    url: this.oAuthEndpoint,
                    form: {
                        grant_type: 'client_credentials',
                        client_id: this.appId,
                        client_secret: this.appPassword,
                        scope: this.oAuthScope
                    }
                };

                request(opt, (err: any, response: any, body: any) => {
                    this.refreshingToken = null;
                    if (!err) {
                        if (body && response.statusCode && response.statusCode < 300) {
                            // Subtract 5 minutes from expires_in so they'll we'll get a
                            // new token before it expires.
                            var oauthResponse = <OAuthResponse>JSON.parse(body);
                            oauthResponse.expiration_time = new Date(Date.now() + (oauthResponse.expires_in * 1000) - 300000);
                            resolve(oauthResponse);
                        } else {
                            reject(new Error('Refresh access token failed with status code: ' + response.statusCode));
                        }
                    } else {
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
    static trustServiceUrl(serviceUrl: string, expiration?: Date): void {
        if (!expiration) {
            expiration = new Date(Date.now() + 86400000);  // 1 day
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
    static isTrustedServiceUrl(serviceUrl: string): boolean {
        try {
            var uri = url.parse(serviceUrl);
            if (uri.host) {
                return MicrosoftAppCredentials.isTrustedUrl(uri.host);
            }
        } catch(e) {
        }

        return false;
    }

    private shouldSetToken(webResource: msrest.WebResource) {
        return MicrosoftAppCredentials.isTrustedServiceUrl(webResource.url);
    }

    private static isTrustedUrl(url: string): boolean {
        let expiration = MicrosoftAppCredentials.trustedHostNames.get(url)
        if (expiration) {
            // check if the trusted service url is still valid
            return expiration.getTime() > (Date.now() - 300000)  // 5 Minutes
        }

        return false;
    }
}

/**
 * Member variables to this class follow the RFC Naming conventions, rather than C# naming conventions.
 */
interface OAuthResponse {
    token_type: string;
    expires_in: number;
    access_token: string;
    expiration_time: Date;
}