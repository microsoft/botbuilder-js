/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import * as msrest from 'ms-rest-js';
import * as request from 'request';
import * as url from 'url';
import { Constants } from './constants';

/**
 * MicrosoftAppCredentials auth implementation and cache
 */
export class MicrosoftAppCredentials implements msrest.ServiceClientCredentials {

    private static readonly trustedHostNames: Map<string, Date> = new Map<string, Date>([
        ['state.botframework.com', new Date(8640000000000000)],              // Date.MAX_VALUE,
        ['api.botframework.com', new Date(8640000000000000)]                 // Date.MAX_VALUE,
    ]);

    private static readonly cache: Map<string, OAuthResponse> = new Map<string, OAuthResponse>();

    public appPassword: string;
    public appId: string;

    public readonly oAuthEndpoint: string = Constants.ToChannelFromBotLoginUrl;
    public readonly oAuthScope: string = Constants.ToChannelFromBotOAuthScope;
    public readonly tokenCacheKey: string;
    private refreshingToken: Promise<OAuthResponse> | null = null;

    constructor(appId: string, appPassword: string) {
        this.appId = appId;
        this.appPassword = appPassword;
        this.tokenCacheKey = `${appId}-cache`;
    }

    /**
     * Adds the host of service url to trusted hosts.
     * If expiration time is not provided, the expiration date will be current (utc) date + 1 day.
     * @param  {string} serviceUrl The service url
     * @param  {Date} expiration? The expiration date after which this service url is not trusted anymore
     */
    public static trustServiceUrl(serviceUrl: string, expiration?: Date): void {
        if (!expiration) {
            expiration = new Date(Date.now() + 86400000);  // 1 day
        }

        const uri: url.Url = url.parse(serviceUrl);
        if (uri.host) {
            MicrosoftAppCredentials.trustedHostNames.set(uri.host, expiration);
        }
    }

    /**
     * Checks if the service url is for a trusted host or not.
     * @param  {string} serviceUrl The service url
     * @returns {boolean} True if the host of the service url is trusted; False otherwise.
     */
    public static isTrustedServiceUrl(serviceUrl: string): boolean {
        try {
            const uri: url.Url = url.parse(serviceUrl);
            if (uri.host) {
                return MicrosoftAppCredentials.isTrustedUrl(uri.host);
            }
        } catch (e) {
            console.error('Error in isTrustedServiceUrl', e);
        }

        return false;
    }

    private static isTrustedUrl(uri: string): boolean {
        const expiration: Date = MicrosoftAppCredentials.trustedHostNames.get(uri);
        if (expiration) {
            // check if the trusted service url is still valid
            return expiration.getTime() > (Date.now() - 300000); // 5 Minutes
        }

        return false;
    }

    public async signRequest(webResource: msrest.WebResource): Promise<msrest.WebResource> {
        if (this.shouldSetToken(webResource)) {
            const token: string = await this.getToken();

            return new msrest.TokenCredentials(token).signRequest(webResource);
        }

        return webResource;
    }

    public async getToken(forceRefresh: boolean = false): Promise<string> {
        if (!forceRefresh) {
            // check the global cache for the token. If we have it, and it's valid, we're done.
            const oAuthToken: OAuthResponse = MicrosoftAppCredentials.cache.get(this.tokenCacheKey);
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
        const newOAuthToken: OAuthResponse = await this.refreshToken();
        MicrosoftAppCredentials.cache.set(this.tokenCacheKey, newOAuthToken);

        return newOAuthToken.access_token;
    }

    private refreshToken(): Promise<OAuthResponse> {
        if (!this.refreshingToken) {
            this.refreshingToken = new Promise<OAuthResponse>((resolve: any, reject: any): void => {
                // Refresh access token
                const opt: request.Options = {
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
                            const oauthResponse: OAuthResponse = <OAuthResponse>JSON.parse(body);
                            oauthResponse.expiration_time = new Date(Date.now() + (oauthResponse.expires_in * 1000) - 300000);
                            resolve(oauthResponse);
                        } else {
                            reject(new Error(`Refresh access token failed with status code: ${ response.statusCode }`));
                        }
                    } else {
                        reject(err);
                    }
                });
            }).catch((err: Error) => {
                this.refreshingToken = null;
                throw err;
            });
        }

        return this.refreshingToken;
    }

    private shouldSetToken(webResource: msrest.WebResource): boolean {
        return MicrosoftAppCredentials.isTrustedServiceUrl(webResource.url);
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
