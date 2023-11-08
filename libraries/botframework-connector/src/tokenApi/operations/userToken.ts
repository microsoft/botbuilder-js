/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { ServiceCallback, RequestOptionsBase, Serializer, OperationSpec } from '@azure/core-http';
import * as Models from '../models';
import * as Mappers from '../models/userTokenMappers';
import * as Parameters from '../models/parameters';
import { TokenApiClientContext } from '../tokenApiClientContext';
import { TokenExchangeRequest, TokenResponse, TokenStatus } from 'botframework-schema';

/** Class representing a UserToken. */
export class UserToken {
    private readonly client: TokenApiClientContext;

    /**
     * Create a UserToken.
     *
     * @param {TokenApiClientContext} client Reference to the service client.
     */
    constructor(client: TokenApiClientContext) {
        this.client = client;
    }

    /**
     * @param userId
     * @param connectionName
     * @param [options] The optional parameters
     * @returns Promise<Models.UserTokenGetTokenResponse>
     */
    getToken(
        userId: string,
        connectionName: string,
        options?: Models.UserTokenGetTokenOptionalParams
    ): Promise<Models.UserTokenGetTokenResponse>;
    /**
     * @param userId
     * @param connectionName
     * @param callback The callback
     */
    getToken(userId: string, connectionName: string, callback: ServiceCallback<TokenResponse>): void;
    /**
     * @param userId
     * @param connectionName
     * @param options The optional parameters
     * @param callback The callback
     */
    getToken(
        userId: string,
        connectionName: string,
        options: Models.UserTokenGetTokenOptionalParams,
        callback: ServiceCallback<TokenResponse>
    ): void;
    getToken(
        userId: string,
        connectionName: string,
        options?: Models.UserTokenGetTokenOptionalParams | ServiceCallback<TokenResponse>,
        callback?: ServiceCallback<TokenResponse>
    ): Promise<Models.UserTokenGetTokenResponse> {
        return this.client.sendOperationRequest(
            {
                userId,
                connectionName,
                options,
            },
            getTokenOperationSpec,
            callback
        ) as Promise<Models.UserTokenGetTokenResponse>;
    }

    /**
     * @param userId
     * @param connectionName
     * @param aadResourceUrls
     * @param [options] The optional parameters
     * @returns Promise<Models.UserTokenGetAadTokensResponse>
     */
    getAadTokens(
        userId: string,
        connectionName: string,
        aadResourceUrls: Models.AadResourceUrls,
        options?: Models.UserTokenGetAadTokensOptionalParams
    ): Promise<Models.UserTokenGetAadTokensResponse>;
    /**
     * @param userId
     * @param connectionName
     * @param aadResourceUrls
     * @param callback The callback
     */
    getAadTokens(
        userId: string,
        connectionName: string,
        aadResourceUrls: Models.AadResourceUrls,
        callback: ServiceCallback<{ [propertyName: string]: TokenResponse }>
    ): void;
    /**
     * @param userId
     * @param connectionName
     * @param aadResourceUrls
     * @param options The optional parameters
     * @param callback The callback
     */
    getAadTokens(
        userId: string,
        connectionName: string,
        aadResourceUrls: Models.AadResourceUrls,
        options: Models.UserTokenGetAadTokensOptionalParams,
        callback: ServiceCallback<{ [propertyName: string]: TokenResponse }>
    ): void;
    getAadTokens(
        userId: string,
        connectionName: string,
        aadResourceUrls: Models.AadResourceUrls,
        options?:
            | Models.UserTokenGetAadTokensOptionalParams
            | ServiceCallback<{ [propertyName: string]: TokenResponse }>,
        callback?: ServiceCallback<{ [propertyName: string]: TokenResponse }>
    ): Promise<Models.UserTokenGetAadTokensResponse> {
        return this.client.sendOperationRequest(
            {
                userId,
                connectionName,
                aadResourceUrls,
                options,
            },
            getAadTokensOperationSpec,
            callback
        ) as Promise<Models.UserTokenGetAadTokensResponse>;
    }

    /**
     * @param userId
     * @param [options] The optional parameters
     * @returns Promise<Models.UserTokenSignOutResponse>
     */
    signOut(userId: string, options?: Models.UserTokenSignOutOptionalParams): Promise<Models.UserTokenSignOutResponse>;
    /**
     * @param userId
     * @param callback The callback
     */
    signOut(userId: string, callback: ServiceCallback<any>): void;
    /**
     * @param userId
     * @param options The optional parameters
     * @param callback The callback
     */
    signOut(
        userId: string,
        options: Models.UserTokenSignOutOptionalParams,
        callback: ServiceCallback<any>
    ): void;
    signOut(
        userId: string,
        options?: Models.UserTokenSignOutOptionalParams | ServiceCallback<any>,
        callback?: ServiceCallback<any>
    ): Promise<Models.UserTokenSignOutResponse> {
        return this.client.sendOperationRequest(
            {
                userId,
                options,
            },
            signOutOperationSpec,
            callback
        ) as Promise<Models.UserTokenSignOutResponse>;
    }

    /**
     * @param userId
     * @param [options] The optional parameters
     * @returns Promise<Models.UserTokenGetTokenStatusResponse>
     */
    getTokenStatus(
        userId: string,
        options?: Models.UserTokenGetTokenStatusOptionalParams
    ): Promise<Models.UserTokenGetTokenStatusResponse>;
    /**
     * @param userId
     * @param callback The callback
     */
    getTokenStatus(userId: string, callback: ServiceCallback<TokenStatus[]>): void;
    /**
     * @param userId
     * @param options The optional parameters
     * @param callback The callback
     */
    getTokenStatus(
        userId: string,
        options: Models.UserTokenGetTokenStatusOptionalParams,
        callback: ServiceCallback<TokenStatus[]>
    ): void;
    getTokenStatus(
        userId: string,
        options?: Models.UserTokenGetTokenStatusOptionalParams | ServiceCallback<TokenStatus[]>,
        callback?: ServiceCallback<TokenStatus[]>
    ): Promise<Models.UserTokenGetTokenStatusResponse> {
        return this.client.sendOperationRequest(
            {
                userId,
                options,
            },
            getTokenStatusOperationSpec,
            callback
        ) as Promise<Models.UserTokenGetTokenStatusResponse>;
    }

    /**
     * @param userId
     * @param connectionName
     * @param channelId
     * @param exchangeRequest
     * @param [options] The optional parameters
     * @returns Promise<Models.UserTokenExchangeAsyncResponse>
     */
    exchangeAsync(
        userId: string,
        connectionName: string,
        channelId: string,
        exchangeRequest: TokenExchangeRequest,
        options?: RequestOptionsBase
    ): Promise<Models.UserTokenExchangeAsyncResponse>;
    /**
     * @param userId
     * @param connectionName
     * @param channelId
     * @param exchangeRequest
     * @param callback The callback
     */
    exchangeAsync(
        userId: string,
        connectionName: string,
        channelId: string,
        exchangeRequest: TokenExchangeRequest,
        callback: ServiceCallback<any>
    ): void;
    /**
     * @param userId
     * @param connectionName
     * @param channelId
     * @param exchangeRequest
     * @param options The optional parameters
     * @param callback The callback
     */
    exchangeAsync(
        userId: string,
        connectionName: string,
        channelId: string,
        exchangeRequest: TokenExchangeRequest,
        options: RequestOptionsBase,
        callback: ServiceCallback<any>
    ): void;
    exchangeAsync(
        userId: string,
        connectionName: string,
        channelId: string,
        exchangeRequest: TokenExchangeRequest,
        options?: RequestOptionsBase | ServiceCallback<any>,
        callback?: ServiceCallback<any>
    ): Promise<Models.UserTokenExchangeAsyncResponse> {
        return this.client.sendOperationRequest(
            {
                userId,
                connectionName,
                channelId,
                exchangeRequest,
                options,
            },
            exchangeAsyncOperationSpec,
            callback
        ) as Promise<Models.UserTokenExchangeAsyncResponse>;
    }
}

// Operation Specifications
const serializer = new Serializer(Mappers);
const getTokenOperationSpec: OperationSpec = {
    httpMethod: 'GET',
    path: 'api/usertoken/GetToken',
    queryParameters: [Parameters.userId, Parameters.connectionName0, Parameters.channelId0, Parameters.code],
    responses: {
        200: {
            bodyMapper: Mappers.TokenResponse,
        },
        404: {
            bodyMapper: Mappers.TokenResponse,
        },
        default: {
            bodyMapper: Mappers.ErrorResponse,
        },
    },
    serializer,
};

const getAadTokensOperationSpec: OperationSpec = {
    httpMethod: 'POST',
    path: 'api/usertoken/GetAadTokens',
    queryParameters: [Parameters.userId, Parameters.connectionName0, Parameters.channelId0],
    requestBody: {
        parameterPath: 'aadResourceUrls',
        mapper: {
            ...Mappers.AadResourceUrls,
            required: true,
        },
    },
    responses: {
        200: {
            bodyMapper: {
                serializedName: 'parsedResponse',
                type: {
                    name: 'Dictionary',
                    value: {
                        type: {
                            name: 'Composite',
                            className: 'TokenResponse',
                        },
                    },
                },
            },
        },
        default: {
            bodyMapper: Mappers.ErrorResponse,
        },
    },
    serializer,
};

const signOutOperationSpec: OperationSpec = {
    httpMethod: 'DELETE',
    path: 'api/usertoken/SignOut',
    queryParameters: [Parameters.userId, Parameters.connectionName1, Parameters.channelId0],
    responses: {
        200: {
            bodyMapper: {
                serializedName: 'parsedResponse',
                type: {
                    name: 'Object',
                },
            },
        },
        204: {},
        default: {
            bodyMapper: Mappers.ErrorResponse,
        },
    },
    serializer,
};

const getTokenStatusOperationSpec: OperationSpec = {
    httpMethod: 'GET',
    path: 'api/usertoken/GetTokenStatus',
    queryParameters: [Parameters.userId, Parameters.channelId0, Parameters.include],
    responses: {
        200: {
            bodyMapper: {
                serializedName: 'parsedResponse',
                type: {
                    name: 'Sequence',
                    element: {
                        type: {
                            name: 'Composite',
                            className: 'TokenStatus',
                        },
                    },
                },
            },
        },
        default: {
            bodyMapper: Mappers.ErrorResponse,
        },
    },
    serializer,
};

const exchangeAsyncOperationSpec: OperationSpec = {
    httpMethod: 'POST',
    path: 'api/usertoken/exchange',
    queryParameters: [Parameters.userId, Parameters.connectionName0, Parameters.channelId1],
    requestBody: {
        parameterPath: 'exchangeRequest',
        mapper: {
            ...Mappers.TokenExchangeRequest,
            required: true,
        },
    },
    responses: {
        200: {
            bodyMapper: Mappers.TokenResponse,
        },
        400: {
            bodyMapper: Mappers.ErrorResponse,
        },
        404: {
            bodyMapper: Mappers.TokenResponse,
        },
        default: {
            bodyMapper: Mappers.ErrorResponse,
        },
    },
    serializer,
};
