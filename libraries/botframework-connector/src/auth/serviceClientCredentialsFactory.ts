// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ServiceClientCredentials } from '@azure/ms-rest-js';

/**
 * The ServiceClientCredentialsFactory abstract class that allows Bots to provide their own
 * ServiceClientCredentials for bot to bot channel or skill bot to parent bot calls.
 */
export abstract class ServiceClientCredentialsFactory {
    /**
     * Validates an app ID.
     *
     * @param appId The app ID to validate.
     */
    abstract isValidAppId(appId: string): Promise<boolean>;

    /**
     * Checks whether bot authentication is disabled.
     */
    abstract isAuthenticationDisabled(): Promise<boolean>;

    /**
     * A factory method for creating ServiceClientCredentials.
     *
     * @param appId The appId.
     * @param audience The audience.
     * @param loginEndpoint The login url.
     * @param validateAuthority The validate authority vale to use.
     */
    abstract createCredentials(
        appId: string,
        audience: string,
        loginEndpoint: string,
        validateAuthority: boolean
    ): Promise<ServiceClientCredentials>;
}
