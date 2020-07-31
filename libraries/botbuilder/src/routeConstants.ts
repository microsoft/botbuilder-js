/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
/* eslint-disable @typescript-eslint/no-namespace */

/**
 * Constants representing the API path that immediately follows the basePath.
 * 
 * @example
 * RouteConstants.Activities = '/v3/conversations/:conversationId/activities'.
 */
export namespace RouteConstants {
    /**
     * Base API path for bot conversations.
     */
    export const Conversations = '/v3/conversations';

    /**
     * API path for conversation history.
     */
    export const ConversationHistory = '/v3/conversations/:conversationId/activities/history';

    /**
     * API path for all conversation members.
     */
    export const ConversationMembers = '/v3/conversations/:conversationId/members';

    /**
     * API path for page(s) of all conversation members.
     */
    export const ConversationPagedMembers = '/v3/conversations/:conversationId/pagedmembers';

    /**
     * API path for single conversation member.
     */
    export const ConversationMember = '/v3/conversations/:conversationId/members/:memberId';

    /**
     * API path for conversation attachments.
     */
    export const Attachments = '/v3/conversations/:conversationId/attachments';

    /**
     * API path for all activities from conversation.
     */
    export const Activities = '/v3/conversations/:conversationId/activities';

    /**
     * API path for single activity from conversation.
     */
    export const Activity = '/v3/conversations/:conversationId/activities/:activityId';

    /**
     * API path for all members from activity from conversation.
     */
    export const ActivityMembers = '/v3/conversations/:conversationId/activities/:activityId/members';
}
