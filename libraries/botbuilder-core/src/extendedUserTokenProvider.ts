/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import {IUserTokenProvider} from './userTokenProvider'
import { TurnContext } from './turnContext';
import { TokenResponse } from 'botframework-schema';
import {BotSignInGetSignInResourceResponse, TokenExchangeRequest} from 'botframework-connector'

/**
 * Interface for User Token OAuth Single Sign On and Token Exchange APIs for BotAdapters
 */
export interface IExtendedUserTokenProvider extends IUserTokenProvider{
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
    // one more overload of getSignInResource with AppCredentials

    /**
     * Performs a token exchange operation such as for single sign-on.
     * @param context Context for the current turn of conversation with the user.
     * @param connectionName Name of the auth connection to use.
     * @param userId The user id that will be associated with the token.
     * @param tokenExchangeRequest The exchange request details, either a token to exchange or a uri to exchange.
     */  
    exchangeToken(context: TurnContext, connectionName: string, userId: string, tokenExchangeRequest: TokenExchangeRequest): Promise<TokenResponse>;
    //overload of exchangeToken with AppCredentials
}