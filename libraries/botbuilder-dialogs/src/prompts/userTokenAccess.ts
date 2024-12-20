// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as z from 'zod';
import { CloudAdapterBase, ExtendedUserTokenProvider, TokenResponse, TurnContext } from 'botbuilder-core';
import { OAuthPromptSettings } from './oauthPrompt';

import {
    ClaimsIdentity,
    ConnectorClient,
    ConnectorFactory,
    SignInUrlResponse,
    TokenExchangeRequest,
    UserTokenClient,
} from 'botframework-connector';

const ExtendedUserTokenProviderT = z.custom<ExtendedUserTokenProvider>(
    (val: any) =>
        typeof val.exchangeToken === 'function' &&
        typeof val.getSignInResource === 'function' &&
        typeof val.getUserToken === 'function' &&
        typeof val.signOutUser === 'function',
    {
        message: 'ExtendedUserTokenProvider',
    },
);

type ConnectorClientBuilder = {
    createConnectorClientWithIdentity: (
        serviceUrl: string,
        claimsIdentity: ClaimsIdentity,
        audience: string,
    ) => Promise<ConnectorClient>;
};

const ConnectorClientBuilderT = z.custom<ConnectorClientBuilder>(
    (val: any) => typeof val.createConnectorClientWithIdentity === 'function',
    {
        message: 'ConnectorClientBuilder',
    },
);

/**
 * @internal
 */
export async function getUserToken(
    context: TurnContext,
    settings: OAuthPromptSettings,
    magicCode: string,
): Promise<TokenResponse> {
    const userTokenClient = context.turnState.get<UserTokenClient>(
        (context.adapter as CloudAdapterBase).UserTokenClientKey,
    );
    const extendedUserTokenProvider = ExtendedUserTokenProviderT.safeParse(context.adapter);

    if (userTokenClient) {
        return userTokenClient.getUserToken(
            context.activity?.from?.id,
            settings.connectionName,
            context.activity?.channelId,
            magicCode,
        );
    } else if (extendedUserTokenProvider.success) {
        return extendedUserTokenProvider.data.getUserToken(
            context,
            settings.connectionName,
            magicCode,
            settings.oAuthAppCredentials,
        );
    } else {
        throw new Error('OAuth prompt is not supported by the current adapter');
    }
}

/**
 * @internal
 */
export async function getSignInResource(
    context: TurnContext,
    settings: OAuthPromptSettings,
): Promise<SignInUrlResponse> {
    const userTokenClient = context.turnState.get<UserTokenClient>(
        (context.adapter as CloudAdapterBase).UserTokenClientKey,
    );
    const extendedUserTokenProvider = ExtendedUserTokenProviderT.safeParse(context.adapter);
    if (userTokenClient) {
        return userTokenClient.getSignInResource(settings.connectionName, context.activity, undefined);
    } else if (extendedUserTokenProvider.success) {
        return extendedUserTokenProvider.data.getSignInResource(
            context,
            settings.connectionName,
            context.activity?.from?.id,
            undefined,
            settings.oAuthAppCredentials,
        );
    } else {
        throw new Error('OAuth prompt is not supported by the current adapter');
    }
}

/**
 * @internal
 */
export async function signOutUser(context: TurnContext, settings: OAuthPromptSettings): Promise<void> {
    const userTokenClient = context.turnState.get<UserTokenClient>(
        (context.adapter as CloudAdapterBase).UserTokenClientKey,
    );
    const extendedUserTokenProvider = ExtendedUserTokenProviderT.safeParse(context.adapter);
    if (userTokenClient) {
        await userTokenClient.signOutUser(
            context.activity?.from?.id,
            settings.connectionName,
            context.activity?.channelId,
        );
    } else if (extendedUserTokenProvider.success) {
        await extendedUserTokenProvider.data.signOutUser(
            context,
            settings.connectionName,
            context.activity?.from?.id,
            settings.oAuthAppCredentials,
        );
    } else {
        throw new Error('OAuth prompt is not supported by the current adapter');
    }
}

/**
 * @internal
 */
export async function exchangeToken(
    context: TurnContext,
    settings: OAuthPromptSettings,
    tokenExchangeRequest: TokenExchangeRequest,
): Promise<TokenResponse> {
    const userTokenClient = context.turnState.get<UserTokenClient>(
        (context.adapter as CloudAdapterBase).UserTokenClientKey,
    );
    const extendedUserTokenProvider = ExtendedUserTokenProviderT.safeParse(context.adapter);

    if (userTokenClient) {
        return userTokenClient.exchangeToken(
            context.activity?.from?.id,
            settings.connectionName,
            context.activity?.channelId,
            tokenExchangeRequest,
        );
    } else if (extendedUserTokenProvider.success) {
        return extendedUserTokenProvider.data.exchangeToken(
            context,
            settings.connectionName,
            context.activity?.from?.id,
            tokenExchangeRequest,
        );
    } else {
        throw new Error('OAuth prompt is not supported by the current adapter');
    }
}

/**
 * @internal
 */
export async function createConnectorClient(
    context: TurnContext,
    serviceUrl: string,
    claimsIdentity: ClaimsIdentity,
    audience: string,
): Promise<ConnectorClient> {
    const connectorFactory = context.turnState.get<ConnectorFactory>(
        (context.adapter as CloudAdapterBase).ConnectorFactoryKey,
    );
    const connectorClientBuilder = ConnectorClientBuilderT.safeParse(context.adapter);
    if (connectorFactory) {
        return connectorFactory.create(serviceUrl, audience);
    } else if (connectorClientBuilder.success) {
        return connectorClientBuilder.data.createConnectorClientWithIdentity(serviceUrl, claimsIdentity, audience);
    } else {
        throw new Error('OAuth prompt is not supported by the current adapter');
    }
}
