// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import * as t from 'runtypes';
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

const ExtendedUserTokenProviderT = t
    .Record({
        exchangeToken: t.Function,
        getSignInResource: t.Function,
        getUserToken: t.Function,
        signOutUser: t.Function,
    })
    .withGuard<ExtendedUserTokenProvider>((val: unknown): val is ExtendedUserTokenProvider => val != null, {
        name: 'ExtendedUserTokenProvider',
    });

type ConnectorClientBuilder = {
    createConnectorClientWithIdentity: (
        serviceUrl: string,
        claimsIdentity: ClaimsIdentity,
        audience: string
    ) => Promise<ConnectorClient>;
};

const ConnectorClientBuilderT = t
    .Record({
        createConnectorClientWithIdentity: t.Function,
    })
    .withGuard<ConnectorClientBuilder>((val: unknown): val is ConnectorClientBuilder => val != null, {
        name: 'ConnectorClientBuilder',
    });

/**
 * @internal
 */
export async function getUserToken(
    context: TurnContext,
    settings: OAuthPromptSettings,
    magicCode: string
): Promise<TokenResponse> {
    const userTokenClient = context.turnState.get<UserTokenClient>(
        (context.adapter as CloudAdapterBase).UserTokenClientKey
    );
    if (userTokenClient) {
        return userTokenClient.getUserToken(
            context.activity?.from?.id,
            settings.connectionName,
            context.activity?.channelId,
            magicCode
        );
    } else if (ExtendedUserTokenProviderT.guard(context.adapter)) {
        return context.adapter.getUserToken(context, settings.connectionName, magicCode, settings.oAuthAppCredentials);
    } else {
        throw new Error('OAuth prompt is not supported by the current adapter');
    }
}

/**
 * @internal
 */
export async function getSignInResource(
    context: TurnContext,
    settings: OAuthPromptSettings
): Promise<SignInUrlResponse> {
    const userTokenClient = context.turnState.get<UserTokenClient>(
        (context.adapter as CloudAdapterBase).UserTokenClientKey
    );
    if (userTokenClient) {
        return userTokenClient.getSignInResource(settings.connectionName, context.activity, undefined);
    } else if (ExtendedUserTokenProviderT.guard(context.adapter)) {
        return context.adapter.getSignInResource(
            context,
            settings.connectionName,
            context.activity?.from?.id,
            undefined,
            settings.oAuthAppCredentials
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
        (context.adapter as CloudAdapterBase).UserTokenClientKey
    );
    if (userTokenClient) {
        await userTokenClient.signOutUser(
            context.activity?.from?.id,
            settings.connectionName,
            context.activity?.channelId
        );
    } else if (ExtendedUserTokenProviderT.guard(context.adapter)) {
        await context.adapter.signOutUser(
            context,
            settings.connectionName,
            context.activity?.from?.id,
            settings.oAuthAppCredentials
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
    tokenExchangeRequest: TokenExchangeRequest
): Promise<TokenResponse> {
    const userTokenClient = context.turnState.get<UserTokenClient>(
        (context.adapter as CloudAdapterBase).UserTokenClientKey
    );
    if (userTokenClient) {
        return userTokenClient.exchangeToken(
            context.activity?.from?.id,
            settings.connectionName,
            context.activity?.channelId,
            tokenExchangeRequest
        );
    } else if (ExtendedUserTokenProviderT.guard(context.adapter)) {
        return context.adapter.exchangeToken(
            context,
            settings.connectionName,
            context.activity?.from?.id,
            tokenExchangeRequest
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
    audience: string
): Promise<ConnectorClient> {
    const connectorFactory = context.turnState.get<ConnectorFactory>(
        (context.adapter as CloudAdapterBase).UserTokenClientKey
    );
    if (connectorFactory) {
        return connectorFactory.create(serviceUrl, audience);
    } else if (ConnectorClientBuilderT.guard(context.adapter)) {
        return context.adapter.createConnectorClientWithIdentity(serviceUrl, claimsIdentity, audience);
    } else {
        throw new Error('OAuth prompt is not supported by the current adapter');
    }
}
