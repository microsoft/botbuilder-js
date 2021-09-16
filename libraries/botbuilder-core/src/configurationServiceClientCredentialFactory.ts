// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as z from 'zod';
import assert from 'assert';
import { Configuration } from 'botbuilder-dialogs-adaptive-runtime-core';
import {
    ManagedIdentityServiceClientCredentialsFactory,
    JwtTokenProviderFactory,
    PasswordServiceClientCredentialFactory,
    ServiceClientCredentialsFactory,
} from 'botframework-connector';

import type { ServiceClientCredentials } from '@azure/ms-rest-js';

const MultiTenant = 'MultiTenant';
const SingleTenant = 'SingleTenant';
const UserAssignedMsi = 'UserAssignedMsi';

const TypedConfig = z
    .object({
        /**
         * The ID assigned to your bot in the [Bot Framework Portal](https://dev.botframework.com/).
         */
        MicrosoftAppId: z.string(),

        /**
         * The password assigned to your bot in the [Bot Framework Portal](https://dev.botframework.com/).
         */
        MicrosoftAppPassword: z.string(),

        /**
         * The type of app id assigned to your bot in the [Bot Framework Portal](https://dev.botframework.com/).
         */
        MicrosoftAppType: z.enum([MultiTenant, SingleTenant, UserAssignedMsi]),

        /**
         * The tenant id assigned to your bot in the [Bot Framework Portal](https://dev.botframework.com/).
         */
        MicrosoftAppTenantId: z.string(),
    })
    .partial();

/**
 * Contains settings used to configure a [ConfigurationServiceClientCredentialFactory](xref:botbuilder-core.ConfigurationServiceClientCredentialFactory) instance.
 */
export type ConfigurationServiceClientCredentialFactoryOptions = z.infer<typeof TypedConfig>;

/**
 * ServiceClientCredentialsFactory that uses a [ConfigurationServiceClientCredentialFactoryOptions](xref:botbuilder-core.ConfigurationServiceClientCredentialFactoryOptions) or a [Configuration](xref:botbuilder-dialogs-adaptive-runtime-core.Configuration) instance to build ServiceClientCredentials with an AppId and App Password.
 */
export class ConfigurationServiceClientCredentialFactory extends PasswordServiceClientCredentialFactory {
    private readonly inner: ServiceClientCredentialsFactory;

    /**
     * Initializes a new instance of the [ConfigurationServiceClientCredentialFactory](xref:botbuilder-core.ConfigurationServiceClientCredentialFactory) class.
     *
     * @param factoryOptions A [ConfigurationServiceClientCredentialFactoryOptions](xref:botbuilder-core.ConfigurationServiceClientCredentialFactoryOptions) object.
     */
    constructor(factoryOptions: ConfigurationServiceClientCredentialFactoryOptions = {}) {
        // Exclude MicrosoftAppType from Zod to ignore-casing comparison.
        // .NET code:
        // https://github.com/microsoft/botbuilder-dotnet/blob/d84c6a1f76a56dbee0d18a16adf5d678e5b30035/libraries/integration/Microsoft.Bot.Builder.Integration.AspNet.Core/ConfigurationServiceClientCredentialFactory.cs#L53-L55
        const { MicrosoftAppType, ...options } = factoryOptions;

        const {
            MicrosoftAppId = null,
            MicrosoftAppPassword = null,
            MicrosoftAppTenantId = null,
        } = TypedConfig.nonstrict().parse(options);
        super(MicrosoftAppId, MicrosoftAppPassword, MicrosoftAppTenantId);

        const appType = MicrosoftAppType || MultiTenant;

        switch (appType.toLocaleLowerCase()) {
            case UserAssignedMsi.toLocaleLowerCase():
                assert(MicrosoftAppId?.trim(), 'MicrosoftAppId is required for MSI in configuration.');
                assert(MicrosoftAppTenantId?.trim(), 'MicrosoftAppTenantId is required for MSI in configuration.');
                assert(!MicrosoftAppPassword?.trim(), 'MicrosoftAppPassword must not be set for MSI in configuration.');

                this.inner = new ManagedIdentityServiceClientCredentialsFactory(
                    MicrosoftAppId,
                    new JwtTokenProviderFactory()
                );
                break;
            case SingleTenant.toLocaleLowerCase():
                assert(MicrosoftAppId?.trim(), 'MicrosoftAppId is required for SingleTenant in configuration.');
                assert(
                    MicrosoftAppPassword?.trim(),
                    'MicrosoftAppPassword is required for SingleTenant in configuration.'
                );
                assert(
                    MicrosoftAppTenantId?.trim(),
                    'MicrosoftAppTenantId is required for SingleTenant in configuration.'
                );

                this.inner = new PasswordServiceClientCredentialFactory(
                    MicrosoftAppId,
                    MicrosoftAppPassword,
                    MicrosoftAppTenantId
                );
                break;
            default:
                //MultiTenant
                this.inner = new PasswordServiceClientCredentialFactory(MicrosoftAppId, MicrosoftAppPassword, '');
                break;
        }
    }

    /**
     * @inheritdoc
     */
    isValidAppId(microsoftAppId: string): Promise<boolean> {
        return this.inner.isValidAppId(microsoftAppId);
    }

    /**
     * @inheritdoc
     */
    isAuthenticationDisabled(): Promise<boolean> {
        return this.inner.isAuthenticationDisabled();
    }

    /**
     * @inheritdoc
     */
    createCredentials(
        microsoftAppId: string,
        audience: string,
        loginEndpoint: string,
        validateAuthority: boolean
    ): Promise<ServiceClientCredentials> {
        return this.inner.createCredentials(microsoftAppId, audience, loginEndpoint, validateAuthority);
    }
}

/**
 * Creates a new instance of the [ConfigurationServiceClientCredentialFactory](xref:botbuilder-core.ConfigurationServiceClientCredentialFactory) class.
 *
 * @remarks
 * The [Configuration](xref:botbuilder-dialogs-adaptive-runtime-core.Configuration) instance provided to the constructor should
 * have the desired authentication values available at the root, using the properties of [ConfigurationServiceClientCredentialFactoryOptions](xref:botbuilder-core.ConfigurationServiceClientCredentialFactoryOptions) as its keys.
 * @param configuration A [Configuration](xref:botbuilder-dialogs-adaptive-runtime-core.Configuration) instance.
 * @returns A [ConfigurationServiceClientCredentialFactory](xref:botbuilder-core.ConfigurationServiceClientCredentialFactory) instance.
 */
export function createServiceClientCredentialFactoryFromConfiguration(
    configuration: Configuration
): ConfigurationServiceClientCredentialFactory {
    const factoryOptions = configuration.get<ConfigurationServiceClientCredentialFactoryOptions>();
    return new ConfigurationServiceClientCredentialFactory(factoryOptions);
}
