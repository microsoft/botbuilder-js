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
    ResourceResponse,
    TeamsChannelData,
    TurnContext,
} from 'botbuilder-core';
import { teamsGetTeamId } from './teamsActivityHelpers';
import { BotFrameworkAdapter } from './botFrameworkAdapter';

/**
 * Turn Context extension methods for Teams.
 */

export async function teamsCreateConversation(turnContext: TurnContext, teamsChannelId: string, message: Partial<Activity>): Promise<[ConversationReference, string]> {
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
        activity: <Activity>message,
    };
    const adapter = <BotFrameworkAdapter>turnContext.adapter;
    const connectorClient = adapter.createConnectorClient(turnContext.activity.serviceUrl);
    // This call does NOT send the outbound Activity is not being sent through the middleware stack.
    const conversationResourceResponse: ConversationResourceResponse = await connectorClient.conversations.createConversation(conversationParameters);
    const conversationReference = <ConversationReference>TurnContext.getConversationReference(turnContext.activity);
    conversationReference.conversation.id = conversationResourceResponse.id;
    return [conversationReference, conversationResourceResponse.activityId];
}

