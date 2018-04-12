/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import * as msRest from "ms-rest-js";
import * as Models from "botframework-schema";
import { ConnectorClient } from "../connectorClient";
/** Class representing a Conversations. */
export declare class Conversations {
    private readonly client;
    /**
     * Create a Conversations.
     * @param {ConnectorClient} client Reference to the service client.
     */
    constructor(client: ConnectorClient);
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
    getConversationsWithHttpOperationResponse(options?: Models.ConversationsGetConversationsOptionalParams): Promise<msRest.HttpOperationResponse>;
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
    createConversationWithHttpOperationResponse(parameters: Models.ConversationParameters, options?: msRest.RequestOptionsBase): Promise<msRest.HttpOperationResponse>;
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
    sendToConversationWithHttpOperationResponse(conversationId: string, activity: Models.Activity, options?: msRest.RequestOptionsBase): Promise<msRest.HttpOperationResponse>;
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
    updateActivityWithHttpOperationResponse(conversationId: string, activityId: string, activity: Models.Activity, options?: msRest.RequestOptionsBase): Promise<msRest.HttpOperationResponse>;
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
    replyToActivityWithHttpOperationResponse(conversationId: string, activityId: string, activity: Models.Activity, options?: msRest.RequestOptionsBase): Promise<msRest.HttpOperationResponse>;
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
    deleteActivityWithHttpOperationResponse(conversationId: string, activityId: string, options?: msRest.RequestOptionsBase): Promise<msRest.HttpOperationResponse>;
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
    getConversationMembersWithHttpOperationResponse(conversationId: string, options?: msRest.RequestOptionsBase): Promise<msRest.HttpOperationResponse>;
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
    deleteConversationMemberWithHttpOperationResponse(conversationId: string, memberId: string, options?: msRest.RequestOptionsBase): Promise<msRest.HttpOperationResponse>;
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
    getActivityMembersWithHttpOperationResponse(conversationId: string, activityId: string, options?: msRest.RequestOptionsBase): Promise<msRest.HttpOperationResponse>;
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
    uploadAttachmentWithHttpOperationResponse(conversationId: string, attachmentUpload: Models.AttachmentData, options?: msRest.RequestOptionsBase): Promise<msRest.HttpOperationResponse>;
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
    getConversations(options: Models.ConversationsGetConversationsOptionalParams, callback: msRest.ServiceCallback<Models.ConversationsResult>): void;
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
}
