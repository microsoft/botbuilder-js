// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import {
    Activity,
    MessageFactory,
    BotFrameworkAdapter,
    ChannelInfo,
    ConversationParameters,
    ConversationReference,
    ConversationResourceResponse,
    TeamsActivityHandler,
    TeamsChannelData,
    teamsGetChannelId,
    TurnContext,
} from 'botbuilder';
import { basename } from 'path';

/**
 * Reply to channel bot handlers.
 */
export class ReplyToChannelBot extends TeamsActivityHandler {
    botId: string;

    /**
     * Initializes a new instance of the `ReplyToChannelBot` class.
     */
    constructor() {
        super();

        // See https://aka.ms/about-bot-activity-message to learn more about the message and other activity types.
        this.onMessage(async (context, next) => {

            const teamChannelId = teamsGetChannelId(context.activity);
            const message = MessageFactory.text("good morning");
            const newConversation = await this.teamsCreateConversation(context, teamChannelId, message);

            const adapter = context.adapter as BotFrameworkAdapter;

            await adapter.continueConversation(newConversation[0],
                async (t) =>
                {
                    await t.sendActivity(MessageFactory.text("good afternoon"));
                    await t.sendActivity(MessageFactory.text("good night"));
                });

            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });
    }

    /**
     * @private
     */
    private async teamsCreateConversation(context: TurnContext, teamsChannelId: string, message: Partial<Activity>): Promise<[ConversationReference, string]> {
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
}
