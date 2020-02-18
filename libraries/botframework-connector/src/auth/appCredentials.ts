/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import * as msrest from '@azure/ms-rest-js';
import * as url from 'url';
import * as adal from 'adal-node'
import { AuthenticationConstants } from './authenticationConstants';

/**
 * General AppCredentials auth implementation and cache. Supports any ADAL client credential flow.
 * Subclasses can implement refreshToken to acquire the token.
 */
export abstract class AppCredentials implements msrest.ServiceClientCredentials {

    private static readonly trustedHostNames: Map<string, Date> = new Map<string, Date>([
        ['state.botframework.com', new Date(8640000000000000)],              // Date.MAX_VALUE,
        ['api.botframework.com', new Date(8640000000000000)],                // Date.MAX_VALUE,
        ['token.botframework.com', new Date(8640000000000000)],              // Date.MAX_VALUE,
        ['state.botframework.azure.us', new Date(8640000000000000)],         // Date.MAX_VALUE,
        ['api.botframework.azure.us', new Date(8640000000000000)],           // Date.MAX_VALUE,
        ['token.botframework.azure.us', new Date(8640000000000000)],         // Date.MAX_VALUE,
    ]);

    private static readonly cache: Map<string, adal.TokenResponse> = new Map<string, adal.TokenResponse>();

    public appId: string;

    public oAuthEndpoint: string;
    private _oAuthScope: string;
    public tokenCacheKey: string;
    protected refreshingToken: Promise<adal.TokenResponse> | null = null;
    protected readonly authenticationContext: adal.AuthenticationContext;

    constructor(appId: string, channelAuthTenant?: string, oAuthScope: string = AuthenticationConstants.ToBotFromChannelTokenIssuer) {
        this.appId = appId;
        const tenant = channelAuthTenant && channelAuthTenant.length > 0
            ? channelAuthTenant
            : AuthenticationConstants.DefaultChannelAuthTenant;
        this.oAuthEndpoint = AuthenticationConstants.ToChannelFromBotLoginUrlPrefix + tenant;
        this.oAuthScope = oAuthScope;
        // aadApiVersion is set to '1.5' to avoid the "spn:" concatenation on the audience claim
        // For more info, see https://github.com/AzureAD/azure-activedirectory-library-for-nodejs/issues/128
        this.authenticationContext = new adal.AuthenticationContext(this.oAuthEndpoint, true, undefined, '1.5');
    }

    public get oAuthScope(): string {
        return this._oAuthScope
    }

    public set oAuthScope(value: string) {
        this._oAuthScope = value;
        this.tokenCacheKey = `${ this.appId }${ this.oAuthScope }-cache`;
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
            AppCredentials.trustedHostNames.set(uri.host, expiration);
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
                return AppCredentials.isTrustedUrl(uri.host);
            }
        } catch (e) {
            // tslint:disable-next-line:no-console
            console.error('Error in isTrustedServiceUrl', e);
        }

        return false;
    }

    private static isTrustedUrl(uri: string): boolean {
        const expiration: Date = AppCredentials.trustedHostNames.get(uri);
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
            const oAuthToken: adal.TokenResponse = AppCredentials.cache.get(this.tokenCacheKey);
            if (oAuthToken) {
                // we have the token. Is it valid?
                if (oAuthToken.expirationTime > Date.now()) {
                    return oAuthToken.accessToken;
                }
            }
        }

        // We need to refresh the token, because:
        // 1. The user requested it via the forceRefresh parameter
        // 2. We have it, but it's expired
        // 3. We don't have it in the cache.
        const res: adal.TokenResponse = await this.refreshToken();
        this.refreshingToken = null;

        if (res && res.accessToken) {          
            // `res` is equalivent to the results from the cached promise `this.refreshingToken`.
            // Because the promise has been cached, we need to see if the body has been read.
            // If the body has not been read yet, we can call res.json() to get the access_token.
            // If the body has been read, the OAuthResponse for that call should have been cached already,
            // in which case we can return the cache from there. If a cached OAuthResponse does not exist,
            // call getToken() again to retry the authentication process.

            // Subtract 5 minutes from expires_in so they'll we'll get a
            // new token before it expires.
            res.expirationTime = Date.now() + (res.expiresIn * 1000) - 300000;
            AppCredentials.cache.set(this.tokenCacheKey, res);
            return res.accessToken;
        } else {
            throw new Error('Authentication: No response or error received from ADAL.');
        }

    }

    protected abstract async refreshToken(): Promise<adal.TokenResponse>;

    private shouldSetToken(webResource: msrest.WebResource): boolean {
        return AppCredentials.isTrustedServiceUrl(webResource.url);
    }
}