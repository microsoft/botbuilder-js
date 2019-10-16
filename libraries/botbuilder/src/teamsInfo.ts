/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import {
    ChannelAccount,
    ChannelInfo,
    ConversationList,
    TeamsChannelAccount,
    TeamsChannelData,
    TeamDetails,
    TurnContext
} from 'botbuilder-core';
import { ConnectorClient, TeamsConnectorClient } from 'botframework-connector';

import { BotFrameworkAdapter } from './botFrameworkAdapter';

export class TeamsInfo {
    public static async getTeamDetails(context: TurnContext, teamId?: string): Promise<TeamDetails> {
        const t = teamId || this.getTeamId(context);
        if (!t) {
            throw new Error('This method is only valid within the scope of a MS Teams Team.');
        }

        return await this.getTeamsConnectorClient(context).teams.fetchTeamDetails(t);
    }

    public static async getTeamChannels(context: TurnContext, teamId?: string): Promise<ChannelInfo[]> {
        const t = teamId || this.getTeamId(context);
        if (!t) {
            throw new Error('This method is only valid within the scope of a MS Teams Team.');
        }

        const channelList: ConversationList = await this.getTeamsConnectorClient(context).teams.fetchChannelList(t);
        return channelList.conversations;
    }

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

    public static async getTeamMembers(context: TurnContext, teamId?: string): Promise<TeamsChannelAccount[]> {
        const t = teamId || this.getTeamId(context);
        if (!t) {
            throw new Error('This method is only valid within the scope of a MS Teams Team.');
        }
        return this.getMembersInternal(this.getConnectorClient(context), t);
    }

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

    private static getConnectorClient(context: TurnContext): ConnectorClient {
        if (!context.adapter || !('createConnectorClient' in context.adapter)) {
            throw new Error('This method requires a connector client.');
        }

        return (context.adapter as BotFrameworkAdapter).createConnectorClient(context.activity.serviceUrl);
    }

    private static getTeamsConnectorClient(context: TurnContext): TeamsConnectorClient {
        const connectorClient = this.getConnectorClient(context);
        return new TeamsConnectorClient(connectorClient.credentials, { baseUri: context.activity.serviceUrl });
    }
}
