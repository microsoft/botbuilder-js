/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import {
    Activity,
    ActivityHandlerBase,
    ActivityTypes,
    BotAdapter,
    ResourceResponse,
    TurnContext
} from 'botbuilder-core';
import { AuthenticationConfiguration, AppCredentials, ICredentialProvider, ClaimsIdentity } from 'botframework-connector';

import { ChannelServiceHandler } from '../channelServiceHandler';
import { SkillConversationIdFactoryBase } from './skillConversationIdFactoryBase';
import { BotFrameworkAdapter } from '../botFrameworkAdapter';

/**
 * A Bot Framework Handler for skills.
 */
export class SkillHandler extends ChannelServiceHandler {
    public readonly SkillConversationReferenceKey: Symbol = Symbol('SkillConversationReference');
    /**
     * Initializes a new instance of the SkillHandler class.
     * @param adapter An instance of the BotAdapter that will handle the request.
     * @param bot The ActivityHandlerBase instance.
     * @param conversationIdFactory A SkillConversationIdFactoryBase to unpack the conversation ID and map it to the calling bot.
     * @param credentialProvider The credential provider.
     * @param authConfig The authentication configuration.
     * @param channelService The string indicating if the bot is working in Public Azure or in Azure Government (https://aka.ms/AzureGovDocs).
     */
    constructor(
        private readonly adapter: BotAdapter,
        private readonly bot: ActivityHandlerBase,
        private readonly conversationIdFactory: SkillConversationIdFactoryBase,
        credentialProvider: ICredentialProvider,
        authConfig: AuthenticationConfiguration,
        channelService?: string
    ) {
        super(credentialProvider, authConfig, channelService);
        if (!adapter) {
            throw new Error('missing adapter.');
        }
        if (!conversationIdFactory) {
            throw new Error('missing conversationIdFactory.');
        }
    }

    /**
     * sendToConversation() API for Skill.
     * @remarks
     * This method allows you to send an activity to the end of a conversation.
     * 
     * This is slightly different from replyToActivity().
     * * sendToConversation(conversationId) - will append the activity to the end
     * of the conversation according to the timestamp or semantics of the channel.
     * * replyToActivity(conversationId,ActivityId) - adds the activity as a reply
     * to another activity, if the channel supports it. If the channel does not
     * support nested replies, replyToActivity falls back to sendToConversation.
     * 
     * Use replyToActivity when replying to a specific activity in the conversation.
     * 
     * Use sendToConversation in all other cases.
     * @param claimsIdentity ClaimsIdentity for the bot, should have AudienceClaim, AppIdClaim and ServiceUrlClaim.
     * @param conversationId Conversation ID.
     * @param activity Activity to send.
     * @returns A Promise with a ResourceResponse.
     */
    protected async onSendToConversation(claimsIdentity: ClaimsIdentity, conversationId: string, activity: Activity): Promise<ResourceResponse> {
        return await this.processActivity(claimsIdentity, conversationId, null, activity);
    }
    
    /**
     * replyToActivity() API for Skill.
     * @remarks
     * This method allows you to reply to an activity.
     * 
     * This is slightly different from sendToConversation().
     * * sendToConversation(conversationId) - will append the activity to the end
     * of the conversation according to the timestamp or semantics of the channel.
     * * replyToActivity(conversationId,ActivityId) - adds the activity as a reply
     * to another activity, if the channel supports it. If the channel does not
     * support nested replies, replyToActivity falls back to sendToConversation.
     * 
     * Use replyToActivity when replying to a specific activity in the conversation.
     * 
     * Use sendToConversation in all other cases.
     * @param claimsIdentity ClaimsIdentity for the bot, should have AudienceClaim, AppIdClaim and ServiceUrlClaim.
     * @param conversationId Conversation ID.
     * @param activityId activityId the reply is to.
     * @param activity Activity to send.
     * @returns A Promise with a ResourceResponse.
     */
    protected async onReplyToActivity(claimsIdentity: ClaimsIdentity, conversationId: string, activityId: string, activity: Activity): Promise<ResourceResponse> {
        return await this.processActivity(claimsIdentity, conversationId, activityId, activity);
    }

    private static applyEoCToTurnContextActivity(turnContext: TurnContext,endOfConversationActivity: Activity): void {
        // transform the turnContext.activity to be an EndOfConversation Activity.
        turnContext.activity.type = endOfConversationActivity.type;
        turnContext.activity.text = endOfConversationActivity.text;
        turnContext.activity.code = endOfConversationActivity.code;

        turnContext.activity.replyToId = endOfConversationActivity.replyToId;
        turnContext.activity.value = endOfConversationActivity.value;
        turnContext.activity.entities = endOfConversationActivity.entities;
        turnContext.activity.localTimestamp = endOfConversationActivity.localTimestamp;
        turnContext.activity.timestamp = endOfConversationActivity.timestamp;
        turnContext.activity.channelData = endOfConversationActivity.channelData;
    }

    private static applyEventToTurnContextActivity(turnContext: TurnContext, eventActivity: Activity): void {
        // transform the turnContext.activity to be an Event Activity.
        turnContext.activity.type = eventActivity.type;
        turnContext.activity.name = eventActivity.name;
        turnContext.activity.value = eventActivity.value;
        turnContext.activity.relatesTo = eventActivity.relatesTo;

        turnContext.activity.replyToId = eventActivity.replyToId;
        turnContext.activity.value = eventActivity.value;
        turnContext.activity.entities = eventActivity.entities;
        turnContext.activity.localTimestamp = eventActivity.localTimestamp;
        turnContext.activity.timestamp = eventActivity.timestamp;
        turnContext.activity.channelData = eventActivity.channelData;
    }

    private async processActivity(claimsIdentity: ClaimsIdentity, conversationId: string, replyToActivityId: string, activity: Activity): Promise<ResourceResponse> {
        const conversationReference = await this.conversationIdFactory.getConversationReference(conversationId);
        if (!conversationReference) {
            throw new Error('conversationReference not found.');
        }
        const skillConversationReference = TurnContext.getConversationReference(activity);

        /**
         * Callback passed to the BotFrameworkAdapter.createConversation() call.
         * This function does the following:
         *  - Caches the ClaimsIdentity on the TurnContext.turnState
         *  - Applies the correct ConversationReference to the Activity for sending to the user-router conversation.
         *  - For EndOfConversation Activities received from the Skill, removes the ConversationReference from the
         *    ConversationIdFactory
         */
        const callback = async (context: TurnContext): Promise<void> => {
            const adapter: BotFrameworkAdapter = (context.adapter as BotFrameworkAdapter);
            // Cache the ClaimsIdentity and ConnectorClient on the context so that it's available inside of the bot's logic.
            context.turnState.set(adapter.BotIdentityKey, claimsIdentity);
            context.turnState.set(this.SkillConversationReferenceKey, skillConversationReference);
            activity = TurnContext.applyConversationReference(activity, conversationReference) as Activity;
            const client = adapter.createConnectorClient(activity.serviceUrl);
            context.turnState.set(adapter.ConnectorClientKey, client);

            context.activity.id = replyToActivityId;
            switch (activity.type) {
                case ActivityTypes.EndOfConversation:
                    await this.conversationIdFactory.deleteConversationReference(conversationId);
                    SkillHandler.applyEoCToTurnContextActivity(context, activity);
                    await this.bot.run(context);
                    break;
                case ActivityTypes.Event:
                    SkillHandler.applyEventToTurnContextActivity(context, activity);
                    await this.bot.run(context);
                    break;
                default:
                    await context.sendActivity(activity);
                    break;
            }
        };

        // Add the channel service URL to the trusted services list so we can send messages back.
        // the service URL for skills is trusted because it is applied based on the original request
        // received by the root bot.
        AppCredentials.trustServiceUrl(conversationReference.serviceUrl);

        await this.adapter.continueConversation(conversationReference, callback);
        return { id: uuid() };
    }
}

// Helper function to generate an UUID.
// Code is from @stevenic: https://github.com/stevenic
function uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}
