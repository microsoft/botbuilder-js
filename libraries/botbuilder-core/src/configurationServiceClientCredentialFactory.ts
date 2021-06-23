// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as z from 'zod';
import { Configuration } from 'botbuilder-dialogs-adaptive-runtime-core';
import { PasswordServiceClientCredentialFactory } from 'botframework-connector';

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
    /**
     * Initializes a new instance of the [ConfigurationServiceClientCredentialFactory](xref:botbuilder-core.ConfigurationServiceClientCredentialFactory) class.
     *
     * @param factoryOptions A [ConfigurationServiceClientCredentialFactoryOptions](xref:botbuilder-core.ConfigurationServiceClientCredentialFactoryOptions) object.
     */
    constructor(factoryOptions: ConfigurationServiceClientCredentialFactoryOptions = {}) {
        const { MicrosoftAppId = null, MicrosoftAppPassword = null } = TypedConfig.nonstrict().parse(factoryOptions);
        super(MicrosoftAppId, MicrosoftAppPassword);
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
