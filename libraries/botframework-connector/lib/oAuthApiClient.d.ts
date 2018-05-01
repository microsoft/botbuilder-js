/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import * as msRest from "ms-rest-js";
import * as Models from "botframework-schema";
import { ConnectorClient } from "./generated/connectorClient";
/** Exposes methods for calling the channels OAuth Methods. */
export declare class OAuthApiClient {
    private readonly client;
    /**
     * Create a Conversations.
     * @param {ConnectorClient} client Reference to the service client.
     */
    constructor(client: ConnectorClient);
    /**
     * @summary GetUserToken
     *
     * Attempts to retrieve the token for a user that's in a signin flow.
     *
     * @param {string} userId Id of the user being authenticated.
     *
     * @param {string} connectionName Name of the auth connection to use.
     *
     * @param {string} [magicCode] Optional user entered code to validate.
     *
     * @param {RequestOptionsBase} [options] Optional Parameters.
     *
     * @returns {Promise} A promise is returned
     *
     * @resolve {HttpOperationResponse} - The deserialized result object.
     *
     * @reject {Error|ServiceError} - The error object.
     */
    getUserTokenWithHttpOperationResponse(userId: string, connectionName: string, magicCode?: string, options?: msRest.RequestOptionsBase): Promise<msRest.HttpOperationResponse>;
    /**
     * @summary SignOutUser
     *
     * Signs the user out with the token server.
     *
     * @param {string} userId Id of the user to sign out.
     *
     * @param {string} connectionName Name of the auth connection to use.
     *
     * @param {RequestOptionsBase} [options] Optional Parameters.
     *
     * @returns {Promise} A promise is returned
     *
     * @resolve {HttpOperationResponse} - The deserialized result object.
     *
     * @reject {Error|ServiceError} - The error object.
     */
    signOutUserWithHttpOperationResponse(userId: string, connectionName: string, options?: msRest.RequestOptionsBase): Promise<msRest.HttpOperationResponse>;
    /**
     * @summary GetSignInLink
     *
     * Gets a signin link from the token server that can be sent as part of a SigninCard.
     *
     * @param {Models.ConversationReference} conversation conversation reference for the user signing in.
     *
     * @param {string} connectionName Name of the auth connection to use.
     *
     * @param {RequestOptionsBase} [options] Optional Parameters.
     *
     * @returns {Promise} A promise is returned
     *
     * @resolve {HttpOperationResponse} - The deserialized result object.
     *
     * @reject {Error|ServiceError} - The error object.
     */
    getSignInLinkWithHttpOperationResponse(conversation: Models.ConversationReference, connectionName: string, options?: msRest.RequestOptionsBase): Promise<msRest.HttpOperationResponse>;
    /**
     * @summary EmulateOAuthCards
     *
     * Tells the token service to emulate the sending of OAuthCards.
     *
     * @param {boolean} emulate If `true` the token service will emulate the sending of OAuthCards.
     *
     * @param {RequestOptionsBase} [options] Optional Parameters.
     *
     * @returns {Promise} A promise is returned
     *
     * @resolve {HttpOperationResponse} - The deserialized result object.
     *
     * @reject {Error|ServiceError} - The error object.
     */
    emulateOAuthCardsWithHttpOperationResponse(emulate: boolean, options?: msRest.RequestOptionsBase): Promise<msRest.HttpOperationResponse>;
    /**
     * @summary GetUserToken
     *
     * Attempts to retrieve the token for a user that's in a logging flow.
     *
     * @param {string} userId Id of the user being authenticated.
     *
     * @param {string} connectionName Name of the auth connection to use.
     *
     * @param {string} [magicCode] Optional user entered code to validate.
     *
     * @param {RequestOptionsBase} [options] Optional Parameters.
     */
    getUserToken(userId: string, connectionName: string, magicCode?: string, options?: msRest.RequestOptionsBase): Promise<Models.TokenResponse>;
    /**
     * @summary SignOutUser
     *
     * Signs the user out with the token server.
     *
     * @param {string} userId Id of the user to sign out.
     *
     * @param {string} connectionName Name of the auth connection to use.
     *
     * @param {RequestOptionsBase} [options] Optional Parameters.
     *
     * @returns {Promise} A promise is returned
     */
    signOutUser(userId: string, connectionName: string, options?: msRest.RequestOptionsBase): Promise<void>;
    /**
     * @summary GetSignInLink
     *
     * Gets a signin link from the token server that can be sent as part of a SigninCard.
     *
     * @param { Models.ConversationReference} conversation conversation reference for the user signing in.
     *
     * @param {string} connectionName Name of the auth connection to use.
     *
     * @param {RequestOptionsBase} [options] Optional Parameters.
     *
     * @returns {Promise} A promise is returned
     */
    getSignInLink(conversation: Models.ConversationReference, connectionName: string, options?: msRest.RequestOptionsBase): Promise<string>;
    /**
     * @summary EmulateOAuthCards
     *
     * Tells the token service to emulate the sending of OAuthCards for a channel.
     *
     * @param {boolean} emulate If `true` the token service will emulate the sending of OAuthCards.
     *
     * @param {RequestOptionsBase} [options] Optional Parameters.
     *
     * @returns {Promise} A promise is returned
     */
    emulateOAuthCards(emulate: boolean, options?: msRest.RequestOptionsBase): Promise<void>;
}
