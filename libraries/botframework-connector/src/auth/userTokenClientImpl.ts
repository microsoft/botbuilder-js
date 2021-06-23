// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Activity, SignInUrlResponse, TokenExchangeRequest, TokenResponse, TokenStatus } from 'botframework-schema';
import type { ServiceClientCredentials } from '@azure/ms-rest-js';
import { TokenApiClient } from '../tokenApi/tokenApiClient';
import { UserTokenClient } from './userTokenClient';
import { assert } from 'botbuilder-stdlib';
import { ConnectorClientOptions } from '../connectorApi/models';

// Internal
export class UserTokenClientImpl extends UserTokenClient {
    private readonly client: TokenApiClient;
    constructor(
        private readonly appId: string,
        credentials: ServiceClientCredentials,
        oauthEndpoint: string,
        connectorClientOptions: ConnectorClientOptions = {}
    ) {
        super();
        this.client = new TokenApiClient(
            credentials,
            Object.assign({ baseUri: oauthEndpoint }, connectorClientOptions)
        );
    }

    async getUserToken(
        userId: string,
        connectionName: string,
        channelId: string,
        magicCode: string
    ): Promise<TokenResponse> {
        assert.string(userId, ['userId']);
        assert.string(connectionName, ['connectionName']);
        assert.string(channelId, ['channelId']);

        const result = await this.client.userToken.getToken(userId, connectionName, { channelId, code: magicCode });
        return result._response.parsedBody;
    }

    async getSignInResource(
        connectionName: string,
        activity: Activity,
        finalRedirect: string
    ): Promise<SignInUrlResponse> {
        assert.string(connectionName, ['connectionName']);
        assert.object(activity, ['activity']);

        const result = await this.client.botSignIn.getSignInResource(
            UserTokenClient.createTokenExchangeState(this.appId, connectionName, activity),
            { finalRedirect }
        );

        return result._response.parsedBody;
    }

    async signOutUser(userId: string, connectionName: string, channelId: string): Promise<void> {
        assert.string(userId, ['userId']);
        assert.string(connectionName, ['connectionName']);
        assert.string(channelId, ['channelId']);

        await this.client.userToken.signOut(userId, { channelId, connectionName });
    }

    async getTokenStatus(userId: string, channelId: string, includeFilter: string): Promise<TokenStatus[]> {
        assert.string(userId, ['userId']);
        assert.string(channelId, ['channelId']);

        const result = await this.client.userToken.getTokenStatus(userId, {
            channelId,
            include: includeFilter,
        });
        return result._response.parsedBody;
    }

    async getAadTokens(
        userId: string,
        connectionName: string,
        resourceUrls: string[],
        channelId: string
    ): Promise<Record<string, TokenResponse>> {
        assert.string(userId, ['userId']);
        assert.string(connectionName, ['connectionName']);
        assert.string(channelId, ['channelId']);

        const result = await this.client.userToken.getAadTokens(
            userId,
            connectionName,
            { resourceUrls },
            { channelId }
        );
        return result._response.parsedBody as Record<string, TokenResponse>;
    }

    async exchangeToken(
        userId: string,
        connectionName: string,
        channelId: string,
        exchangeRequest: TokenExchangeRequest
    ): Promise<TokenResponse> {
        assert.string(userId, ['userId']);
        assert.string(connectionName, ['connectionName']);
        assert.string(channelId, ['channelId']);

        const result = await this.client.userToken.exchangeAsync(userId, connectionName, channelId, exchangeRequest);
        return result._response.parsedBody;
    }
}
