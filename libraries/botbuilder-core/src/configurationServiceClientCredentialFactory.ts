// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Configuration } from 'botbuilder-dialogs-adaptive-runtime-core';
import { PasswordServiceClientCredentialFactory } from 'botframework-connector';
import { tests } from 'botbuilder-stdlib';
import * as t from 'runtypes';

const TypedConfig = t.Record({
    /**
     * The ID assigned to your bot in the [Bot Framework Portal](https://dev.botframework.com/).
     */
    MicrosoftAppId: t.String.optional(),

    /**
     * The password assigned to your bot in the [Bot Framework Portal](https://dev.botframework.com/).
     */
    MicrosoftAppPassword: t.String.optional(),
});

/**
 * Contains settings used to configure a [ConfigurationServiceClientCredentialFactory](xref:botbuilder-core.ConfigurationServiceClientCredentialFactory) instance.
 */
export type ConfigurationServiceClientCredentialFactoryOptions = t.Static<typeof TypedConfig>;

const isRuntimeConfiguration = (val: unknown): val is Configuration => {
    const config = val as Configuration;
    return tests.isFunc(config.get) && tests.isFunc(config.set);
};

/**
 * ServiceClientCredentialsFactory that uses a [ConfigurationServiceClientCredentialFactoryOptions](xref:botbuilder-core.ConfigurationServiceClientCredentialFactoryOptions) or a [Configuration](xref:botbuilder-dialogs-adaptive-runtime-core.Configuration) instance to build ServiceClientCredentials with an AppId and App Password.
 */
export class ConfigurationServiceClientCredentialFactory extends PasswordServiceClientCredentialFactory {
    /**
     * Initializes a new instance of the [ConfigurationServiceClientCredentialFactory](xref:botbuilder-core.ConfigurationServiceClientCredentialFactory) class.
     *
     * @param factoryOptions A [ConfigurationServiceClientCredentialFactoryOptions](xref:botbuilder-core.ConfigurationServiceClientCredentialFactoryOptions) object.
     */
    constructor(factoryOptions: ConfigurationServiceClientCredentialFactoryOptions) {
        super(null, null);
        
        this.appId = factoryOptions.MicrosoftAppId;
        this.password = factoryOptions.MicrosoftAppPassword;
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
    static useConfiguration(configuration: Configuration): ConfigurationServiceClientCredentialFactory {
        const factoryOptions = configuration.get<ConfigurationServiceClientCredentialFactoryOptions>();
        return new ConfigurationServiceClientCredentialFactory(factoryOptions);
    }
}
