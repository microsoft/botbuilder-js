/**
 * @module botframework-connector
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { ConfidentialClientApplication } from '@azure/msal-node';
import { ServiceClientCredentials, WebResource } from '@azure/core-http';
import { TokenCredentials } from './tokenCredentials';
import { AuthenticationConstants } from './authenticationConstants';
import { AuthenticatorResult } from './authenticatorResult';

/**
 * General AppCredentials auth implementation and cache.
 * Subclasses can implement refreshToken to acquire the token.
 */
export abstract class AppCredentials implements ServiceClientCredentials {
    private static readonly cache: Map<string, AuthenticatorResult> = new Map<string, AuthenticatorResult>();

    appId: string;

    private _oAuthEndpoint: string;
    private _oAuthScope: string;
    private _tenant: string;
    tokenCacheKey: string;
    protected clientApplication: ConfidentialClientApplication;

    // Protects against JSON.stringify leaking secrets
    private toJSON(): unknown {
        return {
            name: this.constructor.name,
            appId: this.appId,
            tenant: this.tenant,
            oAuthEndpoint: this.oAuthEndpoint,
            oAuthScope: this.oAuthScope,
        };
    }

    /**
     * Initializes a new instance of the [AppCredentials](xref:botframework-connector.AppCredentials) class.
     *
     * @param appId The App ID.
     * @param channelAuthTenant Tenant ID of the Azure AD tenant where the bot is created.
     *   * Required for SingleTenant app types.
     *   * Optional for MultiTenant app types. **Note**: '_botframework.com_' is the default tenant when no value is provided.
     *
     * More information: https://learn.microsoft.com/en-us/security/zero-trust/develop/identity-supported-account-types.
     * @param oAuthScope The scope for the token.
     */
    constructor(appId: string, channelAuthTenant?: string, oAuthScope: string = null) {
        this.appId = appId;
        this.tenant = channelAuthTenant;
        this.oAuthEndpoint = this.GetToChannelFromBotLoginUrlPrefix() + this.tenant;
        this.oAuthScope = oAuthScope && oAuthScope.length > 0 ? oAuthScope : this.GetToChannelFromBotOAuthScope();
    }

    /**
     * Gets tenant to be used for channel authentication.
     *
     * @returns The channel auth token tenant for this credential.
     */
    private get tenant(): string {
        return this._tenant;
    }

    /**
     * Sets tenant to be used for channel authentication.
     */
    private set tenant(value: string) {
        this._tenant = value && value.length > 0 ? value : this.GetDefaultChannelAuthTenant();
    }

    /**
     * Gets the OAuth scope to use.
     *
     * @returns The OAuth scope to use.
     */
    get oAuthScope(): string {
        return this._oAuthScope;
    }

    /**
     * Sets the OAuth scope to use.
     */
    set oAuthScope(value: string) {
        this._oAuthScope = value;
        this.tokenCacheKey = `${this.appId}${this.oAuthScope}-cache`;
    }

    /**
     * Gets the OAuth endpoint to use.
     *
     * @returns The OAuthEndpoint to use.
     */
    get oAuthEndpoint(): string {
        return this._oAuthEndpoint;
    }

    /**
     * Sets the OAuth endpoint to use.
     */
    set oAuthEndpoint(value: string) {
        // aadApiVersion is set to '1.5' to avoid the "spn:" concatenation on the audience claim
        // For more info, see https://github.com/AzureAD/azure-activedirectory-library-for-nodejs/issues/128
        this._oAuthEndpoint = value;
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
    static trustServiceUrl(serviceUrl: string, expiration?: Date): void;
    /**
     * Adds the host of service url to trusted hosts.
     * If expiration time is not provided, the expiration date will be current (utc) date + 1 day.
     */
    static trustServiceUrl(): void {
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
    static isTrustedServiceUrl(serviceUrl: string): boolean;
    /**
     * Checks if the service url is for a trusted host or not.
     *
     * @returns {boolean} True if the host of the service url is trusted; False otherwise.
     */
    static isTrustedServiceUrl(): boolean {
        return true;
    }

    /**
     * Apply the credentials to the HTTP request.
     *
     * @param webResource The WebResource HTTP request.
     * @returns A Promise representing the asynchronous operation.
     */
    async signRequest(webResource: WebResource): Promise<WebResource> {
        if (this.shouldSetToken()) {
            return new TokenCredentials(await this.getToken()).signRequest(webResource);
        }

        return webResource;
    }

    /**
     * Gets an OAuth access token.
     *
     * @param forceRefresh True to force a refresh of the token; or false to get
     * a cached token if it exists.
     * @returns A Promise that represents the work queued to execute.
     * @remarks If the promise is successful, the result contains the access token string.
     */
    async getToken(forceRefresh = false): Promise<string> {
        if (!forceRefresh) {
            // check the global cache for the token. If we have it, and it's valid, we're done.
            const oAuthToken = AppCredentials.cache.get(this.tokenCacheKey);
            // Check if the token is not expired.
            if (oAuthToken && oAuthToken.expiresOn > new Date()) {
                return oAuthToken.accessToken;
            }
        }

        // We need to refresh the token, because:
        // 1. The user requested it via the forceRefresh parameter
        // 2. We have it, but it's expired
        // 3. We don't have it in the cache.
        const res = await this.refreshToken();

        if (res && res.accessToken) {
            // Subtract 5 minutes from expiresOn so they'll we'll get a new token before it expires.
            res.expiresOn.setMinutes(res.expiresOn.getMinutes() - 5);
            AppCredentials.cache.set(this.tokenCacheKey, res);
            return res.accessToken;
        } else {
            throw new Error('Authentication: No response or error received from MSAL.');
        }
    }

    protected GetToChannelFromBotOAuthScope(): string {
        return AuthenticationConstants.ToChannelFromBotOAuthScope;
    }

    protected GetToChannelFromBotLoginUrlPrefix(): string {
        return AuthenticationConstants.ToChannelFromBotLoginUrlPrefix;
    }

    protected GetDefaultChannelAuthTenant(): string {
        return AuthenticationConstants.DefaultChannelAuthTenant;
    }

    protected abstract refreshToken(): Promise<AuthenticatorResult>;

    /**
     * @private
     */
    private shouldSetToken(): boolean {
        return this.appId && this.appId !== AuthenticationConstants.AnonymousSkillAppId;
    }
}
