// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as z from 'zod';
import { ok } from 'assert';
import { Configuration } from 'botbuilder-dialogs-adaptive-runtime-core';
import {
    AuthenticationConstants,
    CertificateServiceClientCredentialsFactory,
    JwtTokenProviderFactory,
    ManagedIdentityServiceClientCredentialsFactory,
    PasswordServiceClientCredentialFactory,
    ServiceClientCredentials,
    ServiceClientCredentialsFactory,
} from 'botframework-connector';

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
        MicrosoftAppType: z.string(),

        /**
         * The tenant id assigned to your bot in the [Bot Framework Portal](https://dev.botframework.com/).
         */
        MicrosoftAppTenantId: z.string(),

        /**
         * Certificate thumbprint to authenticate the appId against AAD.
         */
        [AuthenticationConstants.CertificateThumbprint]: z.string(),

        /**
         * Certificate key to authenticate the appId against AAD.
         */
        [AuthenticationConstants.CertificatePrivateKey]: z.string(),
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
        const {
            MicrosoftAppId = null,
            MicrosoftAppPassword = null,
            MicrosoftAppType = null,
            MicrosoftAppTenantId = null,
            [AuthenticationConstants.CertificateThumbprint]: CertificateThumbprint = null,
            [AuthenticationConstants.CertificatePrivateKey]: CertificatePrivateKey = null,
        } = TypedConfig.nonstrict().parse(factoryOptions);
        super(MicrosoftAppId, MicrosoftAppPassword, MicrosoftAppTenantId);

        const appType = MicrosoftAppType?.trim() ?? MultiTenant;
        const withCertificate = CertificateThumbprint || CertificatePrivateKey;

        if (withCertificate) {
            ok(
                CertificateThumbprint?.trim(),
                'CertificateThumbprint is required when using a Certificate in configuration.'
            );
            ok(
                CertificatePrivateKey?.trim(),
                'CertificatePrivateKey is required when using a Certificate in configuration.'
            );
        }

        switch (appType.toLocaleLowerCase()) {
            case UserAssignedMsi.toLocaleLowerCase():
                ok(MicrosoftAppId?.trim(), 'MicrosoftAppId is required for MSI in configuration.');
                ok(MicrosoftAppTenantId?.trim(), 'MicrosoftAppTenantId is required for MSI in configuration.');
                ok(!MicrosoftAppPassword?.trim(), 'MicrosoftAppPassword must not be set for MSI in configuration.');

                this.inner = new ManagedIdentityServiceClientCredentialsFactory(
                    MicrosoftAppId,
                    new JwtTokenProviderFactory()
                );
                break;
            case SingleTenant.toLocaleLowerCase():
                ok(MicrosoftAppId?.trim(), 'MicrosoftAppId is required for SingleTenant in configuration.');
                ok(MicrosoftAppTenantId?.trim(), 'MicrosoftAppTenantId is required for SingleTenant in configuration.');

                if (withCertificate) {
                    this.inner = new CertificateServiceClientCredentialsFactory(
                        MicrosoftAppId,
                        CertificateThumbprint,
                        CertificatePrivateKey,
                        MicrosoftAppTenantId
                    );
                } else {
                    ok(
                        MicrosoftAppPassword?.trim(),
                        'MicrosoftAppPassword is required for SingleTenant in configuration.'
                    );

                    this.inner = new PasswordServiceClientCredentialFactory(
                        MicrosoftAppId,
                        MicrosoftAppPassword,
                        MicrosoftAppTenantId
                    );
                }
                break;
            default:
                //MultiTenant
                if (withCertificate) {
                    ok(
                        MicrosoftAppId?.trim(),
                        'MicrosoftAppId is required for MultiTenant when using a Certificate in configuration.'
                    );

                    this.inner = new CertificateServiceClientCredentialsFactory(
                        MicrosoftAppId,
                        CertificateThumbprint,
                        CertificatePrivateKey
                    );
                } else {
                    this.inner = new PasswordServiceClientCredentialFactory(MicrosoftAppId, MicrosoftAppPassword, '');
                }
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
