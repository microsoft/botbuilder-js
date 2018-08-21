/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */

import * as msRest from "ms-rest-js";
import * as Models from "botframework-schema";
import * as Mappers from "../models/mappers";
import { ConnectorClient } from "../connectorClient";

const WebResource = msRest.WebResource;

/** Class representing a Conversations. */
export class Conversations {
  private readonly client: ConnectorClient;
  /**
   * Create a Conversations.
   * @param {ConnectorClient} client Reference to the service client.
   */
  constructor(client: ConnectorClient) {
    this.client = client;
  }

  /**
   * @summary GetConversations
   *
   * List the Conversations in which this bot has participated.
   *
   * GET from this method with a skip token
   *
   * The return value is a ConversationsResult, which contains an array of
   * ConversationMembers and a skip token.  If the skip token is not empty, then
   * there are further values to be returned. Call this method again with the
   * returned token to get more values.
   *
   * Each ConversationMembers object contains the ID of the conversation and an
   * array of ChannelAccounts that describe the members of the conversation.
   *
   * @param {ConversationsGetConversationsOptionalParams} [options] Optional
   * Parameters.
   *
   * @returns {Promise} A promise is returned
   *
   * @resolve {HttpOperationResponse} - The deserialized result object.
   *
   * @reject {Error|ServiceError} - The error object.
   */
  async getConversationsWithHttpOperationResponse(options?: Models.ConversationsGetConversationsOptionalParams): Promise<msRest.HttpOperationResponse> {
    let client = this.client;
    let continuationToken = (options && options.continuationToken !== undefined) ? options.continuationToken : undefined;
    // Validate
    try {
      if (continuationToken !== null && continuationToken !== undefined && typeof continuationToken.valueOf() !== 'string') {
        throw new Error('continuationToken must be of type string.');
      }
    } catch (error) {
      return Promise.reject(error);
    }

    // Construct URL
    let baseUrl = this.client.baseUri;
    let requestUrl = baseUrl + (baseUrl.endsWith('/') ? '' : '/') + 'v3/conversations';
    let queryParamsArray: Array<any> = [];
    if (continuationToken !== null && continuationToken !== undefined) {
      queryParamsArray.push('continuationToken=' + encodeURIComponent(continuationToken));
    }
    if (queryParamsArray.length > 0) {
      requestUrl += '?' + queryParamsArray.join('&');
    }

    // Create HTTP transport objects
    let httpRequest = new WebResource();
    httpRequest.method = 'GET';
    httpRequest.url = requestUrl;
    httpRequest.headers = {};
    // Set Headers
    httpRequest.headers['Content-Type'] = 'application/json; charset=utf-8';
    if(options && options.customHeaders) {
      for(let headerName in options.customHeaders) {
        if (options.customHeaders.hasOwnProperty(headerName)) {
          httpRequest.headers[headerName] = options.customHeaders[headerName];
        }
      }
    }
    // Send Request
    let operationRes: msRest.HttpOperationResponse;
    try {
      operationRes = await client.pipeline(httpRequest);
      let response = operationRes.response;
      let statusCode = response.status;
      if (statusCode !== 200) {
        let error = new msRest.RestError(operationRes.bodyAsText as string);
        error.statusCode = response.status;
        error.request = msRest.stripRequest(httpRequest);
        error.response = msRest.stripResponse(response);
        let parsedErrorResponse = operationRes.bodyAsJson as { [key: string]: any };
        try {
          if (parsedErrorResponse) {
            let internalError = null;
            if (parsedErrorResponse.error) internalError = parsedErrorResponse.error;
            error.code = internalError ? internalError.code : parsedErrorResponse.code;
            error.message = internalError ? internalError.message : parsedErrorResponse.message;
          }
          if (parsedErrorResponse !== null && parsedErrorResponse !== undefined) {
            let resultMapper = Mappers.ErrorResponse;
            error.body = client.serializer.deserialize(resultMapper, parsedErrorResponse, 'error.body');
          }
        } catch (defaultError) {
          error.message = `Error "${defaultError.message}" occurred in deserializing the responseBody ` +
                           `- "${operationRes.bodyAsText}" for the default response.`;
          return Promise.reject(error);
        }
        return Promise.reject(error);
      }
      // Deserialize Response
      if (statusCode === 200) {
        let parsedResponse = operationRes.bodyAsJson as { [key: string]: any };
        try {
          if (parsedResponse !== null && parsedResponse !== undefined) {
            let resultMapper = Mappers.ConversationsResult;
            operationRes.bodyAsJson = client.serializer.deserialize(resultMapper, parsedResponse, 'operationRes.bodyAsJson');
          }
        } catch (error) {
          let deserializationError = new msRest.RestError(`Error ${error} occurred in deserializing the responseBody - ${operationRes.bodyAsText}`);
          deserializationError.request = msRest.stripRequest(httpRequest);
          deserializationError.response = msRest.stripResponse(response);
          return Promise.reject(deserializationError);
        }
      }

    } catch(err) {
      return Promise.reject(err);
    }

    return Promise.resolve(operationRes);
  }

  /**
   * @summary CreateConversation
   *
   * Create a new Conversation.
   *
   * POST to this method with a
   * * Bot being the bot creating the conversation
   * * IsGroup set to true if this is not a direct message (default is false)
   * * Members array contining the members you want to have be in the
   * conversation.
   *
   * The return value is a ResourceResponse which contains a conversation id
   * which is suitable for use
   * in the message payload and REST API uris.
   *
   * Most channels only support the semantics of bots initiating a direct message
   * conversation.  An example of how to do that would be:
   *
   * ```
   * var resource = await connector.conversations.CreateConversation(new
   * ConversationParameters(){ Bot = bot, members = new ChannelAccount[] { new
   * ChannelAccount("user1") } );
   * await connect.Conversations.SendToConversationAsync(resource.Id, new
   * Activity() ... ) ;
   *
   * ```
   *
   * @param {ConversationParameters} parameters Parameters to create the
   * conversation from
   *
   * @param {RequestOptionsBase} [options] Optional Parameters.
   *
   * @returns {Promise} A promise is returned
   *
   * @resolve {HttpOperationResponse} - The deserialized result object.
   *
   * @reject {Error|ServiceError} - The error object.
   */
  async createConversationWithHttpOperationResponse(parameters: Models.ConversationParameters, options?: msRest.RequestOptionsBase): Promise<msRest.HttpOperationResponse> {
    let client = this.client;
    // Validate
    try {
      if (parameters === null || parameters === undefined) {
        throw new Error('parameters cannot be null or undefined.');
      }
    } catch (error) {
      return Promise.reject(error);
    }

    // Construct URL
    let baseUrl = this.client.baseUri;
    let requestUrl = baseUrl + (baseUrl.endsWith('/') ? '' : '/') + 'v3/conversations';

    // Create HTTP transport objects
    let httpRequest = new WebResource();
    httpRequest.method = 'POST';
    httpRequest.url = requestUrl;
    httpRequest.headers = {};
    // Set Headers
    httpRequest.headers['Content-Type'] = 'application/json; charset=utf-8';
    if(options && options.customHeaders) {
      for(let headerName in options.customHeaders) {
        if (options.customHeaders.hasOwnProperty(headerName)) {
          httpRequest.headers[headerName] = options.customHeaders[headerName];
        }
      }
    }
    // Serialize Request
    let requestContent = null;
    let requestModel = null;
    try {
      if (parameters !== null && parameters !== undefined) {
        let requestModelMapper = Mappers.ConversationParameters;
        requestModel = client.serializer.serialize(requestModelMapper, parameters, 'parameters');
        requestContent = JSON.stringify(requestModel);
      }
    } catch (error) {
      let serializationError = new Error(`Error "${error.message}" occurred in serializing the ` +
          `payload - ${JSON.stringify(parameters, null, 2)}.`);
      return Promise.reject(serializationError);
    }
    httpRequest.body = requestContent;
    // Send Request
    let operationRes: msRest.HttpOperationResponse;
    try {
      operationRes = await client.pipeline(httpRequest);
      let response = operationRes.response;
      let statusCode = response.status;
      if (statusCode !== 200 && statusCode !== 201 && statusCode !== 202) {
        let error = new msRest.RestError(operationRes.bodyAsText as string);
        error.statusCode = response.status;
        error.request = msRest.stripRequest(httpRequest);
        error.response = msRest.stripResponse(response);
        let parsedErrorResponse = operationRes.bodyAsJson as { [key: string]: any };
        try {
          if (parsedErrorResponse) {
            let internalError = null;
            if (parsedErrorResponse.error) internalError = parsedErrorResponse.error;
            error.code = internalError ? internalError.code : parsedErrorResponse.code;
            error.message = internalError ? internalError.message : parsedErrorResponse.message;
          }
          if (parsedErrorResponse !== null && parsedErrorResponse !== undefined) {
            let resultMapper = Mappers.ErrorResponse;
            error.body = client.serializer.deserialize(resultMapper, parsedErrorResponse, 'error.body');
          }
        } catch (defaultError) {
          error.message = `Error "${defaultError.message}" occurred in deserializing the responseBody ` +
                           `- "${operationRes.bodyAsText}" for the default response.`;
          return Promise.reject(error);
        }
        return Promise.reject(error);
      }
      // Deserialize Response
      if (statusCode === 200) {
        let parsedResponse = operationRes.bodyAsJson as { [key: string]: any };
        try {
          if (parsedResponse !== null && parsedResponse !== undefined) {
            let resultMapper = Mappers.ConversationResourceResponse;
            operationRes.bodyAsJson = client.serializer.deserialize(resultMapper, parsedResponse, 'operationRes.bodyAsJson');
          }
        } catch (error) {
          let deserializationError = new msRest.RestError(`Error ${error} occurred in deserializing the responseBody - ${operationRes.bodyAsText}`);
          deserializationError.request = msRest.stripRequest(httpRequest);
          deserializationError.response = msRest.stripResponse(response);
          return Promise.reject(deserializationError);
        }
      }
      // Deserialize Response
      if (statusCode === 201) {
        let parsedResponse = operationRes.bodyAsJson as { [key: string]: any };
        try {
          if (parsedResponse !== null && parsedResponse !== undefined) {
            let resultMapper = Mappers.ConversationResourceResponse;
            operationRes.bodyAsJson = client.serializer.deserialize(resultMapper, parsedResponse, 'operationRes.bodyAsJson');
          }
        } catch (error) {
          let deserializationError1 = new msRest.RestError(`Error ${error} occurred in deserializing the responseBody - ${operationRes.bodyAsText}`);
          deserializationError1.request = msRest.stripRequest(httpRequest);
          deserializationError1.response = msRest.stripResponse(response);
          return Promise.reject(deserializationError1);
        }
      }
      // Deserialize Response
      if (statusCode === 202) {
        let parsedResponse = operationRes.bodyAsJson as { [key: string]: any };
        try {
          if (parsedResponse !== null && parsedResponse !== undefined) {
            let resultMapper = Mappers.ConversationResourceResponse;
            operationRes.bodyAsJson = client.serializer.deserialize(resultMapper, parsedResponse, 'operationRes.bodyAsJson');
          }
        } catch (error) {
          let deserializationError2 = new msRest.RestError(`Error ${error} occurred in deserializing the responseBody - ${operationRes.bodyAsText}`);
          deserializationError2.request = msRest.stripRequest(httpRequest);
          deserializationError2.response = msRest.stripResponse(response);
          return Promise.reject(deserializationError2);
        }
      }

    } catch(err) {
      return Promise.reject(err);
    }

    return Promise.resolve(operationRes);
  }

  /**
   * @summary SendToConversation
   *
   * This method allows you to send an activity to the end of a conversation.
   *
   * This is slightly different from ReplyToActivity().
   * * SendToConverstion(conversationId) - will append the activity to the end of
   * the conversation according to the timestamp or semantics of the channel.
   * * ReplyToActivity(conversationId,ActivityId) - adds the activity as a reply
   * to another activity, if the channel supports it. If the channel does not
   * support nested replies, ReplyToActivity falls back to SendToConversation.
   *
   * Use ReplyToActivity when replying to a specific activity in the
   * conversation.
   *
   * Use SendToConversation in all other cases.
   *
   * @param {string} conversationId Conversation ID
   *
   * @param {Activity} activity Activity to send
   *
   * @param {RequestOptionsBase} [options] Optional Parameters.
   *
   * @returns {Promise} A promise is returned
   *
   * @resolve {HttpOperationResponse} - The deserialized result object.
   *
   * @reject {Error|ServiceError} - The error object.
   */
  async sendToConversationWithHttpOperationResponse(conversationId: string, activity: Models.Activity, options?: msRest.RequestOptionsBase): Promise<msRest.HttpOperationResponse> {
    let client = this.client;
    // Validate
    try {
      if (conversationId === null || conversationId === undefined || typeof conversationId.valueOf() !== 'string') {
        throw new Error('conversationId cannot be null or undefined and it must be of type string.');
      }
      if (activity === null || activity === undefined) {
        throw new Error('activity cannot be null or undefined.');
      }
    } catch (error) {
      return Promise.reject(error);
    }

    // Construct URL
    let baseUrl = this.client.baseUri;
    let requestUrl = baseUrl + (baseUrl.endsWith('/') ? '' : '/') + 'v3/conversations/{conversationId}/activities';
    requestUrl = requestUrl.replace('{conversationId}', encodeURIComponent(conversationId));

    // Create HTTP transport objects
    let httpRequest = new WebResource();
    httpRequest.method = 'POST';
    httpRequest.url = requestUrl;
    httpRequest.headers = {};
    // Set Headers
    httpRequest.headers['Content-Type'] = 'application/json; charset=utf-8';
    if(options && options.customHeaders) {
      for(let headerName in options.customHeaders) {
        if (options.customHeaders.hasOwnProperty(headerName)) {
          httpRequest.headers[headerName] = options.customHeaders[headerName];
        }
      }
    }
    // Serialize Request
    let requestContent = null;
    let requestModel = null;
    try {
      if (activity !== null && activity !== undefined) {
        let requestModelMapper = Mappers.Activity;
        requestModel = client.serializer.serialize(requestModelMapper, activity, 'activity');
        requestContent = JSON.stringify(requestModel);
      }
    } catch (error) {
      let serializationError = new Error(`Error "${error.message}" occurred in serializing the ` +
          `payload - ${JSON.stringify(activity, null, 2)}.`);
      return Promise.reject(serializationError);
    }
    httpRequest.body = requestContent;
    // Send Request
    let operationRes: msRest.HttpOperationResponse;
    try {
      operationRes = await client.pipeline(httpRequest);
      let response = operationRes.response;
      let statusCode = response.status;
      if (statusCode !== 200 && statusCode !== 201 && statusCode !== 202) {
        let error = new msRest.RestError(operationRes.bodyAsText as string);
        error.statusCode = response.status;
        error.request = msRest.stripRequest(httpRequest);
        error.response = msRest.stripResponse(response);
        let parsedErrorResponse = operationRes.bodyAsJson as { [key: string]: any };
        try {
          if (parsedErrorResponse) {
            let internalError = null;
            if (parsedErrorResponse.error) internalError = parsedErrorResponse.error;
            error.code = internalError ? internalError.code : parsedErrorResponse.code;
            error.message = internalError ? internalError.message : parsedErrorResponse.message;
          }
          if (parsedErrorResponse !== null && parsedErrorResponse !== undefined) {
            let resultMapper = Mappers.ErrorResponse;
            error.body = client.serializer.deserialize(resultMapper, parsedErrorResponse, 'error.body');
          }
        } catch (defaultError) {
          error.message = `Error "${defaultError.message}" occurred in deserializing the responseBody ` +
                           `- "${operationRes.bodyAsText}" for the default response.`;
          return Promise.reject(error);
        }
        return Promise.reject(error);
      }
      // Deserialize Response
      if (statusCode === 200) {
        let parsedResponse = operationRes.bodyAsJson as { [key: string]: any };
        try {
          if (parsedResponse !== null && parsedResponse !== undefined) {
            let resultMapper = Mappers.ResourceResponse;
            operationRes.bodyAsJson = client.serializer.deserialize(resultMapper, parsedResponse, 'operationRes.bodyAsJson');
          }
        } catch (error) {
          let deserializationError = new msRest.RestError(`Error ${error} occurred in deserializing the responseBody - ${operationRes.bodyAsText}`);
          deserializationError.request = msRest.stripRequest(httpRequest);
          deserializationError.response = msRest.stripResponse(response);
          return Promise.reject(deserializationError);
        }
      }
      // Deserialize Response
      if (statusCode === 201) {
        let parsedResponse = operationRes.bodyAsJson as { [key: string]: any };
        try {
          if (parsedResponse !== null && parsedResponse !== undefined) {
            let resultMapper = Mappers.ResourceResponse;
            operationRes.bodyAsJson = client.serializer.deserialize(resultMapper, parsedResponse, 'operationRes.bodyAsJson');
          }
        } catch (error) {
          let deserializationError1 = new msRest.RestError(`Error ${error} occurred in deserializing the responseBody - ${operationRes.bodyAsText}`);
          deserializationError1.request = msRest.stripRequest(httpRequest);
          deserializationError1.response = msRest.stripResponse(response);
          return Promise.reject(deserializationError1);
        }
      }
      // Deserialize Response
      if (statusCode === 202) {
        let parsedResponse = operationRes.bodyAsJson as { [key: string]: any };
        try {
          if (parsedResponse !== null && parsedResponse !== undefined) {
            let resultMapper = Mappers.ResourceResponse;
            operationRes.bodyAsJson = client.serializer.deserialize(resultMapper, parsedResponse, 'operationRes.bodyAsJson');
          }
        } catch (error) {
          let deserializationError2 = new msRest.RestError(`Error ${error} occurred in deserializing the responseBody - ${operationRes.bodyAsText}`);
          deserializationError2.request = msRest.stripRequest(httpRequest);
          deserializationError2.response = msRest.stripResponse(response);
          return Promise.reject(deserializationError2);
        }
      }

    } catch(err) {
      return Promise.reject(err);
    }

    return Promise.resolve(operationRes);
  }

  /**
   * @summary UpdateActivity
   *
   * Edit an existing activity.
   *
   * Some channels allow you to edit an existing activity to reflect the new
   * state of a bot conversation.
   *
   * For example, you can remove buttons after someone has clicked "Approve"
   * button.
   *
   * @param {string} conversationId Conversation ID
   *
   * @param {string} activityId activityId to update
   *
   * @param {Activity} activity replacement Activity
   *
   * @param {RequestOptionsBase} [options] Optional Parameters.
   *
   * @returns {Promise} A promise is returned
   *
   * @resolve {HttpOperationResponse} - The deserialized result object.
   *
   * @reject {Error|ServiceError} - The error object.
   */
  async updateActivityWithHttpOperationResponse(conversationId: string, activityId: string, activity: Models.Activity, options?: msRest.RequestOptionsBase): Promise<msRest.HttpOperationResponse> {
    let client = this.client;
    // Validate
    try {
      if (conversationId === null || conversationId === undefined || typeof conversationId.valueOf() !== 'string') {
        throw new Error('conversationId cannot be null or undefined and it must be of type string.');
      }
      if (activityId === null || activityId === undefined || typeof activityId.valueOf() !== 'string') {
        throw new Error('activityId cannot be null or undefined and it must be of type string.');
      }
      if (activity === null || activity === undefined) {
        throw new Error('activity cannot be null or undefined.');
      }
    } catch (error) {
      return Promise.reject(error);
    }

    // Construct URL
    let baseUrl = this.client.baseUri;
    let requestUrl = baseUrl + (baseUrl.endsWith('/') ? '' : '/') + 'v3/conversations/{conversationId}/activities/{activityId}';
    requestUrl = requestUrl.replace('{conversationId}', encodeURIComponent(conversationId));
    requestUrl = requestUrl.replace('{activityId}', encodeURIComponent(activityId));

    // Create HTTP transport objects
    let httpRequest = new WebResource();
    httpRequest.method = 'PUT';
    httpRequest.url = requestUrl;
    httpRequest.headers = {};
    // Set Headers
    httpRequest.headers['Content-Type'] = 'application/json; charset=utf-8';
    if(options && options.customHeaders) {
      for(let headerName in options.customHeaders) {
        if (options.customHeaders.hasOwnProperty(headerName)) {
          httpRequest.headers[headerName] = options.customHeaders[headerName];
        }
      }
    }
    // Serialize Request
    let requestContent = null;
    let requestModel = null;
    try {
      if (activity !== null && activity !== undefined) {
        let requestModelMapper = Mappers.Activity;
        requestModel = client.serializer.serialize(requestModelMapper, activity, 'activity');
        requestContent = JSON.stringify(requestModel);
      }
    } catch (error) {
      let serializationError = new Error(`Error "${error.message}" occurred in serializing the ` +
          `payload - ${JSON.stringify(activity, null, 2)}.`);
      return Promise.reject(serializationError);
    }
    httpRequest.body = requestContent;
    // Send Request
    let operationRes: msRest.HttpOperationResponse;
    try {
      operationRes = await client.pipeline(httpRequest);
      let response = operationRes.response;
      let statusCode = response.status;
      if (statusCode !== 200 && statusCode !== 201 && statusCode !== 202) {
        let error = new msRest.RestError(operationRes.bodyAsText as string);
        error.statusCode = response.status;
        error.request = msRest.stripRequest(httpRequest);
        error.response = msRest.stripResponse(response);
        let parsedErrorResponse = operationRes.bodyAsJson as { [key: string]: any };
        try {
          if (parsedErrorResponse) {
            let internalError = null;
            if (parsedErrorResponse.error) internalError = parsedErrorResponse.error;
            error.code = internalError ? internalError.code : parsedErrorResponse.code;
            error.message = internalError ? internalError.message : parsedErrorResponse.message;
          }
          if (parsedErrorResponse !== null && parsedErrorResponse !== undefined) {
            let resultMapper = Mappers.ErrorResponse;
            error.body = client.serializer.deserialize(resultMapper, parsedErrorResponse, 'error.body');
          }
        } catch (defaultError) {
          error.message = `Error "${defaultError.message}" occurred in deserializing the responseBody ` +
                           `- "${operationRes.bodyAsText}" for the default response.`;
          return Promise.reject(error);
        }
        return Promise.reject(error);
      }
      // Deserialize Response
      if (statusCode === 200) {
        let parsedResponse = operationRes.bodyAsJson as { [key: string]: any };
        try {
          if (parsedResponse !== null && parsedResponse !== undefined) {
            let resultMapper = Mappers.ResourceResponse;
            operationRes.bodyAsJson = client.serializer.deserialize(resultMapper, parsedResponse, 'operationRes.bodyAsJson');
          }
        } catch (error) {
          let deserializationError = new msRest.RestError(`Error ${error} occurred in deserializing the responseBody - ${operationRes.bodyAsText}`);
          deserializationError.request = msRest.stripRequest(httpRequest);
          deserializationError.response = msRest.stripResponse(response);
          return Promise.reject(deserializationError);
        }
      }
      // Deserialize Response
      if (statusCode === 201) {
        let parsedResponse = operationRes.bodyAsJson as { [key: string]: any };
        try {
          if (parsedResponse !== null && parsedResponse !== undefined) {
            let resultMapper = Mappers.ResourceResponse;
            operationRes.bodyAsJson = client.serializer.deserialize(resultMapper, parsedResponse, 'operationRes.bodyAsJson');
          }
        } catch (error) {
          let deserializationError1 = new msRest.RestError(`Error ${error} occurred in deserializing the responseBody - ${operationRes.bodyAsText}`);
          deserializationError1.request = msRest.stripRequest(httpRequest);
          deserializationError1.response = msRest.stripResponse(response);
          return Promise.reject(deserializationError1);
        }
      }
      // Deserialize Response
      if (statusCode === 202) {
        let parsedResponse = operationRes.bodyAsJson as { [key: string]: any };
        try {
          if (parsedResponse !== null && parsedResponse !== undefined) {
            let resultMapper = Mappers.ResourceResponse;
            operationRes.bodyAsJson = client.serializer.deserialize(resultMapper, parsedResponse, 'operationRes.bodyAsJson');
          }
        } catch (error) {
          let deserializationError2 = new msRest.RestError(`Error ${error} occurred in deserializing the responseBody - ${operationRes.bodyAsText}`);
          deserializationError2.request = msRest.stripRequest(httpRequest);
          deserializationError2.response = msRest.stripResponse(response);
          return Promise.reject(deserializationError2);
        }
      }

    } catch(err) {
      return Promise.reject(err);
    }

    return Promise.resolve(operationRes);
  }

  /**
   * @summary ReplyToActivity
   *
   * This method allows you to reply to an activity.
   *
   * This is slightly different from SendToConversation().
   * * SendToConverstion(conversationId) - will append the activity to the end of
   * the conversation according to the timestamp or semantics of the channel.
   * * ReplyToActivity(conversationId,ActivityId) - adds the activity as a reply
   * to another activity, if the channel supports it. If the channel does not
   * support nested replies, ReplyToActivity falls back to SendToConversation.
   *
   * Use ReplyToActivity when replying to a specific activity in the
   * conversation.
   *
   * Use SendToConversation in all other cases.
   *
   * @param {string} conversationId Conversation ID
   *
   * @param {string} activityId activityId the reply is to (OPTIONAL)
   *
   * @param {Activity} activity Activity to send
   *
   * @param {RequestOptionsBase} [options] Optional Parameters.
   *
   * @returns {Promise} A promise is returned
   *
   * @resolve {HttpOperationResponse} - The deserialized result object.
   *
   * @reject {Error|ServiceError} - The error object.
   */
  async replyToActivityWithHttpOperationResponse(conversationId: string, activityId: string, activity: Models.Activity, options?: msRest.RequestOptionsBase): Promise<msRest.HttpOperationResponse> {
    let client = this.client;
    // Validate
    try {
      if (conversationId === null || conversationId === undefined || typeof conversationId.valueOf() !== 'string') {
        throw new Error('conversationId cannot be null or undefined and it must be of type string.');
      }
      if (activityId === null || activityId === undefined || typeof activityId.valueOf() !== 'string') {
        throw new Error('activityId cannot be null or undefined and it must be of type string.');
      }
      if (activity === null || activity === undefined) {
        throw new Error('activity cannot be null or undefined.');
      }
    } catch (error) {
      return Promise.reject(error);
    }

    // Construct URL
    let baseUrl = this.client.baseUri;
    let requestUrl = baseUrl + (baseUrl.endsWith('/') ? '' : '/') + 'v3/conversations/{conversationId}/activities/{activityId}';
    requestUrl = requestUrl.replace('{conversationId}', encodeURIComponent(conversationId));
    requestUrl = requestUrl.replace('{activityId}', encodeURIComponent(activityId));

    // Create HTTP transport objects
    let httpRequest = new WebResource();
    httpRequest.method = 'POST';
    httpRequest.url = requestUrl;
    httpRequest.headers = {};
    // Set Headers
    httpRequest.headers['Content-Type'] = 'application/json; charset=utf-8';
    if(options && options.customHeaders) {
      for(let headerName in options.customHeaders) {
        if (options.customHeaders.hasOwnProperty(headerName)) {
          httpRequest.headers[headerName] = options.customHeaders[headerName];
        }
      }
    }
    // Serialize Request
    let requestContent = null;
    let requestModel = null;
    try {
      if (activity !== null && activity !== undefined) {
        let requestModelMapper = Mappers.Activity;
        requestModel = client.serializer.serialize(requestModelMapper, activity, 'activity');
        requestContent = JSON.stringify(requestModel);
      }
    } catch (error) {
      let serializationError = new Error(`Error "${error.message}" occurred in serializing the ` +
          `payload - ${JSON.stringify(activity, null, 2)}.`);
      return Promise.reject(serializationError);
    }
    httpRequest.body = requestContent;
    // Send Request
    let operationRes: msRest.HttpOperationResponse;
    try {
      operationRes = await client.pipeline(httpRequest);
      let response = operationRes.response;
      let statusCode = response.status;
      if (statusCode !== 200 && statusCode !== 201 && statusCode !== 202) {
        let error = new msRest.RestError(operationRes.bodyAsText as string);
        error.statusCode = response.status;
        error.request = msRest.stripRequest(httpRequest);
        error.response = msRest.stripResponse(response);
        let parsedErrorResponse = operationRes.bodyAsJson as { [key: string]: any };
        try {
          if (parsedErrorResponse) {
            let internalError = null;
            if (parsedErrorResponse.error) internalError = parsedErrorResponse.error;
            error.code = internalError ? internalError.code : parsedErrorResponse.code;
            error.message = internalError ? internalError.message : parsedErrorResponse.message;
          }
          if (parsedErrorResponse !== null && parsedErrorResponse !== undefined) {
            let resultMapper = Mappers.ErrorResponse;
            error.body = client.serializer.deserialize(resultMapper, parsedErrorResponse, 'error.body');
          }
        } catch (defaultError) {
          error.message = `Error "${defaultError.message}" occurred in deserializing the responseBody ` +
                           `- "${operationRes.bodyAsText}" for the default response.`;
          return Promise.reject(error);
        }
        return Promise.reject(error);
      }
      // Deserialize Response
      if (statusCode === 200) {
        let parsedResponse = operationRes.bodyAsJson as { [key: string]: any };
        try {
          if (parsedResponse !== null && parsedResponse !== undefined) {
            let resultMapper = Mappers.ResourceResponse;
            operationRes.bodyAsJson = client.serializer.deserialize(resultMapper, parsedResponse, 'operationRes.bodyAsJson');
          }
        } catch (error) {
          let deserializationError = new msRest.RestError(`Error ${error} occurred in deserializing the responseBody - ${operationRes.bodyAsText}`);
          deserializationError.request = msRest.stripRequest(httpRequest);
          deserializationError.response = msRest.stripResponse(response);
          return Promise.reject(deserializationError);
        }
      }
      // Deserialize Response
      if (statusCode === 201) {
        let parsedResponse = operationRes.bodyAsJson as { [key: string]: any };
        try {
          if (parsedResponse !== null && parsedResponse !== undefined) {
            let resultMapper = Mappers.ResourceResponse;
            operationRes.bodyAsJson = client.serializer.deserialize(resultMapper, parsedResponse, 'operationRes.bodyAsJson');
          }
        } catch (error) {
          let deserializationError1 = new msRest.RestError(`Error ${error} occurred in deserializing the responseBody - ${operationRes.bodyAsText}`);
          deserializationError1.request = msRest.stripRequest(httpRequest);
          deserializationError1.response = msRest.stripResponse(response);
          return Promise.reject(deserializationError1);
        }
      }
      // Deserialize Response
      if (statusCode === 202) {
        let parsedResponse = operationRes.bodyAsJson as { [key: string]: any };
        try {
          if (parsedResponse !== null && parsedResponse !== undefined) {
            let resultMapper = Mappers.ResourceResponse;
            operationRes.bodyAsJson = client.serializer.deserialize(resultMapper, parsedResponse, 'operationRes.bodyAsJson');
          }
        } catch (error) {
          let deserializationError2 = new msRest.RestError(`Error ${error} occurred in deserializing the responseBody - ${operationRes.bodyAsText}`);
          deserializationError2.request = msRest.stripRequest(httpRequest);
          deserializationError2.response = msRest.stripResponse(response);
          return Promise.reject(deserializationError2);
        }
      }

    } catch(err) {
      return Promise.reject(err);
    }

    return Promise.resolve(operationRes);
  }

  /**
   * @summary DeleteActivity
   *
   * Delete an existing activity.
   *
   * Some channels allow you to delete an existing activity, and if successful
   * this method will remove the specified activity.
   *
   * @param {string} conversationId Conversation ID
   *
   * @param {string} activityId activityId to delete
   *
   * @param {RequestOptionsBase} [options] Optional Parameters.
   *
   * @returns {Promise} A promise is returned
   *
   * @resolve {HttpOperationResponse} - The deserialized result object.
   *
   * @reject {Error|ServiceError} - The error object.
   */
  async deleteActivityWithHttpOperationResponse(conversationId: string, activityId: string, options?: msRest.RequestOptionsBase): Promise<msRest.HttpOperationResponse> {
    let client = this.client;
    // Validate
    try {
      if (conversationId === null || conversationId === undefined || typeof conversationId.valueOf() !== 'string') {
        throw new Error('conversationId cannot be null or undefined and it must be of type string.');
      }
      if (activityId === null || activityId === undefined || typeof activityId.valueOf() !== 'string') {
        throw new Error('activityId cannot be null or undefined and it must be of type string.');
      }
    } catch (error) {
      return Promise.reject(error);
    }

    // Construct URL
    let baseUrl = this.client.baseUri;
    let requestUrl = baseUrl + (baseUrl.endsWith('/') ? '' : '/') + 'v3/conversations/{conversationId}/activities/{activityId}';
    requestUrl = requestUrl.replace('{conversationId}', encodeURIComponent(conversationId));
    requestUrl = requestUrl.replace('{activityId}', encodeURIComponent(activityId));

    // Create HTTP transport objects
    let httpRequest = new WebResource();
    httpRequest.method = 'DELETE';
    httpRequest.url = requestUrl;
    httpRequest.headers = {};
    // Set Headers
    httpRequest.headers['Content-Type'] = 'application/json; charset=utf-8';
    if(options && options.customHeaders) {
      for(let headerName in options.customHeaders) {
        if (options.customHeaders.hasOwnProperty(headerName)) {
          httpRequest.headers[headerName] = options.customHeaders[headerName];
        }
      }
    }
    // Send Request
    let operationRes: msRest.HttpOperationResponse;
    try {
      operationRes = await client.pipeline(httpRequest);
      let response = operationRes.response;
      let statusCode = response.status;
      if (statusCode !== 200 && statusCode !== 202) {
        let error = new msRest.RestError(operationRes.bodyAsText as string);
        error.statusCode = response.status;
        error.request = msRest.stripRequest(httpRequest);
        error.response = msRest.stripResponse(response);
        let parsedErrorResponse = operationRes.bodyAsJson as { [key: string]: any };
        try {
          if (parsedErrorResponse) {
            let internalError = null;
            if (parsedErrorResponse.error) internalError = parsedErrorResponse.error;
            error.code = internalError ? internalError.code : parsedErrorResponse.code;
            error.message = internalError ? internalError.message : parsedErrorResponse.message;
          }
          if (parsedErrorResponse !== null && parsedErrorResponse !== undefined) {
            let resultMapper = Mappers.ErrorResponse;
            error.body = client.serializer.deserialize(resultMapper, parsedErrorResponse, 'error.body');
          }
        } catch (defaultError) {
          error.message = `Error "${defaultError.message}" occurred in deserializing the responseBody ` +
                           `- "${operationRes.bodyAsText}" for the default response.`;
          return Promise.reject(error);
        }
        return Promise.reject(error);
      }

    } catch(err) {
      return Promise.reject(err);
    }

    return Promise.resolve(operationRes);
  }

  /**
   * @summary GetConversationMembers
   *
   * Enumerate the members of a converstion.
   *
   * This REST API takes a ConversationId and returns an array of ChannelAccount
   * objects representing the members of the conversation.
   *
   * @param {string} conversationId Conversation ID
   *
   * @param {RequestOptionsBase} [options] Optional Parameters.
   *
   * @returns {Promise} A promise is returned
   *
   * @resolve {HttpOperationResponse} - The deserialized result object.
   *
   * @reject {Error|ServiceError} - The error object.
   */
  async getConversationMembersWithHttpOperationResponse(conversationId: string, options?: msRest.RequestOptionsBase): Promise<msRest.HttpOperationResponse> {
    let client = this.client;
    // Validate
    try {
      if (conversationId === null || conversationId === undefined || typeof conversationId.valueOf() !== 'string') {
        throw new Error('conversationId cannot be null or undefined and it must be of type string.');
      }
    } catch (error) {
      return Promise.reject(error);
    }

    // Construct URL
    let baseUrl = this.client.baseUri;
    let requestUrl = baseUrl + (baseUrl.endsWith('/') ? '' : '/') + 'v3/conversations/{conversationId}/members';
    requestUrl = requestUrl.replace('{conversationId}', encodeURIComponent(conversationId));

    // Create HTTP transport objects
    let httpRequest = new WebResource();
    httpRequest.method = 'GET';
    httpRequest.url = requestUrl;
    httpRequest.headers = {};
    // Set Headers
    httpRequest.headers['Content-Type'] = 'application/json; charset=utf-8';
    if(options && options.customHeaders) {
      for(let headerName in options.customHeaders) {
        if (options.customHeaders.hasOwnProperty(headerName)) {
          httpRequest.headers[headerName] = options.customHeaders[headerName];
        }
      }
    }
    // Send Request
    let operationRes: msRest.HttpOperationResponse;
    try {
      operationRes = await client.pipeline(httpRequest);
      let response = operationRes.response;
      let statusCode = response.status;
      if (statusCode !== 200) {
        let error = new msRest.RestError(operationRes.bodyAsText as string);
        error.statusCode = response.status;
        error.request = msRest.stripRequest(httpRequest);
        error.response = msRest.stripResponse(response);
        let parsedErrorResponse = operationRes.bodyAsJson as { [key: string]: any };
        try {
          if (parsedErrorResponse) {
            let internalError = null;
            if (parsedErrorResponse.error) internalError = parsedErrorResponse.error;
            error.code = internalError ? internalError.code : parsedErrorResponse.code;
            error.message = internalError ? internalError.message : parsedErrorResponse.message;
          }
          if (parsedErrorResponse !== null && parsedErrorResponse !== undefined) {
            let resultMapper = Mappers.ErrorResponse;
            error.body = client.serializer.deserialize(resultMapper, parsedErrorResponse, 'error.body');
          }
        } catch (defaultError) {
          error.message = `Error "${defaultError.message}" occurred in deserializing the responseBody ` +
                           `- "${operationRes.bodyAsText}" for the default response.`;
          return Promise.reject(error);
        }
        return Promise.reject(error);
      }
      // Deserialize Response
      if (statusCode === 200) {
        let parsedResponse = operationRes.bodyAsJson as { [key: string]: any };
        try {
          if (parsedResponse !== null && parsedResponse !== undefined) {
            let resultMapper = {
              required: false,
              serializedName: 'parsedResponse',
              type: {
                name: 'Sequence',
                element: {
                    required: false,
                    serializedName: 'ChannelAccountElementType',
                    type: {
                      name: 'Composite',
                      className: 'ChannelAccount'
                    }
                }
              }
            };
            operationRes.bodyAsJson = client.serializer.deserialize(resultMapper, parsedResponse, 'operationRes.bodyAsJson');
          }
        } catch (error) {
          let deserializationError = new msRest.RestError(`Error ${error} occurred in deserializing the responseBody - ${operationRes.bodyAsText}`);
          deserializationError.request = msRest.stripRequest(httpRequest);
          deserializationError.response = msRest.stripResponse(response);
          return Promise.reject(deserializationError);
        }
      }

    } catch(err) {
      return Promise.reject(err);
    }

    return Promise.resolve(operationRes);
  }

  /**
   * @summary DeleteConversationMember
   *
   * Deletes a member from a converstion.
   *
   * This REST API takes a ConversationId and a memberId (of type string) and
   * removes that member from the conversation. If that member was the last
   * member
   * of the conversation, the conversation will also be deleted.
   *
   * @param {string} conversationId Conversation ID
   *
   * @param {string} memberId ID of the member to delete from this conversation
   *
   * @param {RequestOptionsBase} [options] Optional Parameters.
   *
   * @returns {Promise} A promise is returned
   *
   * @resolve {HttpOperationResponse} - The deserialized result object.
   *
   * @reject {Error|ServiceError} - The error object.
   */
  async deleteConversationMemberWithHttpOperationResponse(conversationId: string, memberId: string, options?: msRest.RequestOptionsBase): Promise<msRest.HttpOperationResponse> {
    let client = this.client;
    // Validate
    try {
      if (conversationId === null || conversationId === undefined || typeof conversationId.valueOf() !== 'string') {
        throw new Error('conversationId cannot be null or undefined and it must be of type string.');
      }
      if (memberId === null || memberId === undefined || typeof memberId.valueOf() !== 'string') {
        throw new Error('memberId cannot be null or undefined and it must be of type string.');
      }
    } catch (error) {
      return Promise.reject(error);
    }

    // Construct URL
    let baseUrl = this.client.baseUri;
    let requestUrl = baseUrl + (baseUrl.endsWith('/') ? '' : '/') + 'v3/conversations/{conversationId}/members/{memberId}';
    requestUrl = requestUrl.replace('{conversationId}', encodeURIComponent(conversationId));
    requestUrl = requestUrl.replace('{memberId}', encodeURIComponent(memberId));

    // Create HTTP transport objects
    let httpRequest = new WebResource();
    httpRequest.method = 'DELETE';
    httpRequest.url = requestUrl;
    httpRequest.headers = {};
    // Set Headers
    httpRequest.headers['Content-Type'] = 'application/json; charset=utf-8';
    if(options && options.customHeaders) {
      for(let headerName in options.customHeaders) {
        if (options.customHeaders.hasOwnProperty(headerName)) {
          httpRequest.headers[headerName] = options.customHeaders[headerName];
        }
      }
    }
    // Send Request
    let operationRes: msRest.HttpOperationResponse;
    try {
      operationRes = await client.pipeline(httpRequest);
      let response = operationRes.response;
      let statusCode = response.status;
      if (statusCode !== 200 && statusCode !== 204) {
        let error = new msRest.RestError(operationRes.bodyAsText as string);
        error.statusCode = response.status;
        error.request = msRest.stripRequest(httpRequest);
        error.response = msRest.stripResponse(response);
        let parsedErrorResponse = operationRes.bodyAsJson as { [key: string]: any };
        try {
          if (parsedErrorResponse) {
            let internalError = null;
            if (parsedErrorResponse.error) internalError = parsedErrorResponse.error;
            error.code = internalError ? internalError.code : parsedErrorResponse.code;
            error.message = internalError ? internalError.message : parsedErrorResponse.message;
          }
          if (parsedErrorResponse !== null && parsedErrorResponse !== undefined) {
            let resultMapper = Mappers.ErrorResponse;
            error.body = client.serializer.deserialize(resultMapper, parsedErrorResponse, 'error.body');
          }
        } catch (defaultError) {
          error.message = `Error "${defaultError.message}" occurred in deserializing the responseBody ` +
                           `- "${operationRes.bodyAsText}" for the default response.`;
          return Promise.reject(error);
        }
        return Promise.reject(error);
      }

    } catch(err) {
      return Promise.reject(err);
    }

    return Promise.resolve(operationRes);
  }

  /**
   * @summary GetActivityMembers
   *
   * Enumerate the members of an activity.
   *
   * This REST API takes a ConversationId and a ActivityId, returning an array of
   * ChannelAccount objects representing the members of the particular activity
   * in the conversation.
   *
   * @param {string} conversationId Conversation ID
   *
   * @param {string} activityId Activity ID
   *
   * @param {RequestOptionsBase} [options] Optional Parameters.
   *
   * @returns {Promise} A promise is returned
   *
   * @resolve {HttpOperationResponse} - The deserialized result object.
   *
   * @reject {Error|ServiceError} - The error object.
   */
  async getActivityMembersWithHttpOperationResponse(conversationId: string, activityId: string, options?: msRest.RequestOptionsBase): Promise<msRest.HttpOperationResponse> {
    let client = this.client;
    // Validate
    try {
      if (conversationId === null || conversationId === undefined || typeof conversationId.valueOf() !== 'string') {
        throw new Error('conversationId cannot be null or undefined and it must be of type string.');
      }
      if (activityId === null || activityId === undefined || typeof activityId.valueOf() !== 'string') {
        throw new Error('activityId cannot be null or undefined and it must be of type string.');
      }
    } catch (error) {
      return Promise.reject(error);
    }

    // Construct URL
    let baseUrl = this.client.baseUri;
    let requestUrl = baseUrl + (baseUrl.endsWith('/') ? '' : '/') + 'v3/conversations/{conversationId}/activities/{activityId}/members';
    requestUrl = requestUrl.replace('{conversationId}', encodeURIComponent(conversationId));
    requestUrl = requestUrl.replace('{activityId}', encodeURIComponent(activityId));

    // Create HTTP transport objects
    let httpRequest = new WebResource();
    httpRequest.method = 'GET';
    httpRequest.url = requestUrl;
    httpRequest.headers = {};
    // Set Headers
    httpRequest.headers['Content-Type'] = 'application/json; charset=utf-8';
    if(options && options.customHeaders) {
      for(let headerName in options.customHeaders) {
        if (options.customHeaders.hasOwnProperty(headerName)) {
          httpRequest.headers[headerName] = options.customHeaders[headerName];
        }
      }
    }
    // Send Request
    let operationRes: msRest.HttpOperationResponse;
    try {
      operationRes = await client.pipeline(httpRequest);
      let response = operationRes.response;
      let statusCode = response.status;
      if (statusCode !== 200) {
        let error = new msRest.RestError(operationRes.bodyAsText as string);
        error.statusCode = response.status;
        error.request = msRest.stripRequest(httpRequest);
        error.response = msRest.stripResponse(response);
        let parsedErrorResponse = operationRes.bodyAsJson as { [key: string]: any };
        try {
          if (parsedErrorResponse) {
            let internalError = null;
            if (parsedErrorResponse.error) internalError = parsedErrorResponse.error;
            error.code = internalError ? internalError.code : parsedErrorResponse.code;
            error.message = internalError ? internalError.message : parsedErrorResponse.message;
          }
          if (parsedErrorResponse !== null && parsedErrorResponse !== undefined) {
            let resultMapper = Mappers.ErrorResponse;
            error.body = client.serializer.deserialize(resultMapper, parsedErrorResponse, 'error.body');
          }
        } catch (defaultError) {
          error.message = `Error "${defaultError.message}" occurred in deserializing the responseBody ` +
                           `- "${operationRes.bodyAsText}" for the default response.`;
          return Promise.reject(error);
        }
        return Promise.reject(error);
      }
      // Deserialize Response
      if (statusCode === 200) {
        let parsedResponse = operationRes.bodyAsJson as { [key: string]: any };
        try {
          if (parsedResponse !== null && parsedResponse !== undefined) {
            let resultMapper = {
              required: false,
              serializedName: 'parsedResponse',
              type: {
                name: 'Sequence',
                element: {
                    required: false,
                    serializedName: 'ChannelAccountElementType',
                    type: {
                      name: 'Composite',
                      className: 'ChannelAccount'
                    }
                }
              }
            };
            operationRes.bodyAsJson = client.serializer.deserialize(resultMapper, parsedResponse, 'operationRes.bodyAsJson');
          }
        } catch (error) {
          let deserializationError = new msRest.RestError(`Error ${error} occurred in deserializing the responseBody - ${operationRes.bodyAsText}`);
          deserializationError.request = msRest.stripRequest(httpRequest);
          deserializationError.response = msRest.stripResponse(response);
          return Promise.reject(deserializationError);
        }
      }

    } catch(err) {
      return Promise.reject(err);
    }

    return Promise.resolve(operationRes);
  }

  /**
   * @summary UploadAttachment
   *
   * Upload an attachment directly into a channel's blob storage.
   *
   * This is useful because it allows you to store data in a compliant store when
   * dealing with enterprises.
   *
   * The response is a ResourceResponse which contains an AttachmentId which is
   * suitable for using with the attachments API.
   *
   * @param {string} conversationId Conversation ID
   *
   * @param {AttachmentData} attachmentUpload Attachment data
   *
   * @param {RequestOptionsBase} [options] Optional Parameters.
   *
   * @returns {Promise} A promise is returned
   *
   * @resolve {HttpOperationResponse} - The deserialized result object.
   *
   * @reject {Error|ServiceError} - The error object.
   */
  async uploadAttachmentWithHttpOperationResponse(conversationId: string, attachmentUpload: Models.AttachmentData, options?: msRest.RequestOptionsBase): Promise<msRest.HttpOperationResponse> {
    let client = this.client;
    // Validate
    try {
      if (conversationId === null || conversationId === undefined || typeof conversationId.valueOf() !== 'string') {
        throw new Error('conversationId cannot be null or undefined and it must be of type string.');
      }
      if (attachmentUpload === null || attachmentUpload === undefined) {
        throw new Error('attachmentUpload cannot be null or undefined.');
      }
    } catch (error) {
      return Promise.reject(error);
    }

    // Construct URL
    let baseUrl = this.client.baseUri;
    let requestUrl = baseUrl + (baseUrl.endsWith('/') ? '' : '/') + 'v3/conversations/{conversationId}/attachments';
    requestUrl = requestUrl.replace('{conversationId}', encodeURIComponent(conversationId));

    // Create HTTP transport objects
    let httpRequest = new WebResource();
    httpRequest.method = 'POST';
    httpRequest.url = requestUrl;
    httpRequest.headers = {};
    // Set Headers
    httpRequest.headers['Content-Type'] = 'application/json; charset=utf-8';
    if(options && options.customHeaders) {
      for(let headerName in options.customHeaders) {
        if (options.customHeaders.hasOwnProperty(headerName)) {
          httpRequest.headers[headerName] = options.customHeaders[headerName];
        }
      }
    }
    // Serialize Request
    let requestContent = null;
    let requestModel = null;
    try {
      if (attachmentUpload !== null && attachmentUpload !== undefined) {
        let requestModelMapper = Mappers.AttachmentData;
        requestModel = client.serializer.serialize(requestModelMapper, attachmentUpload, 'attachmentUpload');
        requestContent = JSON.stringify(requestModel);
      }
    } catch (error) {
      let serializationError = new Error(`Error "${error.message}" occurred in serializing the ` +
          `payload - ${JSON.stringify(attachmentUpload, null, 2)}.`);
      return Promise.reject(serializationError);
    }
    httpRequest.body = requestContent;
    // Send Request
    let operationRes: msRest.HttpOperationResponse;
    try {
      operationRes = await client.pipeline(httpRequest);
      let response = operationRes.response;
      let statusCode = response.status;
      if (statusCode !== 200 && statusCode !== 201 && statusCode !== 202) {
        let error = new msRest.RestError(operationRes.bodyAsText as string);
        error.statusCode = response.status;
        error.request = msRest.stripRequest(httpRequest);
        error.response = msRest.stripResponse(response);
        let parsedErrorResponse = operationRes.bodyAsJson as { [key: string]: any };
        try {
          if (parsedErrorResponse) {
            let internalError = null;
            if (parsedErrorResponse.error) internalError = parsedErrorResponse.error;
            error.code = internalError ? internalError.code : parsedErrorResponse.code;
            error.message = internalError ? internalError.message : parsedErrorResponse.message;
          }
          if (parsedErrorResponse !== null && parsedErrorResponse !== undefined) {
            let resultMapper = Mappers.ErrorResponse;
            error.body = client.serializer.deserialize(resultMapper, parsedErrorResponse, 'error.body');
          }
        } catch (defaultError) {
          error.message = `Error "${defaultError.message}" occurred in deserializing the responseBody ` +
                           `- "${operationRes.bodyAsText}" for the default response.`;
          return Promise.reject(error);
        }
        return Promise.reject(error);
      }
      // Deserialize Response
      if (statusCode === 200) {
        let parsedResponse = operationRes.bodyAsJson as { [key: string]: any };
        try {
          if (parsedResponse !== null && parsedResponse !== undefined) {
            let resultMapper = Mappers.ResourceResponse;
            operationRes.bodyAsJson = client.serializer.deserialize(resultMapper, parsedResponse, 'operationRes.bodyAsJson');
          }
        } catch (error) {
          let deserializationError = new msRest.RestError(`Error ${error} occurred in deserializing the responseBody - ${operationRes.bodyAsText}`);
          deserializationError.request = msRest.stripRequest(httpRequest);
          deserializationError.response = msRest.stripResponse(response);
          return Promise.reject(deserializationError);
        }
      }
      // Deserialize Response
      if (statusCode === 201) {
        let parsedResponse = operationRes.bodyAsJson as { [key: string]: any };
        try {
          if (parsedResponse !== null && parsedResponse !== undefined) {
            let resultMapper = Mappers.ResourceResponse;
            operationRes.bodyAsJson = client.serializer.deserialize(resultMapper, parsedResponse, 'operationRes.bodyAsJson');
          }
        } catch (error) {
          let deserializationError1 = new msRest.RestError(`Error ${error} occurred in deserializing the responseBody - ${operationRes.bodyAsText}`);
          deserializationError1.request = msRest.stripRequest(httpRequest);
          deserializationError1.response = msRest.stripResponse(response);
          return Promise.reject(deserializationError1);
        }
      }
      // Deserialize Response
      if (statusCode === 202) {
        let parsedResponse = operationRes.bodyAsJson as { [key: string]: any };
        try {
          if (parsedResponse !== null && parsedResponse !== undefined) {
            let resultMapper = Mappers.ResourceResponse;
            operationRes.bodyAsJson = client.serializer.deserialize(resultMapper, parsedResponse, 'operationRes.bodyAsJson');
          }
        } catch (error) {
          let deserializationError2 = new msRest.RestError(`Error ${error} occurred in deserializing the responseBody - ${operationRes.bodyAsText}`);
          deserializationError2.request = msRest.stripRequest(httpRequest);
          deserializationError2.response = msRest.stripResponse(response);
          return Promise.reject(deserializationError2);
        }
      }

    } catch(err) {
      return Promise.reject(err);
    }

    return Promise.resolve(operationRes);
  }

  /**
   * @summary GetConversations
   *
   * List the Conversations in which this bot has participated.
   *
   * GET from this method with a skip token
   *
   * The return value is a ConversationsResult, which contains an array of
   * ConversationMembers and a skip token.  If the skip token is not empty, then
   * there are further values to be returned. Call this method again with the
   * returned token to get more values.
   *
   * Each ConversationMembers object contains the ID of the conversation and an
   * array of ChannelAccounts that describe the members of the conversation.
   *
   * @param {ConversationsGetConversationsOptionalParams} [options] Optional
   * Parameters.
   *
   * @param {ServiceCallback} callback - The callback.
   *
   * @returns {ServiceCallback} callback(err, result, request, response)
   *
   *                      {Error|ServiceError}  err        - The Error object if an error occurred, null otherwise.
   *
   *                      {Models.ConversationsResult} [result]   - The deserialized result object if an error did not occur.
   *                      See {@link Models.ConversationsResult} for more
   *                      information.
   *
   *                      {WebResource} [request]  - The HTTP Request object if an error did not occur.
   *
   *                      {Response} [response] - The HTTP Response stream if an error did not occur.
   */
  getConversations(): Promise<Models.ConversationsResult>;
  getConversations(options: Models.ConversationsGetConversationsOptionalParams): Promise<Models.ConversationsResult>;
  //getConversations(callback: msRest.ServiceCallback<Models.ConversationsResult>): void;
  getConversations(options: Models.ConversationsGetConversationsOptionalParams, callback: msRest.ServiceCallback<Models.ConversationsResult>): void;
  getConversations(options?: Models.ConversationsGetConversationsOptionalParams, callback?: msRest.ServiceCallback<Models.ConversationsResult>): any {
    if (!callback && typeof options === 'function') {
      callback = options;
      options = undefined;
    }
    let cb = callback as msRest.ServiceCallback<Models.ConversationsResult>;
    if (!callback) {
      return this.getConversationsWithHttpOperationResponse(options).then((operationRes: msRest.HttpOperationResponse) => {
        return Promise.resolve(operationRes.bodyAsJson as Models.ConversationsResult);
      }).catch((err: Error) => {
        return Promise.reject(err);
      });
    } else {
      msRest.promiseToCallback(this.getConversationsWithHttpOperationResponse(options))((err: Error, data: msRest.HttpOperationResponse) => {
        if (err) {
          return cb(err);
        }
        let result = data.bodyAsJson as Models.ConversationsResult;
        return cb(err, result, data.request, data.response);
      });
    }
  }

  /**
   * @summary CreateConversation
   *
   * Create a new Conversation.
   *
   * POST to this method with a
   * * Bot being the bot creating the conversation
   * * IsGroup set to true if this is not a direct message (default is false)
   * * Members array contining the members you want to have be in the
   * conversation.
   *
   * The return value is a ResourceResponse which contains a conversation id
   * which is suitable for use
   * in the message payload and REST API uris.
   *
   * Most channels only support the semantics of bots initiating a direct message
   * conversation.  An example of how to do that would be:
   *
   * ```
   * var resource = await connector.conversations.CreateConversation(new
   * ConversationParameters(){ Bot = bot, members = new ChannelAccount[] { new
   * ChannelAccount("user1") } );
   * await connect.Conversations.SendToConversationAsync(resource.Id, new
   * Activity() ... ) ;
   *
   * ```
   *
   * @param {ConversationParameters} parameters Parameters to create the
   * conversation from
   *
   * @param {RequestOptionsBase} [options] Optional Parameters.
   *
   * @param {ServiceCallback} callback - The callback.
   *
   * @returns {ServiceCallback} callback(err, result, request, response)
   *
   *                      {Error|ServiceError}  err        - The Error object if an error occurred, null otherwise.
   *
   *                      {Models.ConversationResourceResponse} [result]   - The deserialized result object if an error did not occur.
   *                      See {@link Models.ConversationResourceResponse} for
   *                      more information.
   *
   *                      {WebResource} [request]  - The HTTP Request object if an error did not occur.
   *
   *                      {Response} [response] - The HTTP Response stream if an error did not occur.
   */
  createConversation(parameters: Models.ConversationParameters): Promise<Models.ConversationResourceResponse>;
  createConversation(parameters: Models.ConversationParameters, options: msRest.RequestOptionsBase): Promise<Models.ConversationResourceResponse>;
  createConversation(parameters: Models.ConversationParameters, callback: msRest.ServiceCallback<Models.ConversationResourceResponse>): void;
  createConversation(parameters: Models.ConversationParameters, options: msRest.RequestOptionsBase, callback: msRest.ServiceCallback<Models.ConversationResourceResponse>): void;
  createConversation(parameters: Models.ConversationParameters, options?: msRest.RequestOptionsBase, callback?: msRest.ServiceCallback<Models.ConversationResourceResponse>): any {
    if (!callback && typeof options === 'function') {
      callback = options;
      options = undefined;
    }
    let cb = callback as msRest.ServiceCallback<Models.ConversationResourceResponse>;
    if (!callback) {
      return this.createConversationWithHttpOperationResponse(parameters, options).then((operationRes: msRest.HttpOperationResponse) => {
        return Promise.resolve(operationRes.bodyAsJson as Models.ConversationResourceResponse);
      }).catch((err: Error) => {
        return Promise.reject(err);
      });
    } else {
      msRest.promiseToCallback(this.createConversationWithHttpOperationResponse(parameters, options))((err: Error, data: msRest.HttpOperationResponse) => {
        if (err) {
          return cb(err);
        }
        let result = data.bodyAsJson as Models.ConversationResourceResponse;
        return cb(err, result, data.request, data.response);
      });
    }
  }

  /**
   * @summary SendToConversation
   *
   * This method allows you to send an activity to the end of a conversation.
   *
   * This is slightly different from ReplyToActivity().
   * * SendToConverstion(conversationId) - will append the activity to the end of
   * the conversation according to the timestamp or semantics of the channel.
   * * ReplyToActivity(conversationId,ActivityId) - adds the activity as a reply
   * to another activity, if the channel supports it. If the channel does not
   * support nested replies, ReplyToActivity falls back to SendToConversation.
   *
   * Use ReplyToActivity when replying to a specific activity in the
   * conversation.
   *
   * Use SendToConversation in all other cases.
   *
   * @param {string} conversationId Conversation ID
   *
   * @param {Activity} activity Activity to send
   *
   * @param {RequestOptionsBase} [options] Optional Parameters.
   *
   * @param {ServiceCallback} callback - The callback.
   *
   * @returns {ServiceCallback} callback(err, result, request, response)
   *
   *                      {Error|ServiceError}  err        - The Error object if an error occurred, null otherwise.
   *
   *                      {Models.ResourceResponse} [result]   - The deserialized result object if an error did not occur.
   *                      See {@link Models.ResourceResponse} for more
   *                      information.
   *
   *                      {WebResource} [request]  - The HTTP Request object if an error did not occur.
   *
   *                      {Response} [response] - The HTTP Response stream if an error did not occur.
   */
  sendToConversation(conversationId: string, activity: Models.Activity): Promise<Models.ResourceResponse>;
  sendToConversation(conversationId: string, activity: Models.Activity, options: msRest.RequestOptionsBase): Promise<Models.ResourceResponse>;
  sendToConversation(conversationId: string, activity: Models.Activity, callback: msRest.ServiceCallback<Models.ResourceResponse>): void;
  sendToConversation(conversationId: string, activity: Models.Activity, options: msRest.RequestOptionsBase, callback: msRest.ServiceCallback<Models.ResourceResponse>): void;
  sendToConversation(conversationId: string, activity: Models.Activity, options?: msRest.RequestOptionsBase, callback?: msRest.ServiceCallback<Models.ResourceResponse>): any {
    if (!callback && typeof options === 'function') {
      callback = options;
      options = undefined;
    }
    let cb = callback as msRest.ServiceCallback<Models.ResourceResponse>;
    if (!callback) {
      return this.sendToConversationWithHttpOperationResponse(conversationId, activity, options).then((operationRes: msRest.HttpOperationResponse) => {
        return Promise.resolve(operationRes.bodyAsJson as Models.ResourceResponse);
      }).catch((err: Error) => {
        return Promise.reject(err);
      });
    } else {
      msRest.promiseToCallback(this.sendToConversationWithHttpOperationResponse(conversationId, activity, options))((err: Error, data: msRest.HttpOperationResponse) => {
        if (err) {
          return cb(err);
        }
        let result = data.bodyAsJson as Models.ResourceResponse;
        return cb(err, result, data.request, data.response);
      });
    }
  }

  /**
   * @summary UpdateActivity
   *
   * Edit an existing activity.
   *
   * Some channels allow you to edit an existing activity to reflect the new
   * state of a bot conversation.
   *
   * For example, you can remove buttons after someone has clicked "Approve"
   * button.
   *
   * @param {string} conversationId Conversation ID
   *
   * @param {string} activityId activityId to update
   *
   * @param {Activity} activity replacement Activity
   *
   * @param {RequestOptionsBase} [options] Optional Parameters.
   *
   * @param {ServiceCallback} callback - The callback.
   *
   * @returns {ServiceCallback} callback(err, result, request, response)
   *
   *                      {Error|ServiceError}  err        - The Error object if an error occurred, null otherwise.
   *
   *                      {Models.ResourceResponse} [result]   - The deserialized result object if an error did not occur.
   *                      See {@link Models.ResourceResponse} for more
   *                      information.
   *
   *                      {WebResource} [request]  - The HTTP Request object if an error did not occur.
   *
   *                      {Response} [response] - The HTTP Response stream if an error did not occur.
   */
  updateActivity(conversationId: string, activityId: string, activity: Models.Activity): Promise<Models.ResourceResponse>;
  updateActivity(conversationId: string, activityId: string, activity: Models.Activity, options: msRest.RequestOptionsBase): Promise<Models.ResourceResponse>;
  updateActivity(conversationId: string, activityId: string, activity: Models.Activity, callback: msRest.ServiceCallback<Models.ResourceResponse>): void;
  updateActivity(conversationId: string, activityId: string, activity: Models.Activity, options: msRest.RequestOptionsBase, callback: msRest.ServiceCallback<Models.ResourceResponse>): void;
  updateActivity(conversationId: string, activityId: string, activity: Models.Activity, options?: msRest.RequestOptionsBase, callback?: msRest.ServiceCallback<Models.ResourceResponse>): any {
    if (!callback && typeof options === 'function') {
      callback = options;
      options = undefined;
    }
    let cb = callback as msRest.ServiceCallback<Models.ResourceResponse>;
    if (!callback) {
      return this.updateActivityWithHttpOperationResponse(conversationId, activityId, activity, options).then((operationRes: msRest.HttpOperationResponse) => {
        return Promise.resolve(operationRes.bodyAsJson as Models.ResourceResponse);
      }).catch((err: Error) => {
        return Promise.reject(err);
      });
    } else {
      msRest.promiseToCallback(this.updateActivityWithHttpOperationResponse(conversationId, activityId, activity, options))((err: Error, data: msRest.HttpOperationResponse) => {
        if (err) {
          return cb(err);
        }
        let result = data.bodyAsJson as Models.ResourceResponse;
        return cb(err, result, data.request, data.response);
      });
    }
  }

  /**
   * @summary ReplyToActivity
   *
   * This method allows you to reply to an activity.
   *
   * This is slightly different from SendToConversation().
   * * SendToConverstion(conversationId) - will append the activity to the end of
   * the conversation according to the timestamp or semantics of the channel.
   * * ReplyToActivity(conversationId,ActivityId) - adds the activity as a reply
   * to another activity, if the channel supports it. If the channel does not
   * support nested replies, ReplyToActivity falls back to SendToConversation.
   *
   * Use ReplyToActivity when replying to a specific activity in the
   * conversation.
   *
   * Use SendToConversation in all other cases.
   *
   * @param {string} conversationId Conversation ID
   *
   * @param {string} activityId activityId the reply is to (OPTIONAL)
   *
   * @param {Activity} activity Activity to send
   *
   * @param {RequestOptionsBase} [options] Optional Parameters.
   *
   * @param {ServiceCallback} callback - The callback.
   *
   * @returns {ServiceCallback} callback(err, result, request, response)
   *
   *                      {Error|ServiceError}  err        - The Error object if an error occurred, null otherwise.
   *
   *                      {Models.ResourceResponse} [result]   - The deserialized result object if an error did not occur.
   *                      See {@link Models.ResourceResponse} for more
   *                      information.
   *
   *                      {WebResource} [request]  - The HTTP Request object if an error did not occur.
   *
   *                      {Response} [response] - The HTTP Response stream if an error did not occur.
   */
  replyToActivity(conversationId: string, activityId: string, activity: Models.Activity): Promise<Models.ResourceResponse>;
  replyToActivity(conversationId: string, activityId: string, activity: Models.Activity, options: msRest.RequestOptionsBase): Promise<Models.ResourceResponse>;
  replyToActivity(conversationId: string, activityId: string, activity: Models.Activity, callback: msRest.ServiceCallback<Models.ResourceResponse>): void;
  replyToActivity(conversationId: string, activityId: string, activity: Models.Activity, options: msRest.RequestOptionsBase, callback: msRest.ServiceCallback<Models.ResourceResponse>): void;
  replyToActivity(conversationId: string, activityId: string, activity: Models.Activity, options?: msRest.RequestOptionsBase, callback?: msRest.ServiceCallback<Models.ResourceResponse>): any {
    if (!callback && typeof options === 'function') {
      callback = options;
      options = undefined;
    }
    let cb = callback as msRest.ServiceCallback<Models.ResourceResponse>;
    if (!callback) {
      return this.replyToActivityWithHttpOperationResponse(conversationId, activityId, activity, options).then((operationRes: msRest.HttpOperationResponse) => {
        return Promise.resolve(operationRes.bodyAsJson as Models.ResourceResponse);
      }).catch((err: Error) => {
        return Promise.reject(err);
      });
    } else {
      msRest.promiseToCallback(this.replyToActivityWithHttpOperationResponse(conversationId, activityId, activity, options))((err: Error, data: msRest.HttpOperationResponse) => {
        if (err) {
          return cb(err);
        }
        let result = data.bodyAsJson as Models.ResourceResponse;
        return cb(err, result, data.request, data.response);
      });
    }
  }

  /**
   * @summary DeleteActivity
   *
   * Delete an existing activity.
   *
   * Some channels allow you to delete an existing activity, and if successful
   * this method will remove the specified activity.
   *
   * @param {string} conversationId Conversation ID
   *
   * @param {string} activityId activityId to delete
   *
   * @param {RequestOptionsBase} [options] Optional Parameters.
   *
   * @param {ServiceCallback} callback - The callback.
   *
   * @returns {ServiceCallback} callback(err, result, request, response)
   *
   *                      {Error|ServiceError}  err        - The Error object if an error occurred, null otherwise.
   *
   *                      {void} [result]   - The deserialized result object if an error did not occur.
   *
   *                      {WebResource} [request]  - The HTTP Request object if an error did not occur.
   *
   *                      {Response} [response] - The HTTP Response stream if an error did not occur.
   */
  deleteActivity(conversationId: string, activityId: string): Promise<void>;
  deleteActivity(conversationId: string, activityId: string, options: msRest.RequestOptionsBase): Promise<void>;
  deleteActivity(conversationId: string, activityId: string, callback: msRest.ServiceCallback<void>): void;
  deleteActivity(conversationId: string, activityId: string, options: msRest.RequestOptionsBase, callback: msRest.ServiceCallback<void>): void;
  deleteActivity(conversationId: string, activityId: string, options?: msRest.RequestOptionsBase, callback?: msRest.ServiceCallback<void>): any {
    if (!callback && typeof options === 'function') {
      callback = options;
      options = undefined;
    }
    let cb = callback as msRest.ServiceCallback<void>;
    if (!callback) {
      return this.deleteActivityWithHttpOperationResponse(conversationId, activityId, options).then((operationRes: msRest.HttpOperationResponse) => {
        return Promise.resolve(operationRes.bodyAsJson as void);
      }).catch((err: Error) => {
        return Promise.reject(err);
      });
    } else {
      msRest.promiseToCallback(this.deleteActivityWithHttpOperationResponse(conversationId, activityId, options))((err: Error, data: msRest.HttpOperationResponse) => {
        if (err) {
          return cb(err);
        }
        let result = data.bodyAsJson as void;
        return cb(err, result, data.request, data.response);
      });
    }
  }

  /**
   * @summary GetConversationMembers
   *
   * Enumerate the members of a converstion.
   *
   * This REST API takes a ConversationId and returns an array of ChannelAccount
   * objects representing the members of the conversation.
   *
   * @param {string} conversationId Conversation ID
   *
   * @param {RequestOptionsBase} [options] Optional Parameters.
   *
   * @param {ServiceCallback} callback - The callback.
   *
   * @returns {ServiceCallback} callback(err, result, request, response)
   *
   *                      {Error|ServiceError}  err        - The Error object if an error occurred, null otherwise.
   *
   *                      {Models.ChannelAccount[]} [result]   - The deserialized result object if an error did not occur.
   *
   *                      {WebResource} [request]  - The HTTP Request object if an error did not occur.
   *
   *                      {Response} [response] - The HTTP Response stream if an error did not occur.
   */
  getConversationMembers(conversationId: string): Promise<Models.ChannelAccount[]>;
  getConversationMembers(conversationId: string, options: msRest.RequestOptionsBase): Promise<Models.ChannelAccount[]>;
  getConversationMembers(conversationId: string, callback: msRest.ServiceCallback<Models.ChannelAccount[]>): void;
  getConversationMembers(conversationId: string, options: msRest.RequestOptionsBase, callback: msRest.ServiceCallback<Models.ChannelAccount[]>): void;
  getConversationMembers(conversationId: string, options?: msRest.RequestOptionsBase, callback?: msRest.ServiceCallback<Models.ChannelAccount[]>): any {
    if (!callback && typeof options === 'function') {
      callback = options;
      options = undefined;
    }
    let cb = callback as msRest.ServiceCallback<Models.ChannelAccount[]>;
    if (!callback) {
      return this.getConversationMembersWithHttpOperationResponse(conversationId, options).then((operationRes: msRest.HttpOperationResponse) => {
        return Promise.resolve(operationRes.bodyAsJson as Models.ChannelAccount[]);
      }).catch((err: Error) => {
        return Promise.reject(err);
      });
    } else {
      msRest.promiseToCallback(this.getConversationMembersWithHttpOperationResponse(conversationId, options))((err: Error, data: msRest.HttpOperationResponse) => {
        if (err) {
          return cb(err);
        }
        let result = data.bodyAsJson as Models.ChannelAccount[];
        return cb(err, result, data.request, data.response);
      });
    }
  }

  /**
   * @summary DeleteConversationMember
   *
   * Deletes a member from a converstion.
   *
   * This REST API takes a ConversationId and a memberId (of type string) and
   * removes that member from the conversation. If that member was the last
   * member
   * of the conversation, the conversation will also be deleted.
   *
   * @param {string} conversationId Conversation ID
   *
   * @param {string} memberId ID of the member to delete from this conversation
   *
   * @param {RequestOptionsBase} [options] Optional Parameters.
   *
   * @param {ServiceCallback} callback - The callback.
   *
   * @returns {ServiceCallback} callback(err, result, request, response)
   *
   *                      {Error|ServiceError}  err        - The Error object if an error occurred, null otherwise.
   *
   *                      {void} [result]   - The deserialized result object if an error did not occur.
   *
   *                      {WebResource} [request]  - The HTTP Request object if an error did not occur.
   *
   *                      {Response} [response] - The HTTP Response stream if an error did not occur.
   */
  deleteConversationMember(conversationId: string, memberId: string): Promise<void>;
  deleteConversationMember(conversationId: string, memberId: string, options: msRest.RequestOptionsBase): Promise<void>;
  deleteConversationMember(conversationId: string, memberId: string, callback: msRest.ServiceCallback<void>): void;
  deleteConversationMember(conversationId: string, memberId: string, options: msRest.RequestOptionsBase, callback: msRest.ServiceCallback<void>): void;
  deleteConversationMember(conversationId: string, memberId: string, options?: msRest.RequestOptionsBase, callback?: msRest.ServiceCallback<void>): any {
    if (!callback && typeof options === 'function') {
      callback = options;
      options = undefined;
    }
    let cb = callback as msRest.ServiceCallback<void>;
    if (!callback) {
      return this.deleteConversationMemberWithHttpOperationResponse(conversationId, memberId, options).then((operationRes: msRest.HttpOperationResponse) => {
        return Promise.resolve(operationRes.bodyAsJson as void);
      }).catch((err: Error) => {
        return Promise.reject(err);
      });
    } else {
      msRest.promiseToCallback(this.deleteConversationMemberWithHttpOperationResponse(conversationId, memberId, options))((err: Error, data: msRest.HttpOperationResponse) => {
        if (err) {
          return cb(err);
        }
        let result = data.bodyAsJson as void;
        return cb(err, result, data.request, data.response);
      });
    }
  }

  /**
   * @summary GetActivityMembers
   *
   * Enumerate the members of an activity.
   *
   * This REST API takes a ConversationId and a ActivityId, returning an array of
   * ChannelAccount objects representing the members of the particular activity
   * in the conversation.
   *
   * @param {string} conversationId Conversation ID
   *
   * @param {string} activityId Activity ID
   *
   * @param {RequestOptionsBase} [options] Optional Parameters.
   *
   * @param {ServiceCallback} callback - The callback.
   *
   * @returns {ServiceCallback} callback(err, result, request, response)
   *
   *                      {Error|ServiceError}  err        - The Error object if an error occurred, null otherwise.
   *
   *                      {Models.ChannelAccount[]} [result]   - The deserialized result object if an error did not occur.
   *
   *                      {WebResource} [request]  - The HTTP Request object if an error did not occur.
   *
   *                      {Response} [response] - The HTTP Response stream if an error did not occur.
   */
  getActivityMembers(conversationId: string, activityId: string): Promise<Models.ChannelAccount[]>;
  getActivityMembers(conversationId: string, activityId: string, options: msRest.RequestOptionsBase): Promise<Models.ChannelAccount[]>;
  getActivityMembers(conversationId: string, activityId: string, callback: msRest.ServiceCallback<Models.ChannelAccount[]>): void;
  getActivityMembers(conversationId: string, activityId: string, options: msRest.RequestOptionsBase, callback: msRest.ServiceCallback<Models.ChannelAccount[]>): void;
  getActivityMembers(conversationId: string, activityId: string, options?: msRest.RequestOptionsBase, callback?: msRest.ServiceCallback<Models.ChannelAccount[]>): any {
    if (!callback && typeof options === 'function') {
      callback = options;
      options = undefined;
    }
    let cb = callback as msRest.ServiceCallback<Models.ChannelAccount[]>;
    if (!callback) {
      return this.getActivityMembersWithHttpOperationResponse(conversationId, activityId, options).then((operationRes: msRest.HttpOperationResponse) => {
        return Promise.resolve(operationRes.bodyAsJson as Models.ChannelAccount[]);
      }).catch((err: Error) => {
        return Promise.reject(err);
      });
    } else {
      msRest.promiseToCallback(this.getActivityMembersWithHttpOperationResponse(conversationId, activityId, options))((err: Error, data: msRest.HttpOperationResponse) => {
        if (err) {
          return cb(err);
        }
        let result = data.bodyAsJson as Models.ChannelAccount[];
        return cb(err, result, data.request, data.response);
      });
    }
  }

  /**
   * @summary UploadAttachment
   *
   * Upload an attachment directly into a channel's blob storage.
   *
   * This is useful because it allows you to store data in a compliant store when
   * dealing with enterprises.
   *
   * The response is a ResourceResponse which contains an AttachmentId which is
   * suitable for using with the attachments API.
   *
   * @param {string} conversationId Conversation ID
   *
   * @param {AttachmentData} attachmentUpload Attachment data
   *
   * @param {RequestOptionsBase} [options] Optional Parameters.
   *
   * @param {ServiceCallback} callback - The callback.
   *
   * @returns {ServiceCallback} callback(err, result, request, response)
   *
   *                      {Error|ServiceError}  err        - The Error object if an error occurred, null otherwise.
   *
   *                      {Models.ResourceResponse} [result]   - The deserialized result object if an error did not occur.
   *                      See {@link Models.ResourceResponse} for more
   *                      information.
   *
   *                      {WebResource} [request]  - The HTTP Request object if an error did not occur.
   *
   *                      {Response} [response] - The HTTP Response stream if an error did not occur.
   */
  uploadAttachment(conversationId: string, attachmentUpload: Models.AttachmentData): Promise<Models.ResourceResponse>;
  uploadAttachment(conversationId: string, attachmentUpload: Models.AttachmentData, options: msRest.RequestOptionsBase): Promise<Models.ResourceResponse>;
  uploadAttachment(conversationId: string, attachmentUpload: Models.AttachmentData, callback: msRest.ServiceCallback<Models.ResourceResponse>): void;
  uploadAttachment(conversationId: string, attachmentUpload: Models.AttachmentData, options: msRest.RequestOptionsBase, callback: msRest.ServiceCallback<Models.ResourceResponse>): void;
  uploadAttachment(conversationId: string, attachmentUpload: Models.AttachmentData, options?: msRest.RequestOptionsBase, callback?: msRest.ServiceCallback<Models.ResourceResponse>): any {
    if (!callback && typeof options === 'function') {
      callback = options;
      options = undefined;
    }
    let cb = callback as msRest.ServiceCallback<Models.ResourceResponse>;
    if (!callback) {
      return this.uploadAttachmentWithHttpOperationResponse(conversationId, attachmentUpload, options).then((operationRes: msRest.HttpOperationResponse) => {
        return Promise.resolve(operationRes.bodyAsJson as Models.ResourceResponse);
      }).catch((err: Error) => {
        return Promise.reject(err);
      });
    } else {
      msRest.promiseToCallback(this.uploadAttachmentWithHttpOperationResponse(conversationId, attachmentUpload, options))((err: Error, data: msRest.HttpOperationResponse) => {
        if (err) {
          return cb(err);
        }
        let result = data.bodyAsJson as Models.ResourceResponse;
        return cb(err, result, data.request, data.response);
      });
    }
  }

}
