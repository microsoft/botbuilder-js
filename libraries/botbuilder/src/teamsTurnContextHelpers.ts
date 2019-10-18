/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import {
    Activity,
    ChannelInfo,
    ConversationParameters,
    ConversationReference,
    ConversationResourceResponse,
    TeamsChannelData,
    TurnContext
} from 'botbuilder-core';

import { teamsGetTeamId } from './teamsActivityHelpers';
import { BotFrameworkAdapter } from './botFrameworkAdapter';

/**
 * Turn Context extension methods for Teams.
 */

export async function teamsCreateConversation(context: TurnContext, teamsChannelId: string, message: Partial<Activity>): Promise<[ConversationReference, string]> {
    if (!teamsChannelId) {
        throw new Error('Missing valid teamsChannelId argument');
    }
    if (!message) {
        throw new Error('Missing valid message argument');
    }
    const conversationParameters = <ConversationParameters>{
        isGroup: true,
        channelData: <TeamsChannelData>{
            channel: <ChannelInfo>{
                id: teamsChannelId
            }
        },
        activity: message,
    };
    const adapter = <BotFrameworkAdapter>context.adapter;
    const connectorClient = adapter.createConnectorClient(context.activity.serviceUrl);
    // This call does NOT send the outbound Activity is not being sent through the middleware stack.
    const conversationResourceResponse: ConversationResourceResponse = await connectorClient.conversations.createConversation(conversationParameters);
    const conversationReference = <ConversationReference>TurnContext.getConversationReference(context.activity);
    conversationReference.conversation.id = conversationResourceResponse.id;
    return [conversationReference, conversationResourceResponse.activityId];
}

export async function teamsSendToGeneralChannel(context: TurnContext, message: Partial<Activity>): Promise<[ConversationReference, string]> {
    const teamId = teamsGetTeamId(context.activity);
    if (!teamId) {
        throw new Error('The current Activity was not sent from a Teams Team.');
    }

    return teamsCreateConversation(context, teamId, message);
}
