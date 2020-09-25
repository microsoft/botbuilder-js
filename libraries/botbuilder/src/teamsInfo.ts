/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import {
    Activity,
    ChannelAccount,
    ChannelInfo,
    ConversationList,
    TeamsChannelAccount,
    TeamsChannelData,
    TeamDetails,
    TurnContext,
    PagedMembersResult,
    TeamsPagedMembersResult,
    ConversationParameters,
    ConversationReference
} from 'botbuilder-core';
import { ConnectorClient, TeamsConnectorClient, TeamsConnectorModels} from 'botframework-connector';

import { BotFrameworkAdapter } from './botFrameworkAdapter';

/**
 * Provides utility methods for the events and interactions that occur within Microsoft Teams.
 */
export class TeamsInfo {
    /**
     * Gets the details for the given team id. This only works in teams scoped conversations.
     * @param context The context for this turn.
     * @param teamId The id of the Teams team.
     */
    public static async getTeamDetails(context: TurnContext, teamId?: string): Promise<TeamDetails> {
        const t = teamId || this.getTeamId(context);
        if (!t) {
            throw new Error('This method is only valid within the scope of a MS Teams Team.');
        }

        return await this.getTeamsConnectorClient(context).teams.fetchTeamDetails(t);
    }

    /**
     * Creates a new thread in a Teams chat and sends an activity to that new thread.
     * @param context The context for this turn.
     * @param activity The activity to send.
     * @param teamsChannelId Id of the Teams channel.
     * 
     * @returns The Conversation Reference and the id of the activity (if sent).
     */
    public static async sendMessageToTeamsChannel(context: TurnContext, activity: Activity, teamsChannelId: string): Promise<[ConversationReference, string]> {
        if (!context) {
            throw new Error("TurnContext cannot be null");
        }

        if (!activity) {
            throw new Error("Activity cannot be null");
        }

        if (!teamsChannelId || !teamsChannelId) {
            throw new Error("The teamsChannelId cannot be null or empty");
        }

        const convoParams = {
            isGroup: true,
            channelData: {
                channel: {
                    id: teamsChannelId
                }
            },
            activity: activity
        } as ConversationParameters;
        const connectorClient = (context.adapter as BotFrameworkAdapter).createConnectorClient(context.activity.serviceUrl);
        const conversationResourceResponse = await connectorClient.conversations.createConversation(convoParams);
        const conversationReference = TurnContext.getConversationReference(context.activity);
        conversationReference.conversation.id = conversationResourceResponse.id;
        return [conversationReference as ConversationReference, conversationResourceResponse.activityId];
    }

    /**
     * Returns a list of channels in a Team. This only works in teams scoped conversations.
     * @param context The context for this turn.
     * @param teamId ID of the Teams team.
     * 
     * @returns The list of ChannelInfo objects with the conversations.
     */
    public static async getTeamChannels(context: TurnContext, teamId?: string): Promise<ChannelInfo[]> {
        const t = teamId || this.getTeamId(context);
        if (!t) {
            throw new Error('This method is only valid within the scope of a MS Teams Team.');
        }

        const channelList: ConversationList = await this.getTeamsConnectorClient(context).teams.fetchChannelList(t);
        return channelList.conversations;
    }

    /**
     * Gets the conversation members of a one-on-one or group chat.
     * @param context The context for this turn.
     * 
     * @returns The list of TeamsChannelAccounts.
     */
    public static async getMembers(context: TurnContext): Promise<TeamsChannelAccount[]> {
        const teamId = this.getTeamId(context);
        if (teamId) {
            return await this.getTeamMembers(context, teamId);
        } else {
            const conversation = context.activity.conversation;
            const conversationId = conversation && conversation.id ? conversation.id : undefined;
            return await this.getMembersInternal(this.getConnectorClient(context), conversationId);
        }
    }

    /**
     * Gets a pagined list of members of one-on-one, group, or team conversation.
     * @param context The context for this turn.
     * @param pageSize Suggested number of entries on a page.
     * @param continuationToken A continuation token.
     * 
     * @returns The TeamsPagedMembersResult with the list of members.
     */
    public static async getPagedMembers(context: TurnContext, pageSize?: number, continuationToken?: string): Promise<TeamsPagedMembersResult> {
        const teamId = this.getTeamId(context);
        const options: TeamsConnectorModels.ConversationsGetConversationPagedMembersOptionalParams = {
            "continuationToken" : continuationToken,
            "pageSize": pageSize
        }
        if (teamId) {
            return await this.getPagedTeamMembers(context, teamId, pageSize, continuationToken);
        } else {
            const conversation = context.activity.conversation;
            const conversationId = conversation && conversation.id ? conversation.id : undefined;
            return await this.getPagedMembersInternal(this.getConnectorClient(context), conversationId, options);
        }
    }

    /**
     * Gets the account of a single conversation member.
     * @param context The context for this turn.
     * @param userId ID of the user in question.
     * 
     * @returns The TeamsChannelAccount of the member.
     */
    public static async getMember(context: TurnContext, userId: string): Promise<TeamsChannelAccount> {
        const teamId = this.getTeamId(context);
        if (teamId) {
            return await this.getTeamMember(context, teamId, userId);
        } else {
            const conversation = context.activity.conversation;
            const conversationId = conversation && conversation.id ? conversation.id : undefined;
            return await this.getMemberInternal(this.getConnectorClient(context), conversationId, userId);
        }
    }

    /**
     * Gets the list of TeamsChannelAccounts within a team.
     * @param context The context for this turn.
     * @param teamId ID of the Teams team.
     * 
     * @returns The list of TeamsChannelAccount of the members.
     */
    public static async getTeamMembers(context: TurnContext, teamId?: string): Promise<TeamsChannelAccount[]> {
        const t = teamId || this.getTeamId(context);
        if (!t) {
            throw new Error('This method is only valid within the scope of a MS Teams Team.');
        }
        return await this.getMembersInternal(this.getConnectorClient(context), t);
    }

    /**
     * Gets a paginated list of members of a team.
     * @param context The context for this turn.
     * @param teamId ID of the Teams team.
     * @param pageSize The number of entries on the page.
     * @param continuationToken The continuationToken token.
     * 
     * @returns A TeamsPagedMembersResult with the list of members.
     */
    public static async getPagedTeamMembers(context: TurnContext, teamId?: string, pageSize?: number, continuationToken?: string): Promise<TeamsPagedMembersResult> {
        const t = teamId || this.getTeamId(context);
        if (!t) {
            throw new Error('This method is only valid within the scope of a MS Teams Team.');
        }

        const options: TeamsConnectorModels.ConversationsGetConversationPagedMembersOptionalParams = {
            "continuationToken" : continuationToken,
            "pageSize": pageSize
        }
        return await this.getPagedMembersInternal(this.getConnectorClient(context), t, options);
    }

    /**
     * Gets the account of a member in a teams scoped conversation.
     * @param context The context for this turn.
     * @param teamId ID of the Teams team.
     * @param userId ID of the Teams user.
     * 
     * @returns The TeamsChannelAccount of the member.
     */
    public static async getTeamMember(context: TurnContext, teamId?: string, userId?: string): Promise<TeamsChannelAccount> {
        const t = teamId || this.getTeamId(context);
        if (!t) {
            throw new Error('This method is only valid within the scope of a MS Teams Team.');
        }
        return await this.getMemberInternal(this.getConnectorClient(context), t, userId);
    }

    /**
     * @private
     */
    private static async getMembersInternal(connectorClient: ConnectorClient, conversationId: string): Promise<TeamsChannelAccount[]> {
        if (!conversationId) {
            throw new Error('The getMembers operation needs a valid conversationId.');
        }

        const teamMembers: ChannelAccount[] = await connectorClient.conversations.getConversationMembers(conversationId);
        teamMembers.forEach((member): void => {
            member.aadObjectId = (member as any).objectId;
        });

        return teamMembers as TeamsChannelAccount[];
    }

    /**
     * @private
     */
    private static async getPagedMembersInternal(connectorClient: ConnectorClient, conversationId: string, options: TeamsConnectorModels.ConversationsGetConversationPagedMembersOptionalParams): Promise<TeamsPagedMembersResult> {
        if (!conversationId) {
            throw new Error('The getPagedMembers operation needs a valid conversationId.');
        }

        const pagedMembersResult: PagedMembersResult = await connectorClient.conversations.getConversationPagedMembers(conversationId, options)

        const teamsPagedMembersResult: TeamsPagedMembersResult = {
            "continuationToken": pagedMembersResult.continuationToken,
            "members": pagedMembersResult.members as TeamsChannelAccount[]
        }

        return teamsPagedMembersResult;
    }

    /**
     * @private
     */
    private static async getMemberInternal(connectorClient: ConnectorClient, conversationId: string, userId: string): Promise<TeamsChannelAccount> {
        if (!conversationId) {
            throw new Error('The getMember operation needs a valid conversationId.');
        }

        if (!userId) {
            throw new Error('The getMember operation needs a valid userId.');
        }

        const teamMember: ChannelAccount = await connectorClient.conversations.getConversationMember(conversationId, userId);

        return teamMember as TeamsChannelAccount;
    }

    /**
     * @private
     */
    private static getTeamId(context: TurnContext): string {
        if (!context) {
            throw new Error('Missing context parameter');
        }

        if (!context.activity) {
            throw new Error('Missing activity on context');
        }

        const channelData = context.activity.channelData as TeamsChannelData;
        const team = channelData && channelData.team ? channelData.team : undefined;
        const teamId = team && typeof(team.id) === 'string' ? team.id : undefined;
        return teamId;
    }

    /**
     * @private
     */
    private static getConnectorClient(context: TurnContext): ConnectorClient {
        if (!context.adapter || !('createConnectorClient' in context.adapter)) {
            throw new Error('This method requires a connector client.');
        }

        return (context.adapter as BotFrameworkAdapter).createConnectorClient(context.activity.serviceUrl);
    }

    /**
     * @private
     */
    private static getTeamsConnectorClient(context: TurnContext): TeamsConnectorClient {
        const connectorClient = this.getConnectorClient(context);
        return new TeamsConnectorClient(connectorClient.credentials, { baseUri: context.activity.serviceUrl });
    }
}
