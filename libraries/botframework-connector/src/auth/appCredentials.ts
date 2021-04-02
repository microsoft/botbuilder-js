/**
 * @module botframework-connector
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import * as msrest from '@azure/ms-rest-js';
import * as url from 'url';
import * as adal from 'adal-node';
// import * as msal from '@azure/msal-node';
import { AuthenticationResult } from '@azure/msal-node';
import { AuthenticationConstants } from './authenticationConstants';

export type AuthResult = AuthenticationResult | adal.TokenResponse;

/**
 * General AppCredentials auth implementation and cache. Supports any MSAL client credential flow.
 * Subclasses can implement refreshToken to acquire the token.
 * 
 * Note: previously this class supported ADAL auth flows, however due to the library's deprecation,
 * this class continues to have ADAL-related methods, but they are now deprecated.
 */
export abstract class AppCredentials implements msrest.ServiceClientCredentials {
    private static readonly cache: Map<string, AuthResult> = new Map<string, AuthResult>();

    public appId: string;

    private _oAuthEndpoint: string;
    private _oAuthScope: string;
    private _tenant: string;
    public tokenCacheKey: string;
    protected refreshingToken: Promise<adal.TokenResponse> | null = null;
    protected authenticationContext: adal.AuthenticationContext;

    /**
     * Initializes a new instance of the [AppCredentials](xref:botframework-connector.AppCredentials) class.
     * @param appId The App ID.
     * @param channelAuthTenant Optional. The oauth token tenant.
     * @param oAuthScope The scope for the token.
     */
    public constructor(
        appId: string,
        channelAuthTenant?: string,
        oAuthScope: string = AuthenticationConstants.ToBotFromChannelTokenIssuer
    ) {
        this.appId = appId;
        this.tenant = channelAuthTenant;
        this.oAuthEndpoint = AuthenticationConstants.ToChannelFromBotLoginUrlPrefix + this.tenant;
        this.oAuthScope = oAuthScope;
    }

    /**
     * Gets tenant to be used for channel authentication.
     */
    private get tenant(): string {
        return this._tenant;
    }

    /**
     * Sets tenant to be used for channel authentication.
     */
    private set tenant(value: string) {
        this._tenant = value && value.length > 0 ? value : AuthenticationConstants.DefaultChannelAuthTenant;
    }

    /**
     * Gets the OAuth scope to use.
     */
    public get oAuthScope(): string {
        return this._oAuthScope;
    }

    /**
     * Sets the OAuth scope to use.
     */
    public set oAuthScope(value: string) {
        this._oAuthScope = value;
        this.tokenCacheKey = `${this.appId}${this.oAuthScope}-cache`;
    }

    /**
     * Gets the OAuth endpoint to use.
     */
    public get oAuthEndpoint(): string {
        return this._oAuthEndpoint;
    }

    /**
     * Sets the OAuth endpoint to use.
     */
    public set oAuthEndpoint(value: string) {
        // aadApiVersion is set to '1.5' to avoid the "spn:" concatenation on the audience claim
        // For more info, see https://github.com/AzureAD/azure-activedirectory-library-for-nodejs/issues/128
        this._oAuthEndpoint = value;
        this.authenticationContext = new adal.AuthenticationContext(value, true, undefined, '1.5');
    }

    /**
     * Adds the host of service url to trusted hosts.
     * If expiration time is not provided, the expiration date will be current (utc) date + 1 day.
     *
     * @deprecated
     *
     * @param  {string} serviceUrl The service url
     * @param  {Date} expiration? The expiration date after which this service url is not trusted anymore
     */
    public static trustServiceUrl(serviceUrl: string, expiration?: Date): void;
    public static trustServiceUrl(): void {
        // no-op
    }

    /**
     * Checks if the service url is for a trusted host or not.
     *
     * @deprecated
     *
     * @param  {string} serviceUrl The service url
     * @returns {boolean} True if the host of the service url is trusted; False otherwise.
     */
    public static isTrustedServiceUrl(serviceUrl: string): boolean;
    public static isTrustedServiceUrl(): boolean {
        return true;
    }

    /**
     * Apply the credentials to the HTTP request.
     * @param webResource The WebResource HTTP request.
     * @returns A Promise representing the asynchronous operation.
     */
    public async signRequest(webResource: msrest.WebResource): Promise<msrest.WebResource> {
        if (this.shouldSetToken()) {
            return new msrest.TokenCredentials(await this.getToken()).signRequest(webResource);
        }

        return webResource;
    }

    /**
     * Gets an OAuth access token.
     * @param forceRefresh True to force a refresh of the token; or false to get
     * a cached token if it exists.
     * @returns A Promise that represents the work queued to execute.
     * @remarks If the promise is successful, the result contains the access token string.
     */
    public async getToken(forceRefresh = false): Promise<string> {
        if (!forceRefresh) {
            // check the global cache for the token. If we have it, and it's valid, we're done.
            const oAuthRes: AuthResult = AppCredentials.cache.get(this.tokenCacheKey);
            if (oAuthRes) {
                // we have the token. Is it valid?
                if (this.getExpirationTime(oAuthRes) > Date.now()) {
                    return oAuthRes.accessToken;
                }
            }
        }

        // We need to refresh the token, because:
        // 1. The user requested it via the forceRefresh parameter
        // 2. We have it, but it's expired
        // 3. We don't have it in the cache.
        // const res: adal.TokenResponse = await this.refreshToken();
        // const res: AuthResult = await this.refreshToken();
        // I think the option we go with is make a refreshTokenWithMsal() method and leave refreshToken() alone, since it's protected, and customers may have already derived from it
        const res: AuthenticationResult = await this.refreshToken2(); 
        
        if (res && res.accessToken) {
            AppCredentials.cache.set(this.tokenCacheKey, res);

            return res.accessToken;
        } else {
            throw new Error('Authentication: No response or error received from ADAL.');
        }
    }

    protected abstract refreshToken(): Promise<adal.TokenResponse>;

    // TODO - rename method
    protected abstract refreshToken2(): Promise<AuthenticationResult>;


    /**
     * @private
     */
    private shouldSetToken(): boolean {
        return this.appId && this.appId !== AuthenticationConstants.AnonymousSkillAppId;
    }

    /**
     * Get the expiration time of the access token. 
     * The expiration time subtracts 5 minutes from actual expiration time
     * to allow a buffer and ensure we request a new token before the current one expires.
     * 
     * @private
     * @param res
     * @returns 
     */
    private getExpirationTime(res: AuthResult): number {
        if (this.isMsalAuthenticationResult(res)) {
            return res.expiresOn.getTime() - 300000;
        }

        if (this.isAdalTokenResponse(res)) {
            return Date.now() + res.expiresIn * 1000 - 300000;
        }

        return 0;
    }

    private isMsalAuthenticationResult(obj: any): obj is AuthenticationResult {
        return (obj.accessToken && obj.authority) ? true : false;
    }

    private isAdalTokenResponse(obj: any): obj is adal.TokenResponse {
        return (obj.accessToken && obj.expiresIn) ? true : false;
    }
}
