/**
 * @module botframework-connector
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { ServiceClientCredentialsFactory } from './serviceClientCredentialsFactory';

/**
 * CredentialProvider interface. This interface allows Bots to provide their own
 * implementation of what is, and what is not, a valid appId and password. This is
 * useful in the case of multi-tenant bots, where the bot may need to call
 * out to a service to determine if a particular appid/password pair
 * is valid.
 *
 * For Single Tenant bots (the vast majority) the simple static providers
 * are sufficient.
 */
export interface ICredentialProvider {
    /**
     * Validate AppId.
     *
     * This method is async to enable custom implementations
     * that may need to call out to serviced to validate the appId / password pair.
     *
     * @param {string} appId bot appid
     * @returns {Promise<boolean>} true if it is a valid AppId
     */
    isValidAppId(appId: string): Promise<boolean>;

    /**
     * Get the app password for a given bot appId, if it is not a valid appId, return Null
     *
     * This method is async to enable custom implementations
     * that may need to call out to serviced to validate the appId / password pair.
     *
     * @param {string} appId bot appid
     * @returns {Promise<string|null>} password or null for invalid appid
     */
    getAppPassword(appId: string): Promise<string | null>;

    /**
     * Checks if bot authentication is disabled.
     * Return true if bot authentication is disabled.
     *
     * This method is async to enable custom implementations
     * that may need to call out to serviced to validate the appId / password pair.
     *
     * @returns {Promise<boolean>} true if bot authentication is disabled.
     */
    isAuthenticationDisabled(): Promise<boolean>;
}

/**
 * A simple implementation of the [ICredentialProvider](xref:botframework-connector.ICredentialProvider) interface.
 */
export class SimpleCredentialProvider implements ICredentialProvider {
    private readonly appId: string;
    private readonly appPassword: string;

    /**
     * Initializes a new instance of the [SimpleCredentialProvider](xref:botframework-connector.SimpleCredentialProvider) class with the provided credentials.
     *
     * @param {string} appId The app ID.
     * @param {string} appPassword The app password.
     */
    constructor(appId: string, appPassword: string) {
        this.appId = appId;
        this.appPassword = appPassword;
    }

    /**
     * Validate AppId.
     *
     * This method is async to enable custom implementations
     * that may need to call out to service to validate the appId / password pair.
     *
     * @param {string} appId bot appid
     * @returns {Promise<boolean>} true if it is a valid AppId
     */
    public isValidAppId(appId: string): Promise<boolean> {
        return Promise.resolve(this.appId === appId);
    }

    /**
     * Get the app password for a given bot appId, if it is not a valid appId, return Null
     *
     * This method is async to enable custom implementations
     * that may need to call out to serviced to validate the appId / password pair.
     *
     * @param {string} appId bot appid
     * @returns {Promise<string|null>} password or null for invalid appid
     */
    public getAppPassword(appId: string): Promise<string | null> {
        return Promise.resolve(this.appId === appId ? this.appPassword : null);
    }

    /**
     * Checks if bot authentication is disabled.
     * Return true if bot authentication is disabled.
     *
     * This method is async to enable custom implementations
     * that may need to call out to serviced to validate the appId / password pair.
     *
     * @returns {Promise<boolean>} true if bot authentication is disabled.
     */
    public isAuthenticationDisabled(): Promise<boolean> {
        return Promise.resolve(!this.appId);
    }
}

// Delegate credential provider implementation to a credential factory.
export class DelegatingCredentialProvider implements ICredentialProvider {
    constructor(private readonly credentialFactory: ServiceClientCredentialsFactory) {}

    /**
     * Not implemented for this provider.
     *
     * @returns {Promise<string>} a promise that resolves to an app password
     */
    async getAppPassword(): Promise<string> {
        return Promise.reject(new Error('Method not implemented.'));
    }

    /**
     * Check if an app ID is valid.
     *
     * @param {string} appId the app ID to check
     * @returns {Promise<boolean>} a promise that resolves to true if the app ID is valid
     */
    isValidAppId(appId: string): Promise<boolean> {
        return this.credentialFactory.isValidAppId(appId);
    }

    /**
     * Check if authentication is disabled.
     *
     * @returns {Promise<boolean>} a promise that resolves to true if authentication is disabled
     */
    isAuthenticationDisabled(): Promise<boolean> {
        return this.credentialFactory.isAuthenticationDisabled();
    }
}
