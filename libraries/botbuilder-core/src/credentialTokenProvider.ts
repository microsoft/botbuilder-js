/**
 * @module botbuilder-core
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { AppCredentialsProvider } from './appCredentialsProvider';
import { IUserTokenProvider } from './userTokenProvider';
import { TurnContext } from './turnContext';
import { TokenResponse } from 'botframework-schema';

export interface CredentialTokenProvider extends IUserTokenProvider {
    /**
     * Retrieves the OAuth token for a user that is in a sign-in flow.
     * @param context Context for the current turn of conversation with the user.
     * @param connectionName Name of the auth connection to use.
     * @param magicCode (Optional) Optional user entered code to validate.
     */
    getUserToken(context: TurnContext, connectionName: string, magicCode?: string, appCredentials?: AppCredentialsProvider): Promise<TokenResponse>;

    /**
     * Signs the user out with the token server.
     * @param context Context for the current turn of conversation with the user.
     * @param connectionName Name of the auth connection to use.
     * @param userId User id of user to sign out.
     * @param oAuthAppCredentials AppCredentials for OAuth.
     */
    signOutUser(context: TurnContext, connectionName: string, userId?: string, appCredentials?: AppCredentialsProvider): Promise<void>;

    /**
     * Gets a signin link from the token server that can be sent as part of a SigninCard.
     * @param context Context for the current turn of conversation with the user.
     * @param connectionName Name of the auth connection to use.
     * @param oAuthAppCredentials AppCredentials for OAuth.
     */
    getSignInLink(context: TurnContext, connectionName: string, appCredentials?: AppCredentialsProvider): Promise<string>;

    /**
     * Signs the user out with the token server.
     * @param context Context for the current turn of conversation with the user.
     * @param connectionName Name of the auth connection to use.
     * @param oAuthAppCredentials AppCredentials for OAuth.
     */
    getAadTokens(context: TurnContext, connectionName: string, resourceUrls: string[], appCredentials?: AppCredentialsProvider): Promise<{
        [propertyName: string]: TokenResponse;
    }>;
}
