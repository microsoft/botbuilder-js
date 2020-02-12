/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { IUserTokenProvider, TokenResponse, TurnContext } from 'botbuilder-core';
import { AppCredentials } from 'botframework-connector';

export interface ICredentialTokenProvider extends IUserTokenProvider {
    /**
     * Retrieves the OAuth token for a user that is in a sign-in flow.
     * @param context Context for the current turn of conversation with the user.
     * @param connectionName Name of the auth connection to use.
     * @param magicCode (Optional) Optional user entered code to validate.
     */
    getUserToken(context: TurnContext, connectionName: string, magicCode?: string, appCredential?: AppCredentials): Promise<TokenResponse>;

    /**
     * Signs the user out with the token server.
     * @param context Context for the current turn of conversation with the user.
     * @param connectionName Name of the auth connection to use.
     * @param oAuthAppCredentials AppCredentials for OAuth.
     */
    signOutUser(context: TurnContext, connectionName: string, appCredentials?: AppCredentials): Promise<void>;

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
}
