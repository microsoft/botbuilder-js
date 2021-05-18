// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Activity } from 'botframework-schema';
import {
    AuthenticateRequestResult,
    AuthenticationConfiguration,
    AuthenticationConstants,
    BotFrameworkAuthentication,
    BotFrameworkAuthenticationFactory,
    BotFrameworkClient,
    ClaimsIdentity,
    ConnectorClientOptions,
    ConnectorFactory,
    ServiceClientCredentialsFactory,
    UserTokenClient,
} from 'botframework-connector';
import { Configuration } from 'botbuilder-dialogs-adaptive-runtime-core';
import { tests } from 'botbuilder-stdlib';
import * as t from 'runtypes';
import yn from 'yn';
import { ConfigurationServiceClientCredentialFactory } from './configurationServiceClientCredentialFactory';

const TypedOptions = t.Record({
    /**
     * (Optional) The OAuth URL used to get a token from OAuthApiClient. The "OAuthUrl" member takes precedence over this value.
     */
    [AuthenticationConstants.OAuthUrlKey]: t.String.optional(),

    /**
     * (Optional) The OpenID metadata document used for authenticating tokens coming from the channel. The "ToBotFromChannelOpenIdMetadataUrl" member takes precedence over this value.
     */
    [AuthenticationConstants.BotOpenIdMetadataKey]: t.String.optional(),

    /**
     * A string used to indicate if which cloud the bot is operating in (e.g. Public Azure or US Government).
     *
     * @remarks
     * A `null` or `''` value indicates Public Azure, whereas [GovernmentConstants.ChannelService](xref:botframework-connector.GovernmentConstants.ChannelService) indicates the bot is operating in the US Government cloud.
     *
     * Other values result in a custom authentication configuration derived from the values passed in on the [ConfigurationBotFrameworkAuthenticationOptions](xef:botbuilder-core.ConfigurationBotFrameworkAuthenticationOptions) instance.
     */
    [AuthenticationConstants.ChannelService]: t.String,

    /**
     * Flag indicating whether or not to validate the address.
     */
    ValidateAuthority: t.String.Or(t.Boolean),

    /**
     * The Login URL used to specify the tenant from which the bot should obtain access tokens from.
     */
    ToChannelFromBotLoginUrl: t.String,

    /**
     * The Oauth scope to request.
     *
     * @remarks
     * This value is used when fetching a token to indicate the ultimate recipient or `audience` of an activity sent using these credentials.
     */
    ToChannelFromBotOAuthScope: t.String,

    /**
     * The Token issuer for signed requests to the channel.
     */
    ToBotFromChannelTokenIssuer: t.String,

    /**
     * The OAuth URL used to get a token from OAuthApiClient.
     */
    OAuthUrl: t.String,

    /**
     * The OpenID metadata document used for authenticating tokens coming from the channel.
     */
    ToBotFromChannelOpenIdMetadataUrl: t.String,

    /**
     * The The OpenID metadata document used for authenticating tokens coming from the Emulator.
     */
    ToBotFromEmulatorOpenIdMetadataUrl: t.String,

    /**
     * A value for the CallerId.
     */
    CallerId: t.String,
});

/**
 * Contains settings used to configure a [ConfigurationBotFrameworkAuthentication](xref:botbuilder-core.ConfigurationBotFrameworkAuthentication) instance.
 */
export type ConfigurationBotFrameworkAuthenticationOptions = t.Static<typeof TypedOptions>;

const isRuntimeConfiguration = (val: unknown): val is Configuration => {
    const config = val as Configuration;
    return tests.isFunc(config.get) && tests.isFunc(config.set);
};

/**
 * Creates a [BotFrameworkAuthentication](xref:botframework-connector.BotFrameworkAuthentication) instance from an object with the authentication values or a [Configuration](xref:botbuilder-dialogs-adaptive-runtime-core.Configuration) instance.
 */
export class ConfigurationBotFrameworkAuthentication extends BotFrameworkAuthentication {
    private readonly inner: BotFrameworkAuthentication;

    /**
     * Initializes a new instance of the [ConfigurationBotFrameworkAuthentication](xref:botbuilder-core.ConfigurationBotFrameworkAuthentication) class.
     *
     * @param botFrameworkAuthConfig A [ConfigurationBotFrameworkAuthenticationOptions](xref:botbuilder-core.ConfigurationBotFrameworkAuthenticationOptions) object.
     * @param credentialsFactory A [ServiceClientCredentialsFactory](xref:botframework-connector.ServiceClientCredentialsFactory) instance.
     * @param authConfiguration A [Configuration](xref:botframework-connector.AuthenticationConfiguration) object.
     * @param botFrameworkClientFetch A custom Fetch implementation to be used in the [BotFrameworkClient](xref:botframework-connector.BotFrameworkClient).
     * @param connectorClientOptions A [ConnectorClientOptions](xref:botframework-connector.ConnectorClientOptions) object.
     */
    constructor(
        botFrameworkAuthConfig: Partial<ConfigurationBotFrameworkAuthenticationOptions>,
        credentialsFactory?: ServiceClientCredentialsFactory,
        authConfiguration?: AuthenticationConfiguration,
        botFrameworkClientFetch?: (input: RequestInfo, init?: RequestInit) => Promise<Response>,
        connectorClientOptions?: ConnectorClientOptions
    );
    /**
     * Initializes a new instance of the [ConfigurationBotFrameworkAuthentication](xref:botbuilder-core.ConfigurationBotFrameworkAuthentication) class.
     *
     * @remarks
     * The [Configuration](xref:botbuilder-dialogs-adaptive-runtime-core.Configuration) instance provided to the constructor should
     * have the desired authentication values available at the root, using the properties of [ConfigurationBotFrameworkAuthenticationOptions](xref:botbuilder-core.ConfigurationBotFrameworkAuthenticationOptions) as its keys.
     * @param configuration A [Configuration](xref:botbuilder-dialogs-adaptive-runtime-core.Configuration) instance.
     * @param credentialsFactory A [ServiceClientCredentialsFactory](xref:botframework-connector.ServiceClientCredentialsFactory) instance.
     * @param authConfiguration A [Configuration](xref:botframework-connector.AuthenticationConfiguration) object.
     * @param botFrameworkClientFetch A custom Fetch implementation to be used in the [BotFrameworkClient](xref:botframework-connector.BotFrameworkClient).
     * @param connectorClientOptions A [ConnectorClientOptions](xref:botframework-connector.ConnectorClientOptions) object.
     */
    constructor(
        configuration: Configuration,
        credentialsFactory?: ServiceClientCredentialsFactory,
        authConfiguration?: AuthenticationConfiguration,
        botFrameworkClientFetch?: (input: RequestInfo, init?: RequestInit) => Promise<Response>,
        connectorClientOptions?: ConnectorClientOptions
    );
    /**
     * @internal
     */
    constructor(
        bfAuthConfigOrConfiguration: Partial<ConfigurationBotFrameworkAuthenticationOptions> | Configuration,
        credentialsFactory: ServiceClientCredentialsFactory = null,
        authConfiguration: AuthenticationConfiguration = null,
        botFrameworkClientFetch?: (input: RequestInfo, init?: RequestInit) => Promise<Response>,
        connectorClientOptions: ConnectorClientOptions = {}
    ) {
        super();
        const rootConfiguration = isRuntimeConfiguration(bfAuthConfigOrConfiguration)
            ? (bfAuthConfigOrConfiguration.get([]) as ConfigurationBotFrameworkAuthenticationOptions)
            : bfAuthConfigOrConfiguration;
        const {
            ChannelService,
            ToChannelFromBotLoginUrl,
            ToChannelFromBotOAuthScope,
            ToBotFromChannelTokenIssuer,
            ToBotFromEmulatorOpenIdMetadataUrl,
            CallerId,
        } = rootConfiguration;

        const ToBotFromChannelOpenIdMetadataUrl =
            rootConfiguration.ToBotFromChannelOpenIdMetadataUrl ??
            rootConfiguration[AuthenticationConstants.BotOpenIdMetadataKey];
        const OAuthUrl = rootConfiguration.OAuthUrl ?? rootConfiguration[AuthenticationConstants.OAuthUrlKey];
        const ValidateAuthority = yn(rootConfiguration.ValidateAuthority);
        TypedOptions.check({
            CallerId,
            ChannelService,
            OAuthUrl,
            ToBotFromChannelOpenIdMetadataUrl,
            ToBotFromChannelTokenIssuer,
            ToBotFromEmulatorOpenIdMetadataUrl,
            ToChannelFromBotLoginUrl,
            ToChannelFromBotOAuthScope,
            ValidateAuthority,
        });

        this.inner = BotFrameworkAuthenticationFactory.create(
            ChannelService,
            ValidateAuthority,
            ToChannelFromBotLoginUrl,
            ToChannelFromBotOAuthScope,
            ToBotFromChannelTokenIssuer,
            OAuthUrl,
            ToBotFromChannelOpenIdMetadataUrl,
            ToBotFromEmulatorOpenIdMetadataUrl,
            CallerId,
            credentialsFactory ??
                new ConfigurationServiceClientCredentialFactory(bfAuthConfigOrConfiguration as Configuration),
            authConfiguration ?? ({} as AuthenticationConfiguration),
            botFrameworkClientFetch,
            connectorClientOptions
        );
    }

    authenticateChannelRequest(authHeader: string): Promise<ClaimsIdentity> {
        return this.inner.authenticateChannelRequest(authHeader);
    }

    authenticateRequest(activity: Activity, authHeader: string): Promise<AuthenticateRequestResult> {
        return this.inner.authenticateRequest(activity, authHeader);
    }

    authenticateStreamingRequest(authHeader: string, channelIdHeader: string): Promise<AuthenticateRequestResult> {
        return this.inner.authenticateStreamingRequest(authHeader, channelIdHeader);
    }

    createBotFrameworkClient(): BotFrameworkClient {
        return this.inner.createBotFrameworkClient();
    }

    createConnectorFactory(claimsIdentity: ClaimsIdentity): ConnectorFactory {
        return this.inner.createConnectorFactory(claimsIdentity);
    }

    createUserTokenClient(claimsIdentity: ClaimsIdentity): Promise<UserTokenClient> {
        return this.inner.createUserTokenClient(claimsIdentity);
    }
}
