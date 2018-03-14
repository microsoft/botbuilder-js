/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
var msRest = require("ms-rest-js");
var Models = require("botframework-schema");
var Mappers = require("../models/mappers");
var WebResource = msRest.WebResource;
/** Class representing a Conversations. */
var Conversations = (function () {
    /**
     * Create a Conversations.
     * @param {ConnectorClient} client Reference to the service client.
     */
    function Conversations(client) {
        this.readonly = client;
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
        this.async = createConversationWithHttpOperationResponse(parameters, Models.ConversationParameters, options ?  : msRest.RequestOptionsBase);
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
        this.async = sendToConversationWithHttpOperationResponse(conversationId, string, activity, Models.Activity, options ?  : msRest.RequestOptionsBase);
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
        this.async = updateActivityWithHttpOperationResponse(conversationId, string, activityId, string, activity, Models.Activity, options ?  : msRest.RequestOptionsBase);
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
        this.async = replyToActivityWithHttpOperationResponse(conversationId, string, activityId, string, activity, Models.Activity, options ?  : msRest.RequestOptionsBase);
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
        this.async = deleteActivityWithHttpOperationResponse(conversationId, string, activityId, string, options ?  : msRest.RequestOptionsBase);
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
        this.async = getConversationMembersWithHttpOperationResponse(conversationId, string, options ?  : msRest.RequestOptionsBase);
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
        this.async = getActivityMembersWithHttpOperationResponse(conversationId, string, activityId, string, options ?  : msRest.RequestOptionsBase);
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
        this.async = uploadAttachmentWithHttpOperationResponse(conversationId, string, attachmentUpload, Models.AttachmentData, options ?  : msRest.RequestOptionsBase);
        this.client = client;
    }
    Conversations.prototype.Promise = function () {
        var client = this.client;
        // Validate
        try {
            if (parameters === null || parameters === undefined) {
                throw new Error('parameters cannot be null or undefined.');
            }
        }
        catch (error) {
            return Promise.reject(error);
        }
        // Construct URL
        var baseUrl = this.client.baseUri;
        var requestUrl = baseUrl + (baseUrl.endsWith('/') ? '' : '/') + 'v3/conversations';
        // Create HTTP transport objects
        var httpRequest = new WebResource();
        httpRequest.method = 'POST';
        httpRequest.url = requestUrl;
        httpRequest.headers = {};
        // Set Headers
        httpRequest.headers['Content-Type'] = 'application/json; charset=utf-8';
        if (options && options.customHeaders) {
            for (var headerName in options.customHeaders) {
                if (options.customHeaders.hasOwnProperty(headerName)) {
                    httpRequest.headers[headerName] = options.customHeaders[headerName];
                }
            }
        }
        // Serialize Request
        var requestContent = null;
        var requestModel = null;
        try {
            if (parameters !== null && parameters !== undefined) {
                var requestModelMapper = Mappers.ConversationParameters;
                requestModel = client.serializer.serialize(requestModelMapper, parameters, 'parameters');
                requestContent = JSON.stringify(requestModel);
            }
        }
        catch (error) {
            var serializationError = new Error(("Error \"" + error.message + "\" occurred in serializing the ") +
                ("payload - " + JSON.stringify(parameters, null, 2) + "."));
            return Promise.reject(serializationError);
        }
        httpRequest.body = requestContent;
        // Send Request
        var operationRes;
        try {
            operationRes = await;
            client.pipeline(httpRequest);
            var response = operationRes.response;
            var statusCode = response.status;
            if (statusCode !== 200 && statusCode !== 201 && statusCode !== 202) {
                var error = new msRest.RestError(operationRes.bodyAsText, as, string);
                error.statusCode = response.status;
                error.request = msRest.stripRequest(httpRequest);
                error.response = msRest.stripResponse(response);
                var parsedErrorResponse = operationRes.bodyAsJson, as = (_a = {}, _a[key] = string, _a.any = any, _a);
                try {
                    if (parsedErrorResponse) {
                        var internalError = null;
                        if (parsedErrorResponse.error)
                            internalError = parsedErrorResponse.error;
                        error.code = internalError ? internalError.code : parsedErrorResponse.code;
                        error.message = internalError ? internalError.message : parsedErrorResponse.message;
                    }
                    if (parsedErrorResponse !== null && parsedErrorResponse !== undefined) {
                        var resultMapper = Mappers.ErrorResponse;
                        error.body = client.serializer.deserialize(resultMapper, parsedErrorResponse, 'error.body');
                    }
                }
                catch (defaultError) {
                    error.message = ("Error \"" + defaultError.message + "\" occurred in deserializing the responseBody ") +
                        ("- \"" + operationRes.bodyAsText + "\" for the default response.");
                    return Promise.reject(error);
                }
                return Promise.reject(error);
            }
            // Deserialize Response
            if (statusCode === 200) {
                var parsedResponse = operationRes.bodyAsJson, as = (_b = {}, _b[key] = string, _b.any = any, _b);
                try {
                    if (parsedResponse !== null && parsedResponse !== undefined) {
                        var resultMapper = Mappers.ConversationResourceResponse;
                        operationRes.bodyAsJson = client.serializer.deserialize(resultMapper, parsedResponse, 'operationRes.bodyAsJson');
                    }
                }
                catch (error) {
                    var deserializationError = new msRest.RestError("Error " + error + " occurred in deserializing the responseBody - " + operationRes.bodyAsText);
                    deserializationError.request = msRest.stripRequest(httpRequest);
                    deserializationError.response = msRest.stripResponse(response);
                    return Promise.reject(deserializationError);
                }
            }
            // Deserialize Response
            if (statusCode === 201) {
                var parsedResponse = operationRes.bodyAsJson, as = (_c = {}, _c[key] = string, _c.any = any, _c);
                try {
                    if (parsedResponse !== null && parsedResponse !== undefined) {
                        var resultMapper = Mappers.ConversationResourceResponse;
                        operationRes.bodyAsJson = client.serializer.deserialize(resultMapper, parsedResponse, 'operationRes.bodyAsJson');
                    }
                }
                catch (error) {
                    var deserializationError1 = new msRest.RestError("Error " + error + " occurred in deserializing the responseBody - " + operationRes.bodyAsText);
                    deserializationError1.request = msRest.stripRequest(httpRequest);
                    deserializationError1.response = msRest.stripResponse(response);
                    return Promise.reject(deserializationError1);
                }
            }
            // Deserialize Response
            if (statusCode === 202) {
                var parsedResponse = operationRes.bodyAsJson, as = (_d = {}, _d[key] = string, _d.any = any, _d);
                try {
                    if (parsedResponse !== null && parsedResponse !== undefined) {
                        var resultMapper = Mappers.ConversationResourceResponse;
                        operationRes.bodyAsJson = client.serializer.deserialize(resultMapper, parsedResponse, 'operationRes.bodyAsJson');
                    }
                }
                catch (error) {
                    var deserializationError2 = new msRest.RestError("Error " + error + " occurred in deserializing the responseBody - " + operationRes.bodyAsText);
                    deserializationError2.request = msRest.stripRequest(httpRequest);
                    deserializationError2.response = msRest.stripResponse(response);
                    return Promise.reject(deserializationError2);
                }
            }
        }
        catch (err) {
            return Promise.reject(err);
        }
        return Promise.resolve(operationRes);
        var _a, _b, _c, _d;
    };
    Conversations.prototype.Promise = function () {
        var client = this.client;
        // Validate
        try {
            if (conversationId === null || conversationId === undefined || typeof conversationId.valueOf() !== 'string') {
                throw new Error('conversationId cannot be null or undefined and it must be of type string.');
            }
            if (activity === null || activity === undefined) {
                throw new Error('activity cannot be null or undefined.');
            }
        }
        catch (error) {
            return Promise.reject(error);
        }
        // Construct URL
        var baseUrl = this.client.baseUri;
        var requestUrl = baseUrl + (baseUrl.endsWith('/') ? '' : '/') + 'v3/conversations/{conversationId}/activities';
        requestUrl = requestUrl.replace('{conversationId}', encodeURIComponent(conversationId));
        // Create HTTP transport objects
        var httpRequest = new WebResource();
        httpRequest.method = 'POST';
        httpRequest.url = requestUrl;
        httpRequest.headers = {};
        // Set Headers
        httpRequest.headers['Content-Type'] = 'application/json; charset=utf-8';
        if (options && options.customHeaders) {
            for (var headerName in options.customHeaders) {
                if (options.customHeaders.hasOwnProperty(headerName)) {
                    httpRequest.headers[headerName] = options.customHeaders[headerName];
                }
            }
        }
        // Serialize Request
        var requestContent = null;
        var requestModel = null;
        try {
            if (activity !== null && activity !== undefined) {
                var requestModelMapper = Mappers.Activity;
                requestModel = client.serializer.serialize(requestModelMapper, activity, 'activity');
                requestContent = JSON.stringify(requestModel);
            }
        }
        catch (error) {
            var serializationError = new Error(("Error \"" + error.message + "\" occurred in serializing the ") +
                ("payload - " + JSON.stringify(activity, null, 2) + "."));
            return Promise.reject(serializationError);
        }
        httpRequest.body = requestContent;
        // Send Request
        var operationRes;
        try {
            operationRes = await;
            client.pipeline(httpRequest);
            var response = operationRes.response;
            var statusCode = response.status;
            if (statusCode !== 200 && statusCode !== 201 && statusCode !== 202) {
                var error = new msRest.RestError(operationRes.bodyAsText, as, string);
                error.statusCode = response.status;
                error.request = msRest.stripRequest(httpRequest);
                error.response = msRest.stripResponse(response);
                var parsedErrorResponse = operationRes.bodyAsJson, as = (_a = {}, _a[key] = string, _a.any = any, _a);
                try {
                    if (parsedErrorResponse) {
                        var internalError = null;
                        if (parsedErrorResponse.error)
                            internalError = parsedErrorResponse.error;
                        error.code = internalError ? internalError.code : parsedErrorResponse.code;
                        error.message = internalError ? internalError.message : parsedErrorResponse.message;
                    }
                    if (parsedErrorResponse !== null && parsedErrorResponse !== undefined) {
                        var resultMapper = Mappers.ErrorResponse;
                        error.body = client.serializer.deserialize(resultMapper, parsedErrorResponse, 'error.body');
                    }
                }
                catch (defaultError) {
                    error.message = ("Error \"" + defaultError.message + "\" occurred in deserializing the responseBody ") +
                        ("- \"" + operationRes.bodyAsText + "\" for the default response.");
                    return Promise.reject(error);
                }
                return Promise.reject(error);
            }
            // Deserialize Response
            if (statusCode === 200) {
                var parsedResponse = operationRes.bodyAsJson, as = (_b = {}, _b[key] = string, _b.any = any, _b);
                try {
                    if (parsedResponse !== null && parsedResponse !== undefined) {
                        var resultMapper = Mappers.ResourceResponse;
                        operationRes.bodyAsJson = client.serializer.deserialize(resultMapper, parsedResponse, 'operationRes.bodyAsJson');
                    }
                }
                catch (error) {
                    var deserializationError = new msRest.RestError("Error " + error + " occurred in deserializing the responseBody - " + operationRes.bodyAsText);
                    deserializationError.request = msRest.stripRequest(httpRequest);
                    deserializationError.response = msRest.stripResponse(response);
                    return Promise.reject(deserializationError);
                }
            }
            // Deserialize Response
            if (statusCode === 201) {
                var parsedResponse = operationRes.bodyAsJson, as = (_c = {}, _c[key] = string, _c.any = any, _c);
                try {
                    if (parsedResponse !== null && parsedResponse !== undefined) {
                        var resultMapper = Mappers.ResourceResponse;
                        operationRes.bodyAsJson = client.serializer.deserialize(resultMapper, parsedResponse, 'operationRes.bodyAsJson');
                    }
                }
                catch (error) {
                    var deserializationError1 = new msRest.RestError("Error " + error + " occurred in deserializing the responseBody - " + operationRes.bodyAsText);
                    deserializationError1.request = msRest.stripRequest(httpRequest);
                    deserializationError1.response = msRest.stripResponse(response);
                    return Promise.reject(deserializationError1);
                }
            }
            // Deserialize Response
            if (statusCode === 202) {
                var parsedResponse = operationRes.bodyAsJson, as = (_d = {}, _d[key] = string, _d.any = any, _d);
                try {
                    if (parsedResponse !== null && parsedResponse !== undefined) {
                        var resultMapper = Mappers.ResourceResponse;
                        operationRes.bodyAsJson = client.serializer.deserialize(resultMapper, parsedResponse, 'operationRes.bodyAsJson');
                    }
                }
                catch (error) {
                    var deserializationError2 = new msRest.RestError("Error " + error + " occurred in deserializing the responseBody - " + operationRes.bodyAsText);
                    deserializationError2.request = msRest.stripRequest(httpRequest);
                    deserializationError2.response = msRest.stripResponse(response);
                    return Promise.reject(deserializationError2);
                }
            }
        }
        catch (err) {
            return Promise.reject(err);
        }
        return Promise.resolve(operationRes);
        var _a, _b, _c, _d;
    };
    Conversations.prototype.Promise = function () {
        var client = this.client;
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
        }
        catch (error) {
            return Promise.reject(error);
        }
        // Construct URL
        var baseUrl = this.client.baseUri;
        var requestUrl = baseUrl + (baseUrl.endsWith('/') ? '' : '/') + 'v3/conversations/{conversationId}/activities/{activityId}';
        requestUrl = requestUrl.replace('{conversationId}', encodeURIComponent(conversationId));
        requestUrl = requestUrl.replace('{activityId}', encodeURIComponent(activityId));
        // Create HTTP transport objects
        var httpRequest = new WebResource();
        httpRequest.method = 'PUT';
        httpRequest.url = requestUrl;
        httpRequest.headers = {};
        // Set Headers
        httpRequest.headers['Content-Type'] = 'application/json; charset=utf-8';
        if (options && options.customHeaders) {
            for (var headerName in options.customHeaders) {
                if (options.customHeaders.hasOwnProperty(headerName)) {
                    httpRequest.headers[headerName] = options.customHeaders[headerName];
                }
            }
        }
        // Serialize Request
        var requestContent = null;
        var requestModel = null;
        try {
            if (activity !== null && activity !== undefined) {
                var requestModelMapper = Mappers.Activity;
                requestModel = client.serializer.serialize(requestModelMapper, activity, 'activity');
                requestContent = JSON.stringify(requestModel);
            }
        }
        catch (error) {
            var serializationError = new Error(("Error \"" + error.message + "\" occurred in serializing the ") +
                ("payload - " + JSON.stringify(activity, null, 2) + "."));
            return Promise.reject(serializationError);
        }
        httpRequest.body = requestContent;
        // Send Request
        var operationRes;
        try {
            operationRes = await;
            client.pipeline(httpRequest);
            var response = operationRes.response;
            var statusCode = response.status;
            if (statusCode !== 200 && statusCode !== 201 && statusCode !== 202) {
                var error = new msRest.RestError(operationRes.bodyAsText, as, string);
                error.statusCode = response.status;
                error.request = msRest.stripRequest(httpRequest);
                error.response = msRest.stripResponse(response);
                var parsedErrorResponse = operationRes.bodyAsJson, as = (_a = {}, _a[key] = string, _a.any = any, _a);
                try {
                    if (parsedErrorResponse) {
                        var internalError = null;
                        if (parsedErrorResponse.error)
                            internalError = parsedErrorResponse.error;
                        error.code = internalError ? internalError.code : parsedErrorResponse.code;
                        error.message = internalError ? internalError.message : parsedErrorResponse.message;
                    }
                    if (parsedErrorResponse !== null && parsedErrorResponse !== undefined) {
                        var resultMapper = Mappers.ErrorResponse;
                        error.body = client.serializer.deserialize(resultMapper, parsedErrorResponse, 'error.body');
                    }
                }
                catch (defaultError) {
                    error.message = ("Error \"" + defaultError.message + "\" occurred in deserializing the responseBody ") +
                        ("- \"" + operationRes.bodyAsText + "\" for the default response.");
                    return Promise.reject(error);
                }
                return Promise.reject(error);
            }
            // Deserialize Response
            if (statusCode === 200) {
                var parsedResponse = operationRes.bodyAsJson, as = (_b = {}, _b[key] = string, _b.any = any, _b);
                try {
                    if (parsedResponse !== null && parsedResponse !== undefined) {
                        var resultMapper = Mappers.ResourceResponse;
                        operationRes.bodyAsJson = client.serializer.deserialize(resultMapper, parsedResponse, 'operationRes.bodyAsJson');
                    }
                }
                catch (error) {
                    var deserializationError = new msRest.RestError("Error " + error + " occurred in deserializing the responseBody - " + operationRes.bodyAsText);
                    deserializationError.request = msRest.stripRequest(httpRequest);
                    deserializationError.response = msRest.stripResponse(response);
                    return Promise.reject(deserializationError);
                }
            }
            // Deserialize Response
            if (statusCode === 201) {
                var parsedResponse = operationRes.bodyAsJson, as = (_c = {}, _c[key] = string, _c.any = any, _c);
                try {
                    if (parsedResponse !== null && parsedResponse !== undefined) {
                        var resultMapper = Mappers.ResourceResponse;
                        operationRes.bodyAsJson = client.serializer.deserialize(resultMapper, parsedResponse, 'operationRes.bodyAsJson');
                    }
                }
                catch (error) {
                    var deserializationError1 = new msRest.RestError("Error " + error + " occurred in deserializing the responseBody - " + operationRes.bodyAsText);
                    deserializationError1.request = msRest.stripRequest(httpRequest);
                    deserializationError1.response = msRest.stripResponse(response);
                    return Promise.reject(deserializationError1);
                }
            }
            // Deserialize Response
            if (statusCode === 202) {
                var parsedResponse = operationRes.bodyAsJson, as = (_d = {}, _d[key] = string, _d.any = any, _d);
                try {
                    if (parsedResponse !== null && parsedResponse !== undefined) {
                        var resultMapper = Mappers.ResourceResponse;
                        operationRes.bodyAsJson = client.serializer.deserialize(resultMapper, parsedResponse, 'operationRes.bodyAsJson');
                    }
                }
                catch (error) {
                    var deserializationError2 = new msRest.RestError("Error " + error + " occurred in deserializing the responseBody - " + operationRes.bodyAsText);
                    deserializationError2.request = msRest.stripRequest(httpRequest);
                    deserializationError2.response = msRest.stripResponse(response);
                    return Promise.reject(deserializationError2);
                }
            }
        }
        catch (err) {
            return Promise.reject(err);
        }
        return Promise.resolve(operationRes);
        var _a, _b, _c, _d;
    };
    Conversations.prototype.Promise = function () {
        var client = this.client;
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
        }
        catch (error) {
            return Promise.reject(error);
        }
        // Construct URL
        var baseUrl = this.client.baseUri;
        var requestUrl = baseUrl + (baseUrl.endsWith('/') ? '' : '/') + 'v3/conversations/{conversationId}/activities/{activityId}';
        requestUrl = requestUrl.replace('{conversationId}', encodeURIComponent(conversationId));
        requestUrl = requestUrl.replace('{activityId}', encodeURIComponent(activityId));
        // Create HTTP transport objects
        var httpRequest = new WebResource();
        httpRequest.method = 'POST';
        httpRequest.url = requestUrl;
        httpRequest.headers = {};
        // Set Headers
        httpRequest.headers['Content-Type'] = 'application/json; charset=utf-8';
        if (options && options.customHeaders) {
            for (var headerName in options.customHeaders) {
                if (options.customHeaders.hasOwnProperty(headerName)) {
                    httpRequest.headers[headerName] = options.customHeaders[headerName];
                }
            }
        }
        // Serialize Request
        var requestContent = null;
        var requestModel = null;
        try {
            if (activity !== null && activity !== undefined) {
                var requestModelMapper = Mappers.Activity;
                requestModel = client.serializer.serialize(requestModelMapper, activity, 'activity');
                requestContent = JSON.stringify(requestModel);
            }
        }
        catch (error) {
            var serializationError = new Error(("Error \"" + error.message + "\" occurred in serializing the ") +
                ("payload - " + JSON.stringify(activity, null, 2) + "."));
            return Promise.reject(serializationError);
        }
        httpRequest.body = requestContent;
        // Send Request
        var operationRes;
        try {
            operationRes = await;
            client.pipeline(httpRequest);
            var response = operationRes.response;
            var statusCode = response.status;
            if (statusCode !== 200 && statusCode !== 201 && statusCode !== 202) {
                var error = new msRest.RestError(operationRes.bodyAsText, as, string);
                error.statusCode = response.status;
                error.request = msRest.stripRequest(httpRequest);
                error.response = msRest.stripResponse(response);
                var parsedErrorResponse = operationRes.bodyAsJson, as = (_a = {}, _a[key] = string, _a.any = any, _a);
                try {
                    if (parsedErrorResponse) {
                        var internalError = null;
                        if (parsedErrorResponse.error)
                            internalError = parsedErrorResponse.error;
                        error.code = internalError ? internalError.code : parsedErrorResponse.code;
                        error.message = internalError ? internalError.message : parsedErrorResponse.message;
                    }
                    if (parsedErrorResponse !== null && parsedErrorResponse !== undefined) {
                        var resultMapper = Mappers.ErrorResponse;
                        error.body = client.serializer.deserialize(resultMapper, parsedErrorResponse, 'error.body');
                    }
                }
                catch (defaultError) {
                    error.message = ("Error \"" + defaultError.message + "\" occurred in deserializing the responseBody ") +
                        ("- \"" + operationRes.bodyAsText + "\" for the default response.");
                    return Promise.reject(error);
                }
                return Promise.reject(error);
            }
            // Deserialize Response
            if (statusCode === 200) {
                var parsedResponse = operationRes.bodyAsJson, as = (_b = {}, _b[key] = string, _b.any = any, _b);
                try {
                    if (parsedResponse !== null && parsedResponse !== undefined) {
                        var resultMapper = Mappers.ResourceResponse;
                        operationRes.bodyAsJson = client.serializer.deserialize(resultMapper, parsedResponse, 'operationRes.bodyAsJson');
                    }
                }
                catch (error) {
                    var deserializationError = new msRest.RestError("Error " + error + " occurred in deserializing the responseBody - " + operationRes.bodyAsText);
                    deserializationError.request = msRest.stripRequest(httpRequest);
                    deserializationError.response = msRest.stripResponse(response);
                    return Promise.reject(deserializationError);
                }
            }
            // Deserialize Response
            if (statusCode === 201) {
                var parsedResponse = operationRes.bodyAsJson, as = (_c = {}, _c[key] = string, _c.any = any, _c);
                try {
                    if (parsedResponse !== null && parsedResponse !== undefined) {
                        var resultMapper = Mappers.ResourceResponse;
                        operationRes.bodyAsJson = client.serializer.deserialize(resultMapper, parsedResponse, 'operationRes.bodyAsJson');
                    }
                }
                catch (error) {
                    var deserializationError1 = new msRest.RestError("Error " + error + " occurred in deserializing the responseBody - " + operationRes.bodyAsText);
                    deserializationError1.request = msRest.stripRequest(httpRequest);
                    deserializationError1.response = msRest.stripResponse(response);
                    return Promise.reject(deserializationError1);
                }
            }
            // Deserialize Response
            if (statusCode === 202) {
                var parsedResponse = operationRes.bodyAsJson, as = (_d = {}, _d[key] = string, _d.any = any, _d);
                try {
                    if (parsedResponse !== null && parsedResponse !== undefined) {
                        var resultMapper = Mappers.ResourceResponse;
                        operationRes.bodyAsJson = client.serializer.deserialize(resultMapper, parsedResponse, 'operationRes.bodyAsJson');
                    }
                }
                catch (error) {
                    var deserializationError2 = new msRest.RestError("Error " + error + " occurred in deserializing the responseBody - " + operationRes.bodyAsText);
                    deserializationError2.request = msRest.stripRequest(httpRequest);
                    deserializationError2.response = msRest.stripResponse(response);
                    return Promise.reject(deserializationError2);
                }
            }
        }
        catch (err) {
            return Promise.reject(err);
        }
        return Promise.resolve(operationRes);
        var _a, _b, _c, _d;
    };
    Conversations.prototype.Promise = function () {
        var client = this.client;
        // Validate
        try {
            if (conversationId === null || conversationId === undefined || typeof conversationId.valueOf() !== 'string') {
                throw new Error('conversationId cannot be null or undefined and it must be of type string.');
            }
            if (activityId === null || activityId === undefined || typeof activityId.valueOf() !== 'string') {
                throw new Error('activityId cannot be null or undefined and it must be of type string.');
            }
        }
        catch (error) {
            return Promise.reject(error);
        }
        // Construct URL
        var baseUrl = this.client.baseUri;
        var requestUrl = baseUrl + (baseUrl.endsWith('/') ? '' : '/') + 'v3/conversations/{conversationId}/activities/{activityId}';
        requestUrl = requestUrl.replace('{conversationId}', encodeURIComponent(conversationId));
        requestUrl = requestUrl.replace('{activityId}', encodeURIComponent(activityId));
        // Create HTTP transport objects
        var httpRequest = new WebResource();
        httpRequest.method = 'DELETE';
        httpRequest.url = requestUrl;
        httpRequest.headers = {};
        // Set Headers
        httpRequest.headers['Content-Type'] = 'application/json; charset=utf-8';
        if (options && options.customHeaders) {
            for (var headerName in options.customHeaders) {
                if (options.customHeaders.hasOwnProperty(headerName)) {
                    httpRequest.headers[headerName] = options.customHeaders[headerName];
                }
            }
        }
        // Send Request
        var operationRes;
        try {
            operationRes = await;
            client.pipeline(httpRequest);
            var response = operationRes.response;
            var statusCode = response.status;
            if (statusCode !== 200 && statusCode !== 202) {
                var error = new msRest.RestError(operationRes.bodyAsText, as, string);
                error.statusCode = response.status;
                error.request = msRest.stripRequest(httpRequest);
                error.response = msRest.stripResponse(response);
                var parsedErrorResponse = operationRes.bodyAsJson, as = (_a = {}, _a[key] = string, _a.any = any, _a);
                try {
                    if (parsedErrorResponse) {
                        var internalError = null;
                        if (parsedErrorResponse.error)
                            internalError = parsedErrorResponse.error;
                        error.code = internalError ? internalError.code : parsedErrorResponse.code;
                        error.message = internalError ? internalError.message : parsedErrorResponse.message;
                    }
                    if (parsedErrorResponse !== null && parsedErrorResponse !== undefined) {
                        var resultMapper = Mappers.ErrorResponse;
                        error.body = client.serializer.deserialize(resultMapper, parsedErrorResponse, 'error.body');
                    }
                }
                catch (defaultError) {
                    error.message = ("Error \"" + defaultError.message + "\" occurred in deserializing the responseBody ") +
                        ("- \"" + operationRes.bodyAsText + "\" for the default response.");
                    return Promise.reject(error);
                }
                return Promise.reject(error);
            }
        }
        catch (err) {
            return Promise.reject(err);
        }
        return Promise.resolve(operationRes);
        var _a;
    };
    Conversations.prototype.Promise = function () {
        var client = this.client;
        // Validate
        try {
            if (conversationId === null || conversationId === undefined || typeof conversationId.valueOf() !== 'string') {
                throw new Error('conversationId cannot be null or undefined and it must be of type string.');
            }
        }
        catch (error) {
            return Promise.reject(error);
        }
        // Construct URL
        var baseUrl = this.client.baseUri;
        var requestUrl = baseUrl + (baseUrl.endsWith('/') ? '' : '/') + 'v3/conversations/{conversationId}/members';
        requestUrl = requestUrl.replace('{conversationId}', encodeURIComponent(conversationId));
        // Create HTTP transport objects
        var httpRequest = new WebResource();
        httpRequest.method = 'GET';
        httpRequest.url = requestUrl;
        httpRequest.headers = {};
        // Set Headers
        httpRequest.headers['Content-Type'] = 'application/json; charset=utf-8';
        if (options && options.customHeaders) {
            for (var headerName in options.customHeaders) {
                if (options.customHeaders.hasOwnProperty(headerName)) {
                    httpRequest.headers[headerName] = options.customHeaders[headerName];
                }
            }
        }
        // Send Request
        var operationRes;
        try {
            operationRes = await;
            client.pipeline(httpRequest);
            var response = operationRes.response;
            var statusCode = response.status;
            if (statusCode !== 200) {
                var error = new msRest.RestError(operationRes.bodyAsText, as, string);
                error.statusCode = response.status;
                error.request = msRest.stripRequest(httpRequest);
                error.response = msRest.stripResponse(response);
                var parsedErrorResponse = operationRes.bodyAsJson, as = (_a = {}, _a[key] = string, _a.any = any, _a);
                try {
                    if (parsedErrorResponse) {
                        var internalError = null;
                        if (parsedErrorResponse.error)
                            internalError = parsedErrorResponse.error;
                        error.code = internalError ? internalError.code : parsedErrorResponse.code;
                        error.message = internalError ? internalError.message : parsedErrorResponse.message;
                    }
                    if (parsedErrorResponse !== null && parsedErrorResponse !== undefined) {
                        var resultMapper = Mappers.ErrorResponse;
                        error.body = client.serializer.deserialize(resultMapper, parsedErrorResponse, 'error.body');
                    }
                }
                catch (defaultError) {
                    error.message = ("Error \"" + defaultError.message + "\" occurred in deserializing the responseBody ") +
                        ("- \"" + operationRes.bodyAsText + "\" for the default response.");
                    return Promise.reject(error);
                }
                return Promise.reject(error);
            }
            // Deserialize Response
            if (statusCode === 200) {
                var parsedResponse = operationRes.bodyAsJson, as = (_b = {}, _b[key] = string, _b.any = any, _b);
                try {
                    if (parsedResponse !== null && parsedResponse !== undefined) {
                        var resultMapper = {
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
                }
                catch (error) {
                    var deserializationError = new msRest.RestError("Error " + error + " occurred in deserializing the responseBody - " + operationRes.bodyAsText);
                    deserializationError.request = msRest.stripRequest(httpRequest);
                    deserializationError.response = msRest.stripResponse(response);
                    return Promise.reject(deserializationError);
                }
            }
        }
        catch (err) {
            return Promise.reject(err);
        }
        return Promise.resolve(operationRes);
        var _a, _b;
    };
    Conversations.prototype.Promise = function () {
        var client = this.client;
        // Validate
        try {
            if (conversationId === null || conversationId === undefined || typeof conversationId.valueOf() !== 'string') {
                throw new Error('conversationId cannot be null or undefined and it must be of type string.');
            }
            if (activityId === null || activityId === undefined || typeof activityId.valueOf() !== 'string') {
                throw new Error('activityId cannot be null or undefined and it must be of type string.');
            }
        }
        catch (error) {
            return Promise.reject(error);
        }
        // Construct URL
        var baseUrl = this.client.baseUri;
        var requestUrl = baseUrl + (baseUrl.endsWith('/') ? '' : '/') + 'v3/conversations/{conversationId}/activities/{activityId}/members';
        requestUrl = requestUrl.replace('{conversationId}', encodeURIComponent(conversationId));
        requestUrl = requestUrl.replace('{activityId}', encodeURIComponent(activityId));
        // Create HTTP transport objects
        var httpRequest = new WebResource();
        httpRequest.method = 'GET';
        httpRequest.url = requestUrl;
        httpRequest.headers = {};
        // Set Headers
        httpRequest.headers['Content-Type'] = 'application/json; charset=utf-8';
        if (options && options.customHeaders) {
            for (var headerName in options.customHeaders) {
                if (options.customHeaders.hasOwnProperty(headerName)) {
                    httpRequest.headers[headerName] = options.customHeaders[headerName];
                }
            }
        }
        // Send Request
        var operationRes;
        try {
            operationRes = await;
            client.pipeline(httpRequest);
            var response = operationRes.response;
            var statusCode = response.status;
            if (statusCode !== 200) {
                var error = new msRest.RestError(operationRes.bodyAsText, as, string);
                error.statusCode = response.status;
                error.request = msRest.stripRequest(httpRequest);
                error.response = msRest.stripResponse(response);
                var parsedErrorResponse = operationRes.bodyAsJson, as = (_a = {}, _a[key] = string, _a.any = any, _a);
                try {
                    if (parsedErrorResponse) {
                        var internalError = null;
                        if (parsedErrorResponse.error)
                            internalError = parsedErrorResponse.error;
                        error.code = internalError ? internalError.code : parsedErrorResponse.code;
                        error.message = internalError ? internalError.message : parsedErrorResponse.message;
                    }
                    if (parsedErrorResponse !== null && parsedErrorResponse !== undefined) {
                        var resultMapper = Mappers.ErrorResponse;
                        error.body = client.serializer.deserialize(resultMapper, parsedErrorResponse, 'error.body');
                    }
                }
                catch (defaultError) {
                    error.message = ("Error \"" + defaultError.message + "\" occurred in deserializing the responseBody ") +
                        ("- \"" + operationRes.bodyAsText + "\" for the default response.");
                    return Promise.reject(error);
                }
                return Promise.reject(error);
            }
            // Deserialize Response
            if (statusCode === 200) {
                var parsedResponse = operationRes.bodyAsJson, as = (_b = {}, _b[key] = string, _b.any = any, _b);
                try {
                    if (parsedResponse !== null && parsedResponse !== undefined) {
                        var resultMapper = {
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
                }
                catch (error) {
                    var deserializationError = new msRest.RestError("Error " + error + " occurred in deserializing the responseBody - " + operationRes.bodyAsText);
                    deserializationError.request = msRest.stripRequest(httpRequest);
                    deserializationError.response = msRest.stripResponse(response);
                    return Promise.reject(deserializationError);
                }
            }
        }
        catch (err) {
            return Promise.reject(err);
        }
        return Promise.resolve(operationRes);
        var _a, _b;
    };
    Conversations.prototype.Promise = function () {
        var client = this.client;
        // Validate
        try {
            if (conversationId === null || conversationId === undefined || typeof conversationId.valueOf() !== 'string') {
                throw new Error('conversationId cannot be null or undefined and it must be of type string.');
            }
            if (attachmentUpload === null || attachmentUpload === undefined) {
                throw new Error('attachmentUpload cannot be null or undefined.');
            }
        }
        catch (error) {
            return Promise.reject(error);
        }
        // Construct URL
        var baseUrl = this.client.baseUri;
        var requestUrl = baseUrl + (baseUrl.endsWith('/') ? '' : '/') + 'v3/conversations/{conversationId}/attachments';
        requestUrl = requestUrl.replace('{conversationId}', encodeURIComponent(conversationId));
        // Create HTTP transport objects
        var httpRequest = new WebResource();
        httpRequest.method = 'POST';
        httpRequest.url = requestUrl;
        httpRequest.headers = {};
        // Set Headers
        httpRequest.headers['Content-Type'] = 'application/json; charset=utf-8';
        if (options && options.customHeaders) {
            for (var headerName in options.customHeaders) {
                if (options.customHeaders.hasOwnProperty(headerName)) {
                    httpRequest.headers[headerName] = options.customHeaders[headerName];
                }
            }
        }
        // Serialize Request
        var requestContent = null;
        var requestModel = null;
        try {
            if (attachmentUpload !== null && attachmentUpload !== undefined) {
                var requestModelMapper = Mappers.AttachmentData;
                requestModel = client.serializer.serialize(requestModelMapper, attachmentUpload, 'attachmentUpload');
                requestContent = JSON.stringify(requestModel);
            }
        }
        catch (error) {
            var serializationError = new Error(("Error \"" + error.message + "\" occurred in serializing the ") +
                ("payload - " + JSON.stringify(attachmentUpload, null, 2) + "."));
            return Promise.reject(serializationError);
        }
        httpRequest.body = requestContent;
        // Send Request
        var operationRes;
        try {
            operationRes = await;
            client.pipeline(httpRequest);
            var response = operationRes.response;
            var statusCode = response.status;
            if (statusCode !== 200 && statusCode !== 201 && statusCode !== 202) {
                var error = new msRest.RestError(operationRes.bodyAsText, as, string);
                error.statusCode = response.status;
                error.request = msRest.stripRequest(httpRequest);
                error.response = msRest.stripResponse(response);
                var parsedErrorResponse = operationRes.bodyAsJson, as = (_a = {}, _a[key] = string, _a.any = any, _a);
                try {
                    if (parsedErrorResponse) {
                        var internalError = null;
                        if (parsedErrorResponse.error)
                            internalError = parsedErrorResponse.error;
                        error.code = internalError ? internalError.code : parsedErrorResponse.code;
                        error.message = internalError ? internalError.message : parsedErrorResponse.message;
                    }
                    if (parsedErrorResponse !== null && parsedErrorResponse !== undefined) {
                        var resultMapper = Mappers.ErrorResponse;
                        error.body = client.serializer.deserialize(resultMapper, parsedErrorResponse, 'error.body');
                    }
                }
                catch (defaultError) {
                    error.message = ("Error \"" + defaultError.message + "\" occurred in deserializing the responseBody ") +
                        ("- \"" + operationRes.bodyAsText + "\" for the default response.");
                    return Promise.reject(error);
                }
                return Promise.reject(error);
            }
            // Deserialize Response
            if (statusCode === 200) {
                var parsedResponse = operationRes.bodyAsJson, as = (_b = {}, _b[key] = string, _b.any = any, _b);
                try {
                    if (parsedResponse !== null && parsedResponse !== undefined) {
                        var resultMapper = Mappers.ResourceResponse;
                        operationRes.bodyAsJson = client.serializer.deserialize(resultMapper, parsedResponse, 'operationRes.bodyAsJson');
                    }
                }
                catch (error) {
                    var deserializationError = new msRest.RestError("Error " + error + " occurred in deserializing the responseBody - " + operationRes.bodyAsText);
                    deserializationError.request = msRest.stripRequest(httpRequest);
                    deserializationError.response = msRest.stripResponse(response);
                    return Promise.reject(deserializationError);
                }
            }
            // Deserialize Response
            if (statusCode === 201) {
                var parsedResponse = operationRes.bodyAsJson, as = (_c = {}, _c[key] = string, _c.any = any, _c);
                try {
                    if (parsedResponse !== null && parsedResponse !== undefined) {
                        var resultMapper = Mappers.ResourceResponse;
                        operationRes.bodyAsJson = client.serializer.deserialize(resultMapper, parsedResponse, 'operationRes.bodyAsJson');
                    }
                }
                catch (error) {
                    var deserializationError1 = new msRest.RestError("Error " + error + " occurred in deserializing the responseBody - " + operationRes.bodyAsText);
                    deserializationError1.request = msRest.stripRequest(httpRequest);
                    deserializationError1.response = msRest.stripResponse(response);
                    return Promise.reject(deserializationError1);
                }
            }
            // Deserialize Response
            if (statusCode === 202) {
                var parsedResponse = operationRes.bodyAsJson, as = (_d = {}, _d[key] = string, _d.any = any, _d);
                try {
                    if (parsedResponse !== null && parsedResponse !== undefined) {
                        var resultMapper = Mappers.ResourceResponse;
                        operationRes.bodyAsJson = client.serializer.deserialize(resultMapper, parsedResponse, 'operationRes.bodyAsJson');
                    }
                }
                catch (error) {
                    var deserializationError2 = new msRest.RestError("Error " + error + " occurred in deserializing the responseBody - " + operationRes.bodyAsText);
                    deserializationError2.request = msRest.stripRequest(httpRequest);
                    deserializationError2.response = msRest.stripResponse(response);
                    return Promise.reject(deserializationError2);
                }
            }
        }
        catch (err) {
            return Promise.reject(err);
        }
        return Promise.resolve(operationRes);
        var _a, _b, _c, _d;
    };
    Conversations.prototype.createConversation = function (parameters, options, callback) {
        if (!callback && typeof options === 'function') {
            callback = options;
            options = undefined;
        }
        var cb = callback, as = msRest.ServiceCallback();
        if (!callback) {
            return this.createConversationWithHttpOperationResponse(parameters, options).then(function (operationRes) {
                return Promise.resolve(operationRes.bodyAsJson, as, Models.ConversationResourceResponse);
            }).catch(function (err) {
                return Promise.reject(err);
            });
        }
        else {
            msRest.promiseToCallback(this.createConversationWithHttpOperationResponse(parameters, options))(function (err, data) {
                if (err) {
                    return cb(err);
                }
                var result = data.bodyAsJson, as = Models.ConversationResourceResponse;
                return cb(err, result, data.request, data.response);
            });
        }
    };
    Conversations.prototype.sendToConversation = function (conversationId, activity, options, callback) {
        if (!callback && typeof options === 'function') {
            callback = options;
            options = undefined;
        }
        var cb = callback, as = msRest.ServiceCallback();
        if (!callback) {
            return this.sendToConversationWithHttpOperationResponse(conversationId, activity, options).then(function (operationRes) {
                return Promise.resolve(operationRes.bodyAsJson, as, Models.ResourceResponse);
            }).catch(function (err) {
                return Promise.reject(err);
            });
        }
        else {
            msRest.promiseToCallback(this.sendToConversationWithHttpOperationResponse(conversationId, activity, options))(function (err, data) {
                if (err) {
                    return cb(err);
                }
                var result = data.bodyAsJson, as = Models.ResourceResponse;
                return cb(err, result, data.request, data.response);
            });
        }
    };
    Conversations.prototype.updateActivity = function (conversationId, activityId, activity, options, callback) {
        if (!callback && typeof options === 'function') {
            callback = options;
            options = undefined;
        }
        var cb = callback, as = msRest.ServiceCallback();
        if (!callback) {
            return this.updateActivityWithHttpOperationResponse(conversationId, activityId, activity, options).then(function (operationRes) {
                return Promise.resolve(operationRes.bodyAsJson, as, Models.ResourceResponse);
            }).catch(function (err) {
                return Promise.reject(err);
            });
        }
        else {
            msRest.promiseToCallback(this.updateActivityWithHttpOperationResponse(conversationId, activityId, activity, options))(function (err, data) {
                if (err) {
                    return cb(err);
                }
                var result = data.bodyAsJson, as = Models.ResourceResponse;
                return cb(err, result, data.request, data.response);
            });
        }
    };
    Conversations.prototype.replyToActivity = function (conversationId, activityId, activity, options, callback) {
        if (!callback && typeof options === 'function') {
            callback = options;
            options = undefined;
        }
        var cb = callback, as = msRest.ServiceCallback();
        if (!callback) {
            return this.replyToActivityWithHttpOperationResponse(conversationId, activityId, activity, options).then(function (operationRes) {
                return Promise.resolve(operationRes.bodyAsJson, as, Models.ResourceResponse);
            }).catch(function (err) {
                return Promise.reject(err);
            });
        }
        else {
            msRest.promiseToCallback(this.replyToActivityWithHttpOperationResponse(conversationId, activityId, activity, options))(function (err, data) {
                if (err) {
                    return cb(err);
                }
                var result = data.bodyAsJson, as = Models.ResourceResponse;
                return cb(err, result, data.request, data.response);
            });
        }
    };
    Conversations.prototype.deleteActivity = function (conversationId, activityId, options, callback) {
        if (!callback && typeof options === 'function') {
            callback = options;
            options = undefined;
        }
        var cb = callback, as = msRest.ServiceCallback();
        if (!callback) {
            return this.deleteActivityWithHttpOperationResponse(conversationId, activityId, options).then(function (operationRes) {
                return Promise.resolve(operationRes.bodyAsJson, as, void );
            }).catch(function (err) {
                return Promise.reject(err);
            });
        }
        else {
            msRest.promiseToCallback(this.deleteActivityWithHttpOperationResponse(conversationId, activityId, options))(function (err, data) {
                if (err) {
                    return cb(err);
                }
                var result = data.bodyAsJson, as = void ;
                return cb(err, result, data.request, data.response);
            });
        }
    };
    Conversations.prototype.getConversationMembers = function (conversationId, options, callback) {
        if (!callback && typeof options === 'function') {
            callback = options;
            options = undefined;
        }
        var cb = callback, as = msRest.ServiceCallback();
        if (!callback) {
            return this.getConversationMembersWithHttpOperationResponse(conversationId, options).then(function (operationRes) {
                return Promise.resolve(operationRes.bodyAsJson, as, Models.ChannelAccount[]);
            }).catch(function (err) {
                return Promise.reject(err);
            });
        }
        else {
            msRest.promiseToCallback(this.getConversationMembersWithHttpOperationResponse(conversationId, options))(function (err, data) {
                if (err) {
                    return cb(err);
                }
                var result = data.bodyAsJson, as = Models.ChannelAccount[];
                return cb(err, result, data.request, data.response);
            });
        }
    };
    Conversations.prototype.getActivityMembers = function (conversationId, activityId, options, callback) {
        if (!callback && typeof options === 'function') {
            callback = options;
            options = undefined;
        }
        var cb = callback, as = msRest.ServiceCallback();
        if (!callback) {
            return this.getActivityMembersWithHttpOperationResponse(conversationId, activityId, options).then(function (operationRes) {
                return Promise.resolve(operationRes.bodyAsJson, as, Models.ChannelAccount[]);
            }).catch(function (err) {
                return Promise.reject(err);
            });
        }
        else {
            msRest.promiseToCallback(this.getActivityMembersWithHttpOperationResponse(conversationId, activityId, options))(function (err, data) {
                if (err) {
                    return cb(err);
                }
                var result = data.bodyAsJson, as = Models.ChannelAccount[];
                return cb(err, result, data.request, data.response);
            });
        }
    };
    Conversations.prototype.uploadAttachment = function (conversationId, attachmentUpload, options, callback) {
        if (!callback && typeof options === 'function') {
            callback = options;
            options = undefined;
        }
        var cb = callback, as = msRest.ServiceCallback();
        if (!callback) {
            return this.uploadAttachmentWithHttpOperationResponse(conversationId, attachmentUpload, options).then(function (operationRes) {
                return Promise.resolve(operationRes.bodyAsJson, as, Models.ResourceResponse);
            }).catch(function (err) {
                return Promise.reject(err);
            });
        }
        else {
            msRest.promiseToCallback(this.uploadAttachmentWithHttpOperationResponse(conversationId, attachmentUpload, options))(function (err, data) {
                if (err) {
                    return cb(err);
                }
                var result = data.bodyAsJson, as = Models.ResourceResponse;
                return cb(err, result, data.request, data.response);
            });
        }
    };
    return Conversations;
})();
exports.Conversations = Conversations;
//# sourceMappingURL=conversations.js.map