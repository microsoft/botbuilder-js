// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ServiceClientCredentials } from '@azure/ms-rest-js';

export abstract class ServiceClientCredentialsFactory {
    abstract isValidAppId(appId: string): Promise<boolean>;

    abstract isAuthenticationDisabled(): Promise<boolean>;

    abstract createCredentials(
        appId: string,
        oauthScope: string,
        loginEndpoint: string,
        validateAuthority: boolean
    ): Promise<ServiceClientCredentials>;
}
