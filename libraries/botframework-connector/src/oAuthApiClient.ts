/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import * as Models from 'botframework-schema';
import * as msRest from 'ms-rest-js';
import { MicrosoftAppCredentials } from './auth/microsoftAppCredentials';
import { ConnectorClient } from './generated/connectorClient';
import * as Mappers from './generated/models/mappers';

// this assignment exposes this type from an include which would otherwise not be seen by tslint
// tslint:disable-next-line:typedef
const WebResource = msRest.WebResource;

// Exposes methods for calling the channels OAuth Methods.
export class OAuthApiClient {
  private readonly client: ConnectorClient;
  /**
   * Create a Conversations.
   * @param {ConnectorClient} client Reference to the service client.
   */
  constructor(client: ConnectorClient) {
    this.client = client;
  }

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
  public async getUserTokenWithHttpOperationResponse(
    userId: string,
    connectionName: string,
    magicCode?: string,
    options?: msRest.RequestOptionsBase
  ): Promise<msRest.HttpOperationResponse> {
    const client: ConnectorClient = this.client;

    // Construct URL
    const baseUrl: string = this.client.baseUri;
    // tslint:disable-next-line:prefer-template
    let requestUrl: string = baseUrl + (baseUrl.endsWith('/') ? '' : '/') + `api/usertoken/GetToken`;
    const queryParamsArray: any[] = [];
    queryParamsArray.push(`userId=${encodeURIComponent(userId)}`);
    queryParamsArray.push(`connectionName=${encodeURIComponent(connectionName)}`);
    if (magicCode !== null && magicCode !== undefined) {
      queryParamsArray.push(`code=${encodeURIComponent(magicCode)}`);
    }
    requestUrl += `?${queryParamsArray.join('&')}`;

    // Create HTTP transport objects
    const httpRequest: msRest.WebResource = new WebResource();
    httpRequest.method = 'GET';
    httpRequest.url = requestUrl;
    httpRequest.headers = {};
    // Set Headers
    httpRequest.headers['Content-Type'] = 'application/json; charset=utf-8';
    if (options && options.customHeaders) {
        Object.keys(options.customHeaders).forEach((headerName: string) => {
          if (options.customHeaders.hasOwnProperty(headerName)) {
            httpRequest.headers[headerName] = options.customHeaders[headerName];
          }
        });
      }

    // Send Request
    let operationRes: msRest.HttpOperationResponse;
    try {
      operationRes = await client.pipeline(httpRequest);
      const response: Response = operationRes.response;
      const statusCode: number = response.status;
      if (statusCode === 404) {
        operationRes.bodyAsJson = undefined;
      } else if (statusCode !== 200) {
        const error: msRest.RestError = new msRest.RestError(operationRes.bodyAsText as string);
        error.statusCode = response.status;
        error.request = msRest.stripRequest(httpRequest);
        error.response = msRest.stripResponse(response);
        const parsedErrorResponse: any = operationRes.bodyAsJson as { [key: string]: any };
        try {
          if (parsedErrorResponse) {
            let internalError: any = null;
            if (parsedErrorResponse.error) { internalError = parsedErrorResponse.error; }
            error.code = internalError ? internalError.code : parsedErrorResponse.code;
            error.message = internalError ? internalError.message : parsedErrorResponse.message;
          }
          if (parsedErrorResponse !== null && parsedErrorResponse !== undefined) {
            const resultMapper: any = Mappers.ErrorResponse;
            error.body = client.serializer.deserialize(resultMapper, parsedErrorResponse, 'error.body');
          }
        } catch (defaultError) {
          error.message = `Error "${defaultError.message}" occurred in deserializing the responseBody ` +
                           `- "${operationRes.bodyAsText}" for the default response.`;

          return Promise.reject(error);
        }

        return Promise.reject(error);
      }
    } catch (err) {
      return Promise.reject(err);
    }

    return Promise.resolve(operationRes);
  }

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
  public async signOutUserWithHttpOperationResponse(
    userId: string,
    connectionName: string,
    options?: msRest.RequestOptionsBase
  ): Promise<msRest.HttpOperationResponse> {
    const client: ConnectorClient = this.client;

    // Construct URL
    const baseUrl: string = this.client.baseUri;
    // tslint:disable-next-line:prefer-template
    let requestUrl: string = baseUrl + (baseUrl.endsWith('/') ? '' : '/') + `api/usertoken/SignOut`;
    const queryParamsArray: any[] = [];
    queryParamsArray.push(`userId=${encodeURIComponent(userId)}`);
    queryParamsArray.push(`connectionName=${encodeURIComponent(connectionName)}`);
    requestUrl += `?${queryParamsArray.join('&')}`;

    // Create HTTP transport objects
    const httpRequest: msRest.WebResource = new WebResource();
    httpRequest.method = 'DELETE';
    httpRequest.url = requestUrl;
    httpRequest.headers = {};
    // Set Headers
    httpRequest.headers['Content-Type'] = 'application/json; charset=utf-8';
    if (options && options.customHeaders) {
        Object.keys(options.customHeaders).forEach((headerName: string) => {
          if (options.customHeaders.hasOwnProperty(headerName)) {
            httpRequest.headers[headerName] = options.customHeaders[headerName];
          }
        });
      }

    // Send Request
    let operationRes: msRest.HttpOperationResponse;
    try {
      operationRes = await client.pipeline(httpRequest);
      const response: Response = operationRes.response;
      const statusCode: number = response.status;
      if (statusCode !== 200) {
        const error: msRest.RestError = new msRest.RestError(operationRes.bodyAsText as string);
        error.statusCode = response.status;
        error.request = msRest.stripRequest(httpRequest);
        error.response = msRest.stripResponse(response);
        const parsedErrorResponse: any = operationRes.bodyAsJson as { [key: string]: any };
        try {
          if (parsedErrorResponse) {
            let internalError: any = null;
            if (parsedErrorResponse.error) { internalError = parsedErrorResponse.error; }
            error.code = internalError ? internalError.code : parsedErrorResponse.code;
            error.message = internalError ? internalError.message : parsedErrorResponse.message;
          }
          if (parsedErrorResponse !== null && parsedErrorResponse !== undefined) {
            const resultMapper: any = Mappers.ErrorResponse;
            error.body = client.serializer.deserialize(resultMapper, parsedErrorResponse, 'error.body');
          }
        } catch (defaultError) {
          error.message = `Error "${defaultError.message}" occurred in deserializing the responseBody ` +
                           `- "${operationRes.bodyAsText}" for the default response.`;

          return Promise.reject(error);
        }

        return Promise.reject(error);
      }

    } catch (err) {
      return Promise.reject(err);
    }

    return Promise.resolve(operationRes);
  }

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
  public async getSignInLinkWithHttpOperationResponse(
    conversation: Models.ConversationReference,
    connectionName: string,
    options?: msRest.RequestOptionsBase
  ): Promise<msRest.HttpOperationResponse> {
    const client: ConnectorClient = this.client;

    // Construct state object
    const state: any = {
      ConnectionName: connectionName,
      Conversation: conversation,
      MsAppId: (this.client.credentials as MicrosoftAppCredentials).appId
    };
    const finalState: string = Buffer.from(JSON.stringify(state)).toString('base64');

    // Construct URL
    const baseUrl: string = this.client.baseUri;
    // tslint:disable-next-line:prefer-template
    let requestUrl: string = baseUrl + (baseUrl.endsWith('/') ? '' : '/') + `api/botsignin/getsigninurl`;
    const queryParamsArray: any[] = [];
    queryParamsArray.push(`state=${encodeURIComponent(finalState)}`);
    requestUrl += `?${queryParamsArray.join('&')}`;

    // Create HTTP transport objects
    const httpRequest: msRest.WebResource = new WebResource();
    httpRequest.method = 'GET';
    httpRequest.url = requestUrl;
    httpRequest.headers = {};
    httpRequest.headers['Content-Type'] = 'text/plain';
    // Set Headers
    if (options && options.customHeaders) {
      Object.keys(options.customHeaders).forEach((headerName: string) => {
        if (options.customHeaders.hasOwnProperty(headerName)) {
          httpRequest.headers[headerName] = options.customHeaders[headerName];
        }
      });
    }

    httpRequest.rawResponse = true;

    // Send Request
    let operationRes: msRest.HttpOperationResponse;
    try {
      operationRes = await client.pipeline(httpRequest);
      const response: Response = operationRes.response;
      const statusCode: number = response.status;
      if (statusCode !== 200) {
        const error: msRest.RestError = new msRest.RestError(operationRes.bodyAsText as string);
        error.statusCode = response.status;
        error.request = msRest.stripRequest(httpRequest);
        error.response = msRest.stripResponse(response);
        const parsedErrorResponse: any = operationRes.bodyAsJson as { [key: string]: any };
        try {
          if (parsedErrorResponse) {
            let internalError: any = null;
            if (parsedErrorResponse.error) { internalError = parsedErrorResponse.error; }
            error.code = internalError ? internalError.code : parsedErrorResponse.code;
            error.message = internalError ? internalError.message : parsedErrorResponse.message;
          }
          if (parsedErrorResponse !== null && parsedErrorResponse !== undefined) {
            const resultMapper: any = Mappers.ErrorResponse;
            error.body = client.serializer.deserialize(resultMapper, parsedErrorResponse, 'error.body');
          }
        } catch (defaultError) {
          error.message = `Error "${defaultError.message}" occurred in deserializing the responseBody ` +
                           `- "${operationRes.bodyAsText}" for the default response.`;

          return Promise.reject(error);
        }

        return Promise.reject(error);
      } else {
        // read the repsonse text
        operationRes.bodyAsText = await response.text();
      }
    } catch (err) {
      return Promise.reject(err);
    }

    return Promise.resolve(operationRes);
  }

  /**
   * @summary GetAadTokens
   *
   * Gets Azure Active Directory tokens for specific resource URLs
   * once the user has looged into a particure AAD connection.
   *
   * @param {string} userId Id of the user.
   *
   * @param {string} connectionName Name of the auth connection to use.
   *
   * @param {string[]} resourceUrls The resource URLs for which to get tokens.
   *
   * @param {RequestOptionsBase} [options] Optional Parameters.
   *
   * @returns {Promise} A promise is returned
   *
   * @resolve {HttpOperationResponse} - The deserialized result object.
   *
   * @reject {Error|ServiceError} - The error object.
   */
  public async getAadTokensWithHttpOperationResponse(
    userId: string,
    connectionName: string,
    resourceUrls: Models.AadResourceUrls,
    options?: msRest.RequestOptionsBase
  ): Promise<msRest.HttpOperationResponse> {
    const client: ConnectorClient = this.client;

    // Construct URL
    const baseUrl: string = this.client.baseUri;
    // tslint:disable-next-line:prefer-template
    let requestUrl: string = baseUrl + (baseUrl.endsWith('/') ? '' : '/') + `api/usertoken/GetAadTokens`;
    const queryParamsArray: any[] = [];
    queryParamsArray.push(`userId=${encodeURIComponent(userId)}`);
    queryParamsArray.push(`connectionName=${encodeURIComponent(connectionName)}`);
    requestUrl += `?${queryParamsArray.join('&')}`;

    // Create HTTP transport objects
    const httpRequest: msRest.WebResource = new WebResource();
    httpRequest.method = 'POST';
    httpRequest.url = requestUrl;
    httpRequest.headers = {};
    // Set Headers
    httpRequest.headers['Content-Type'] = 'application/json; charset=utf-8';
    if (options && options.customHeaders) {
        Object.keys(options.customHeaders).forEach((headerName: string) => {
          if (options.customHeaders.hasOwnProperty(headerName)) {
            httpRequest.headers[headerName] = options.customHeaders[headerName];
          }
        });
      }

    // Serialize Request
    let requestContent = null;
    try {
      if (resourceUrls !== null && resourceUrls !== undefined) {
        requestContent = JSON.stringify(resourceUrls);
      }
    } catch (error) {
      let serializationError = new Error(`Error "${error.message}" occurred in serializing the ` +
          `payload - ${JSON.stringify(resourceUrls, null, 2)}.`);
      return Promise.reject(serializationError);
    }
    httpRequest.body = requestContent;

    // Send Request
    let operationRes: msRest.HttpOperationResponse;
    try {
      operationRes = await client.pipeline(httpRequest);
      const response: Response = operationRes.response;
      const statusCode: number = response.status;
      if (statusCode !== 200 && statusCode !== 404) {
        const error: msRest.RestError = new msRest.RestError(operationRes.bodyAsText as string);
        error.statusCode = response.status;
        error.request = msRest.stripRequest(httpRequest);
        error.response = msRest.stripResponse(response);
        const parsedErrorResponse: any = operationRes.bodyAsJson as { [key: string]: any };
        try {
          if (parsedErrorResponse) {
            let internalError: any = null;
            if (parsedErrorResponse.error) { internalError = parsedErrorResponse.error; }
            error.code = internalError ? internalError.code : parsedErrorResponse.code;
            error.message = internalError ? internalError.message : parsedErrorResponse.message;
          }
          if (parsedErrorResponse !== null && parsedErrorResponse !== undefined) {
            const resultMapper: any = Mappers.ErrorResponse;
            error.body = client.serializer.deserialize(resultMapper, parsedErrorResponse, 'error.body');
          }
        } catch (defaultError) {
          error.message = `Error "${defaultError.message}" occurred in deserializing the responseBody ` +
                           `- "${operationRes.bodyAsText}" for the default response.`;

          return Promise.reject(error);
        }

        return Promise.reject(error);
      }

    } catch (err) {
      return Promise.reject(err);
    }

    return Promise.resolve(operationRes);
  }

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
  public async emulateOAuthCardsWithHttpOperationResponse(
    emulate: boolean,
    options?: msRest.RequestOptionsBase
  ): Promise<msRest.HttpOperationResponse> {
    const client: ConnectorClient = this.client;

    // Construct URL
    const baseUrl: string = this.client.baseUri;
    // tslint:disable-next-line:prefer-template
    let requestUrl: string = baseUrl + (baseUrl.endsWith('/') ? '' : '/') + `api/usertoken/emulateOAuthCards`;
    const queryParamsArray: any[] = [];
    queryParamsArray.push(`emulate=${(!!emulate).toString()}`);
    requestUrl += `?${queryParamsArray.join('&')}`;

    // Create HTTP transport objects
    const httpRequest: msRest.WebResource = new WebResource();
    httpRequest.method = 'POST';
    httpRequest.url = requestUrl;
    httpRequest.headers = {};
    // Set Headers
    if (options && options.customHeaders) {
        Object.keys(options.customHeaders).forEach((headerName: string) => {
          if (options.customHeaders.hasOwnProperty(headerName)) {
            httpRequest.headers[headerName] = options.customHeaders[headerName];
          }
        });
      }

    // Send Request
    let operationRes: msRest.HttpOperationResponse;
    try {
      operationRes = await client.pipeline(httpRequest);
      const response: Response = operationRes.response;
      const statusCode: number = response.status;
      if (statusCode !== 200) {
        const error: msRest.RestError = new msRest.RestError(operationRes.bodyAsText as string);
        error.statusCode = response.status;
        error.request = msRest.stripRequest(httpRequest);
        error.response = msRest.stripResponse(response);
        const parsedErrorResponse: any = operationRes.bodyAsJson as { [key: string]: any };
        try {
          if (parsedErrorResponse) {
            let internalError: any = null;
            if (parsedErrorResponse.error) { internalError = parsedErrorResponse.error; }
            error.code = internalError ? internalError.code : parsedErrorResponse.code;
            error.message = internalError ? internalError.message : parsedErrorResponse.message;
          }
          if (parsedErrorResponse !== null && parsedErrorResponse !== undefined) {
            const resultMapper: any = Mappers.ErrorResponse;
            error.body = client.serializer.deserialize(resultMapper, parsedErrorResponse, 'error.body');
          }
        } catch (defaultError) {
          error.message = `Error "${defaultError.message}" occurred in deserializing the responseBody ` +
                           `- "${operationRes.bodyAsText}" for the default response.`;

          return Promise.reject(error);
        }

        return Promise.reject(error);
      }

    } catch (err) {
      return Promise.reject(err);
    }

    return Promise.resolve(operationRes);
  }

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
  public getUserToken(
    userId: string,
    connectionName: string,
    magicCode?: string,
    options?: msRest.RequestOptionsBase
  ): Promise<Models.TokenResponse> {
    return this.getUserTokenWithHttpOperationResponse(userId, connectionName, magicCode, options).then(
      (operationRes: msRest.HttpOperationResponse) => {
      return Promise.resolve(operationRes.bodyAsJson as Models.TokenResponse);
      }).catch((err: Error) => {
      return Promise.reject(err);
    });
  }

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
  public async signOutUser(userId: string, connectionName: string, options?: msRest.RequestOptionsBase): Promise<void> {
    return this.signOutUserWithHttpOperationResponse(userId, connectionName, options).then((operationRes: msRest.HttpOperationResponse) => {
      return Promise.resolve();
    }).catch((err: Error) => {
      return Promise.reject(err);
    });
  }

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
  public async getSignInLink(
    conversation: Models.ConversationReference,
    connectionName: string,
    options?: msRest.RequestOptionsBase
  ): Promise<string> {
    return this.getSignInLinkWithHttpOperationResponse(
      conversation,
      connectionName,
      options
    ).then((operationRes: msRest.HttpOperationResponse) => {
      return Promise.resolve(operationRes.bodyAsText);
    }).catch((err: Error) => {
      return Promise.reject(err);
    });
  }

    /**
   * @summary GetAadTokens
   * Gets Azure Active Directory tokens for specific resource URLs
   * once the user has looged into a particure AAD connection.
   *
   * @param {string} userId Id of the user.
   *
   * @param {string} connectionName Name of the auth connection to use.
   *
   * @param {string[]} resourceUrls The resource URLs for which to get tokens.
   *
   * @param {RequestOptionsBase} [options] Optional Parameters.
   *
   * @returns {Promise} A promise is returned
   */
  public async getAadTokens(userId: string, connectionName: string, resourceUrls: Models.AadResourceUrls, options?: msRest.RequestOptionsBase): Promise<Models.TokenResponseMap> {
    return this.getAadTokensWithHttpOperationResponse(userId, connectionName, resourceUrls, options).then((operationRes: msRest.HttpOperationResponse) => {
      return Promise.resolve(operationRes.bodyAsJson as Models.TokenResponseMap);
    }).catch((err: Error) => {
      return Promise.reject(err);
    });
  }

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
  public async emulateOAuthCards(emulate: boolean, options?: msRest.RequestOptionsBase): Promise<void> {
    return this.emulateOAuthCardsWithHttpOperationResponse(emulate, options).then((operationRes: msRest.HttpOperationResponse) => {
      return Promise.resolve();
    }).catch((err: Error) => {
      return Promise.reject(err);
    });
  }
}
