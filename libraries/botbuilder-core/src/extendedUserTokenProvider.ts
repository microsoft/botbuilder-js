/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { AppCredentials } from './appCredentials';
import { IUserTokenProvider } from './userTokenProvider';
import { TurnContext } from './turnContext';
import { TokenResponse } from 'botframework-schema';
import { BotSignInGetSignInResourceResponse, TokenExchangeRequest } from 'botframework-connector'

/**
 * Interface for User Token OAuth Single Sign On and Token Exchange APIs for BotAdapters
 */
export interface IExtendedUserTokenProvider extends IUserTokenProvider{
    /**
     * Retrieves the OAuth token for a user that is in a sign-in flow.
     * @param context Context for the current turn of conversation with the user.
     * @param connectionName Name of the auth connection to use.
     * @param magicCode (Optional) Optional user entered code to validate.
     */
    getUserToken(context: TurnContext, connectionName: string, magicCode?: string, appCredentials?: AppCredentials): Promise<TokenResponse>;

    /**
     * Signs the user out with the token server.
     * @param context Context for the current turn of conversation with the user.
     * @param connectionName Name of the auth connection to use.
     * @param userId User id of user to sign out.
     * @param oAuthAppCredentials AppCredentials for OAuth.
     */
    signOutUser(context: TurnContext, connectionName: string, userId?: string, appCredentials?: AppCredentials): Promise<void>;

    /**
     * Gets a signin link from the token server that can be sent as part of a SigninCard.
     * @param context Context for the current turn of conversation with the user.
     * @param connectionName Name of the auth connection to use.
     * @param oAuthAppCredentials AppCredentials for OAuth.
     */
    getSignInLink(context: TurnContext, connectionName: string, appCredentials?: AppCredentials): Promise<string>;

    /**
     * Signs the user out with the token server.
     * @param context Context for the current turn of conversation with the user.
     * @param connectionName Name of the auth connection to use.
     * @param oAuthAppCredentials AppCredentials for OAuth.
     */
    getAadTokens(context: TurnContext, connectionName: string, resourceUrls: string[], appCredentials?: AppCredentials): Promise<{
        [propertyName: string]: TokenResponse;
    }>;

    /**
     * Get the raw signin resource to be sent to the user for signin for a connection name.
     * @param context Context for the current turn of conversation with the user.
     * @param connectionName Name of the auth connection to use.
     */    
    getSignInResource(context: TurnContext, connectionName: string): Promise<BotSignInGetSignInResourceResponse>;

    /**
     * Get the raw signin resource to be sent to the user for signin for a connection name.
     * @param context Context for the current turn of conversation with the user.
     * @param connectionName Name of the auth connection to use.
     * @param userId The user id that will be associated with the token.
     * @param finalRedirect The final URL that the OAuth flow will redirect to.
     */   
    getSignInResource(context: TurnContext, connectionName: string, userId: string, finalRedirect?: string): Promise<BotSignInGetSignInResourceResponse>;

    /**
     * Get the raw signin resource to be sent to the user for signin for a connection name.
     * @param context Context for the current turn of conversation with the user.
     * @param connectionName Name of the auth connection to use.
     * @param userId The user id that will be associated with the token.
     * @param finalRedirect The final URL that the OAuth flow will redirect to.
     */   
    getSignInResource(context: TurnContext, connectionName: string, userId: string, finalRedirect?: string, appCredentials?: AppCredentials): Promise<BotSignInGetSignInResourceResponse>;

    /**
     * Performs a token exchange operation such as for single sign-on.
     * @param context Context for the current turn of conversation with the user.
     * @param connectionName Name of the auth connection to use.
     * @param userId The user id that will be associated with the token.
     * @param tokenExchangeRequest The exchange request details, either a token to exchange or a uri to exchange.
     */  
    exchangeToken(context: TurnContext, connectionName: string, userId: string, tokenExchangeRequest: TokenExchangeRequest): Promise<TokenResponse>;
    
    /**
     * Performs a token exchange operation such as for single sign-on.
     * @param context Context for the current turn of conversation with the user.
     * @param connectionName Name of the auth connection to use.
     * @param userId The user id that will be associated with the token.
     * @param tokenExchangeRequest The exchange request details, either a token to exchange or a uri to exchange.
     */  
    exchangeToken(context: TurnContext, connectionName: string, userId: string, tokenExchangeRequest: TokenExchangeRequest, appCredentials: AppCredentials): Promise<TokenResponse>;
}