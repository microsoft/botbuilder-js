// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { ClaimsIdentity } from 'botframework-connector';
import { STATUS_CODES } from 'http';
import { StatusCodeError } from './statusCodeError';

import {
    Activity,
    AttachmentData,
    ChannelAccount,
    ConversationParameters,
    ConversationResourceResponse,
    ConversationsResult,
    PagedMembersResult,
    ResourceResponse,
    StatusCodes,
    Transcript,
} from 'botbuilder-core';

/**
 * The ChannelServiceHandlerBase implements API to forward activity to a skill and
 * implements routing ChannelAPI calls from the Skill up through the bot/adapter.
 */
export abstract class ChannelServiceHandlerBase {
    /**
     * Sends an [Activity](xref:botframework-schema.Activity) to the end of a conversation.
     *
     * @param authHeader The authentication header.
     * @param conversationId The conversation Id.
     * @param activity The [Activity](xref:botframework-schema.Activity) to send.
     * @returns A `Promise` representing the [ResourceResponse](xref:botframework-schema.ResourceResponse) for the operation.
     */
    public async handleSendToConversation(
        authHeader: string,
        conversationId: string,
        activity: Activity
    ): Promise<ResourceResponse> {
        const claimsIdentity = await this.authenticate(authHeader);
        return this.onSendToConversation(claimsIdentity, conversationId, activity);
    }

    /**
     * Sends a reply to an [Activity](xref:botframework-schema.Activity).
     *
     * @param authHeader The authentication header.
     * @param conversationId The conversation Id.
     * @param activityId The activity Id the reply is to.
     * @param activity The [Activity](xref:botframework-schema.Activity) to send.
     * @returns A `Promise` representing the [ResourceResponse](xref:botframework-schema.ResourceResponse) for the operation.
     */
    public async handleReplyToActivity(
        authHeader: string,
        conversationId: string,
        activityId: string,
        activity: Activity
    ): Promise<ResourceResponse> {
        const claimsIdentity = await this.authenticate(authHeader);
        return this.onReplyToActivity(claimsIdentity, conversationId, activityId, activity);
    }

    /**
     * Edits a previously sent existing [Activity](xref:botframework-schema.Activity).
     *
     * @param authHeader The authentication header.
     * @param conversationId The conversation Id.
     * @param activityId The activity Id to update.
     * @param activity The replacement [Activity](xref:botframework-schema.Activity).
     * @returns A `Promise` representing the [ResourceResponse](xref:botframework-schema.ResourceResponse) for the operation.
     */
    public async handleUpdateActivity(
        authHeader: string,
        conversationId: string,
        activityId: string,
        activity: Activity
    ): Promise<ResourceResponse> {
        const claimsIdentity = await this.authenticate(authHeader);
        return this.onUpdateActivity(claimsIdentity, conversationId, activityId, activity);
    }

    /**
     * Deletes an existing [Activity](xref:botframework-schema.Activity).
     *
     * @param authHeader The authentication header.
     * @param conversationId The conversation Id.
     * @param activityId The activity Id to delete.
     */
    public async handleDeleteActivity(authHeader: string, conversationId: string, activityId: string): Promise<void> {
        const claimsIdentity = await this.authenticate(authHeader);
        await this.onDeleteActivity(claimsIdentity, conversationId, activityId);
    }

    /**
     * Enumerates the members of an [Activity](xref:botframework-schema.Activity).
     *
     * @param authHeader The authentication header.
     * @param conversationId The conversation Id.
     * @param activityId The activity Id.
     * @returns The enumerated [ChannelAccount](xref:botframework-schema.ChannelAccount) list.
     */
    public async handleGetActivityMembers(
        authHeader: string,
        conversationId: string,
        activityId: string
    ): Promise<ChannelAccount[]> {
        const claimsIdentity = await this.authenticate(authHeader);
        return this.onGetActivityMembers(claimsIdentity, conversationId, activityId);
    }

    /**
     * Creates a new Conversation.
     *
     * @param authHeader The authentication header.
     * @param parameters [ConversationParameters](xref:botbuilder-core.ConversationParameters) to create the conversation from.
     * @returns A `Promise` representation for the operation.
     */
    public async handleCreateConversation(
        authHeader: string,
        parameters: ConversationParameters
    ): Promise<ConversationResourceResponse> {
        const claimsIdentity = await this.authenticate(authHeader);
        return this.onCreateConversation(claimsIdentity, parameters);
    }

    /**
     * Lists the Conversations in which the bot has participated.
     *
     * @param authHeader The authentication header.
     * @param conversationId The conversation Id.
     * @param continuationToken A skip or continuation token.
     * @returns A `Promise` representation for the operation.
     */
    public async handleGetConversations(
        authHeader: string,
        conversationId: string,
        continuationToken?: string /* some default */
    ): Promise<ConversationsResult> {
        const claimsIdentity = await this.authenticate(authHeader);
        return this.onGetConversations(claimsIdentity, conversationId, continuationToken);
    }

    /**
     * Enumerates the members of a conversation.
     *
     * @param authHeader The authentication header.
     * @param conversationId The conversation Id.
     * @returns The enumerated [ChannelAccount](xref:botframework-schema.ChannelAccount) list.
     */
    public async handleGetConversationMembers(authHeader: string, conversationId: string): Promise<ChannelAccount[]> {
        const claimsIdentity = await this.authenticate(authHeader);
        return this.onGetConversationMembers(claimsIdentity, conversationId);
    }

    /**
     * Enumerates the members of a conversation one page at a time.
     *
     * @param authHeader The authentication header.
     * @param conversationId The conversation Id.
     * @param pageSize Suggested page size.
     * @param continuationToken A continuation token.
     * @returns A `Promise` representing the [PagedMembersResult](xref:botframework-schema.PagedMembersResult) for the operation.
     */
    public async handleGetConversationPagedMembers(
        authHeader: string,
        conversationId: string,
        pageSize = -1,
        continuationToken?: string
    ): Promise<PagedMembersResult> {
        const claimsIdentity = await this.authenticate(authHeader);
        return this.onGetConversationPagedMembers(claimsIdentity, conversationId, pageSize, continuationToken);
    }

    /**
     * Deletes a member from a conversation.
     *
     * @param authHeader The authentication header.
     * @param conversationId The conversation Id.
     * @param memberId Id of the member to delete from this conversation.
     */
    public async handleDeleteConversationMember(
        authHeader: string,
        conversationId: string,
        memberId: string
    ): Promise<void> {
        const claimsIdentity = await this.authenticate(authHeader);
        await this.onDeleteConversationMember(claimsIdentity, conversationId, memberId);
    }

    /**
     * Uploads the historic activities of the conversation.
     *
     * @param authHeader The authentication header.
     * @param conversationId The conversation Id.
     * @param transcript [Transcript](xref:botframework-schema.Transcript) of activities.
     * @returns A `Promise` representing the [ResourceResponse](xref:botframework-schema.ResourceResponse) for the operation.
     */
    public async handleSendConversationHistory(
        authHeader: string,
        conversationId: string,
        transcript: Transcript
    ): Promise<ResourceResponse> {
        const claimsIdentity = await this.authenticate(authHeader);
        return this.onSendConversationHistory(claimsIdentity, conversationId, transcript);
    }

    /**
     * Stores data in a compliant store when dealing with enterprises.
     *
     * @param authHeader The authentication header.
     * @param conversationId The conversation Id.
     * @param attachmentUpload [AttachmentData](xref:botframework-schema.AttachmentData).
     * @returns A `Promise` representing the [ResourceResponse](xref:botframework-schema.ResourceResponse) for the operation.
     */
    public async handleUploadAttachment(
        authHeader: string,
        conversationId: string,
        attachmentUpload: AttachmentData
    ): Promise<ResourceResponse> {
        const claimsIdentity = await this.authenticate(authHeader);
        return this.onUploadAttachment(claimsIdentity, conversationId, attachmentUpload);
    }

    /**
     * SendToConversation() API for Skill.
     *
     * @remarks
     * This method allows you to send an activity to the end of a conversation.
     * This is slightly different from ReplyToActivity().
     * * SendToConversation(conversationId) - will append the activity to the end
     * of the conversation according to the timestamp or semantics of the channel.
     * * ReplyToActivity(conversationId,ActivityId) - adds the activity as a reply
     * to another activity, if the channel supports it. If the channel does not
     * support nested replies, ReplyToActivity falls back to SendToConversation.
     *
     * Use ReplyToActivity when replying to a specific activity in the
     * conversation.
     *
     * Use SendToConversation in all other cases.
     * @param claimsIdentity ClaimsIdentity for the bot, should have AudienceClaim, AppIdClaim and ServiceUrlClaim.
     * @param conversationId Conversation identifier
     * @param activity Activity to send
     */
    protected async onSendToConversation(
        claimsIdentity: ClaimsIdentity,
        conversationId: string,
        activity: Activity
    ): Promise<ResourceResponse> {
        throw new StatusCodeError(
            StatusCodes.NOT_IMPLEMENTED,
            `ChannelServiceHandler.onSendToConversation(): ${StatusCodes.NOT_IMPLEMENTED}: ${
                STATUS_CODES[StatusCodes.NOT_IMPLEMENTED]
            }`
        );
    }

    /**
     * ReplyToActivity() API for Skill.
     *
     * @remarks
     * This method allows you to reply to an activity.
     *
     * This is slightly different from SendToConversation().
     * * SendToConversation(conversationId) - will append the activity to the end
     * of the conversation according to the timestamp or semantics of the channel.
     * * ReplyToActivity(conversationId,ActivityId) - adds the activity as a reply
     * to another activity, if the channel supports it. If the channel does not
     * support nested replies, ReplyToActivity falls back to SendToConversation.
     *
     * Use ReplyToActivity when replying to a specific activity in the
     * conversation.
     *
     * Use SendToConversation in all other cases.
     * @param claimsIdentity ClaimsIdentity for the bot, should have AudienceClaim, AppIdClaim and ServiceUrlClaim.
     * @param conversationId Conversation ID.
     * @param activityId activityId the reply is to (OPTIONAL).
     * @param activity Activity to send.
     */
    protected async onReplyToActivity(
        claimsIdentity: ClaimsIdentity,
        conversationId: string,
        activityId: string,
        activity: Activity
    ): Promise<ResourceResponse> {
        throw new StatusCodeError(
            StatusCodes.NOT_IMPLEMENTED,
            `ChannelServiceHandler.onReplyToActivity(): ${StatusCodes.NOT_IMPLEMENTED}: ${
                STATUS_CODES[StatusCodes.NOT_IMPLEMENTED]
            }`
        );
    }

    /**
     * UpdateActivity() API for Skill.
     * @remarks
     * Edit an existing activity.
     *
     * Some channels allow you to edit an existing activity to reflect the new
     * state of a bot conversation.
     *
     * For example, you can remove buttons after someone has clicked "Approve" button.
     * @param claimsIdentity ClaimsIdentity for the bot, should have AudienceClaim, AppIdClaim and ServiceUrlClaim.
     * @param conversationId Conversation ID.
     * @param activityId activityId to update.
     * @param activity replacement Activity.
     */
    protected async onUpdateActivity(
        claimsIdentity: ClaimsIdentity,
        conversationId: string,
        activityId: string,
        activity: Activity
    ): Promise<ResourceResponse> {
        throw new StatusCodeError(
            StatusCodes.NOT_IMPLEMENTED,
            `ChannelServiceHandler.onUpdateActivity(): ${StatusCodes.NOT_IMPLEMENTED}: ${
                STATUS_CODES[StatusCodes.NOT_IMPLEMENTED]
            }`
        );
    }

    /**
     * DeleteActivity() API for Skill.
     *
     * @remarks
     * Delete an existing activity.
     *
     * Some channels allow you to delete an existing activity, and if successful
     * this method will remove the specified activity.
     *
     *
     * @param claimsIdentity ClaimsIdentity for the bot, should have AudienceClaim, AppIdClaim and ServiceUrlClaim.
     * @param conversationId Conversation ID.
     * @param activityId activityId to delete.
     */
    protected async onDeleteActivity(
        claimsIdentity: ClaimsIdentity,
        conversationId: string,
        activityId: string
    ): Promise<void> {
        throw new StatusCodeError(
            StatusCodes.NOT_IMPLEMENTED,
            `ChannelServiceHandler.onDeleteActivity(): ${StatusCodes.NOT_IMPLEMENTED}: ${
                STATUS_CODES[StatusCodes.NOT_IMPLEMENTED]
            }`
        );
    }

    /**
     * GetActivityMembers() API for Skill.
     *
     * @remarks
     * Enumerate the members of an activity.
     *
     * This REST API takes a ConversationId and a ActivityId, returning an array
     * of ChannelAccount objects representing the members of the particular
     * activity in the conversation.
     * @param claimsIdentity ClaimsIdentity for the bot, should have AudienceClaim, AppIdClaim and ServiceUrlClaim.
     * @param conversationId Conversation ID.
     * @param activityId Activity ID.
     */
    protected async onGetActivityMembers(
        claimsIdentity: ClaimsIdentity,
        conversationId: string,
        activityId: string
    ): Promise<ChannelAccount[]> {
        throw new StatusCodeError(
            StatusCodes.NOT_IMPLEMENTED,
            `ChannelServiceHandler.onGetActivityMembers(): ${StatusCodes.NOT_IMPLEMENTED}: ${
                STATUS_CODES[StatusCodes.NOT_IMPLEMENTED]
            }`
        );
    }

    /**
     * CreateConversation() API for Skill.
     *
     * @remarks
     * Create a new Conversation.
     *
     * POST to this method with a
     * * Bot being the bot creating the conversation
     * * IsGroup set to true if this is not a direct message (default is false)
     * * Array containing the members to include in the conversation
     *
     * The return value is a ResourceResponse which contains a conversation id
     * which is suitable for use in the message payload and REST API uris.
     *
     * Most channels only support the semantics of bots initiating a direct
     * message conversation.
     *
     * @param claimsIdentity ClaimsIdentity for the bot, should have AudienceClaim, AppIdClaim and ServiceUrlClaim.
     * @param parameters Parameters to create the conversation from.
     */
    protected async onCreateConversation(
        claimsIdentity: ClaimsIdentity,
        parameters: ConversationParameters
    ): Promise<ConversationResourceResponse> {
        throw new StatusCodeError(
            StatusCodes.NOT_IMPLEMENTED,
            `ChannelServiceHandler.onCreateConversation(): ${StatusCodes.NOT_IMPLEMENTED}: ${
                STATUS_CODES[StatusCodes.NOT_IMPLEMENTED]
            }`
        );
    }

    /**
     * onGetConversations() API for Skill.
     *
     * @remarks
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
     * @param claimsIdentity ClaimsIdentity for the bot, should have AudienceClaim, AppIdClaim and ServiceUrlClaim.
     * @param conversationId Conversation ID.
     * @param continuationToken Skip or continuation token.
     */
    protected async onGetConversations(
        claimsIdentity: ClaimsIdentity,
        conversationId: string,
        continuationToken?: string
    ): Promise<ConversationsResult> {
        throw new StatusCodeError(
            StatusCodes.NOT_IMPLEMENTED,
            `ChannelServiceHandler.onGetConversations(): ${StatusCodes.NOT_IMPLEMENTED}: ${
                STATUS_CODES[StatusCodes.NOT_IMPLEMENTED]
            }`
        );
    }

    /**
     * getConversationMembers() API for Skill.
     *
     * @remarks
     * Enumerate the members of a conversation.
     *
     * This REST API takes a ConversationId and returns an array of ChannelAccount
     * objects representing the members of the conversation.
     * @param claimsIdentity ClaimsIdentity for the bot, should have AudienceClaim, AppIdClaim and ServiceUrlClaim.
     * @param conversationId Conversation ID.
     */
    protected async onGetConversationMembers(
        claimsIdentity: ClaimsIdentity,
        conversationId: string
    ): Promise<ChannelAccount[]> {
        throw new StatusCodeError(
            StatusCodes.NOT_IMPLEMENTED,
            `ChannelServiceHandler.onGetConversationMembers(): ${StatusCodes.NOT_IMPLEMENTED}: ${
                STATUS_CODES[StatusCodes.NOT_IMPLEMENTED]
            }`
        );
    }

    /**
     * getConversationPagedMembers() API for Skill.
     *
     * @remarks
     * Enumerate the members of a conversation one page at a time.
     *
     * This REST API takes a ConversationId. Optionally a pageSize and/or
     * continuationToken can be provided. It returns a PagedMembersResult, which
     * contains an array
     * of ChannelAccounts representing the members of the conversation and a
     * continuation token that can be used to get more values.
     *
     * One page of ChannelAccounts records are returned with each call. The number
     * of records in a page may vary between channels and calls. The pageSize
     * parameter can be used as
     * a suggestion. If there are no additional results the response will not
     * contain a continuation token. If there are no members in the conversation
     * the Members will be empty or not present in the response.
     *
     * A response to a request that has a continuation token from a prior request
     * may rarely return members from a previous request.
     * @param claimsIdentity ClaimsIdentity for the bot, should have AudienceClaim, AppIdClaim and ServiceUrlClaim.
     * @param conversationId Conversation ID.
     * @param pageSize Suggested page size.
     * @param continuationToken Continuation Token.
     */
    protected async onGetConversationPagedMembers(
        claimsIdentity: ClaimsIdentity,
        conversationId: string,
        pageSize = -1,
        continuationToken?: string
    ): Promise<PagedMembersResult> {
        throw new StatusCodeError(
            StatusCodes.NOT_IMPLEMENTED,
            `ChannelServiceHandler.onGetConversationPagedMembers(): ${StatusCodes.NOT_IMPLEMENTED}: ${
                STATUS_CODES[StatusCodes.NOT_IMPLEMENTED]
            }`
        );
    }

    /**
     * DeleteConversationMember() API for Skill.
     * @remarks
     * Deletes a member from a conversation.
     *
     * This REST API takes a ConversationId and a memberId (of type string) and
     * removes that member from the conversation. If that member was the last member
     * of the conversation, the conversation will also be deleted.
     * @param claimsIdentity ClaimsIdentity for the bot, should have AudienceClaim, AppIdClaim and ServiceUrlClaim.
     * @param conversationId Conversation ID.
     * @param memberId ID of the member to delete from this conversation.
     */
    protected async onDeleteConversationMember(
        claimsIdentity: ClaimsIdentity,
        conversationId: string,
        memberId: string
    ): Promise<void> {
        throw new StatusCodeError(
            StatusCodes.NOT_IMPLEMENTED,
            `ChannelServiceHandler.onDeleteConversationMember(): ${StatusCodes.NOT_IMPLEMENTED}: ${
                STATUS_CODES[StatusCodes.NOT_IMPLEMENTED]
            }`
        );
    }

    /**
     * SendConversationHistory() API for Skill.
     * @remarks
     * This method allows you to upload the historic activities to the
     * conversation.
     *
     * Sender must ensure that the historic activities have unique ids and
     * appropriate timestamps. The ids are used by the client to deal with
     * duplicate activities and the timestamps are used by the client to render
     * the activities in the right order.
     * @param claimsIdentity ClaimsIdentity for the bot, should have AudienceClaim, AppIdClaim and ServiceUrlClaim.
     * @param conversationId Conversation ID.
     * @param transcript Transcript of activities.
     */
    protected async onSendConversationHistory(
        claimsIdentity: ClaimsIdentity,
        conversationId: string,
        transcript: Transcript
    ): Promise<ResourceResponse> {
        throw new StatusCodeError(
            StatusCodes.NOT_IMPLEMENTED,
            `ChannelServiceHandler.onSendConversationHistory(): ${StatusCodes.NOT_IMPLEMENTED}: ${
                STATUS_CODES[StatusCodes.NOT_IMPLEMENTED]
            }`
        );
    }

    /**
     * UploadAttachment() API for Skill.
     * @remarks
     * Upload an attachment directly into a channel's blob storage.
     *
     * This is useful because it allows you to store data in a compliant store
     * when dealing with enterprises.
     *
     * The response is a ResourceResponse which contains an AttachmentId which is
     * suitable for using with the attachments API.
     * @param claimsIdentity ClaimsIdentity for the bot, should have AudienceClaim, AppIdClaim and ServiceUrlClaim.
     * @param conversationId Conversation ID.
     * @param attachmentUpload Attachment data.
     */
    protected async onUploadAttachment(
        claimsIdentity: ClaimsIdentity,
        conversationId: string,
        attachmentUpload: AttachmentData
    ): Promise<ResourceResponse> {
        throw new StatusCodeError(
            StatusCodes.NOT_IMPLEMENTED,
            `ChannelServiceHandler.onUploadAttachment(): ${StatusCodes.NOT_IMPLEMENTED}: ${
                STATUS_CODES[StatusCodes.NOT_IMPLEMENTED]
            }`
        );
    }

    /**
     * Helper to authenticate the header token and extract the claims.
     *
     * @param authHeader HTTP authorization header
     * @returns a promise resolving to the authorization header claims
     */
    protected abstract authenticate(authHeader: string): Promise<ClaimsIdentity>;
}
