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
    CallerIdConstants,
    ResourceResponse,
    SkillConversationIdFactoryBase,
    SkillConversationReference,
    SkillConversationReferenceKey,
    TurnContext,
} from 'botbuilder-core';
import {
    AuthenticationConfiguration,
    AppCredentials,
    ICredentialProvider,
    ClaimsIdentity,
    JwtTokenValidation,
    GovernmentConstants,
    AuthenticationConstants,
} from 'botframework-connector';

import { ChannelServiceHandler } from '../channelServiceHandler';
import { BotFrameworkAdapter } from '../botFrameworkAdapter';

/**
 * Casts adapter to BotFrameworkAdapter only if necessary
 * @param adapter adapter to maybe cast as BotFrameworkAdapter
 */
function maybeCastAdapter(adapter: BotAdapter): BotFrameworkAdapter {
    return adapter instanceof BotFrameworkAdapter ? adapter : (adapter as BotFrameworkAdapter);
}

/**
 * A Bot Framework Handler for skills.
 */
export class SkillHandler extends ChannelServiceHandler {
    /**
     * Used to access the CovnersationReference sent from the Skill to the Parent.
     * @remarks
     * The value is the same as the SkillConversationReferenceKey exported from botbuilder-core.
     */
    public readonly SkillConversationReferenceKey = SkillConversationReferenceKey;

    /**
     * Initializes a new instance of the SkillHandler class.
     * @param adapter An instance of the BotAdapter that will handle the request.
     * @param bot The ActivityHandlerBase instance.
     * @param conversationIdFactory A SkillConversationIdFactoryBase to unpack the conversation ID and map it to the calling bot.
     * @param credentialProvider The credential provider.
     * @param authConfig The authentication configuration.
     * @param channelService The string indicating if the bot is working in Public Azure or in Azure Government (https://aka.ms/AzureGovDocs).
     */
    public constructor(
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

        if (!bot) {
            throw new Error('missing bot.');
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
    protected async onSendToConversation(
        claimsIdentity: ClaimsIdentity,
        conversationId: string,
        activity: Activity
    ): Promise<ResourceResponse> {
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
    protected async onReplyToActivity(
        claimsIdentity: ClaimsIdentity,
        conversationId: string,
        activityId: string,
        activity: Activity
    ): Promise<ResourceResponse> {
        return await this.processActivity(claimsIdentity, conversationId, activityId, activity);
    }

    /**
     * @private
     */
    private static applyEoCToTurnContextActivity(
        turnContext: TurnContext,
        endOfConversationActivity: Partial<Activity>
    ): void {
        // transform the turnContext.activity to be an EndOfConversation Activity.
        turnContext.activity.type = endOfConversationActivity.type;
        turnContext.activity.text = endOfConversationActivity.text;
        turnContext.activity.code = endOfConversationActivity.code;

        turnContext.activity.replyToId = endOfConversationActivity.replyToId;
        turnContext.activity.value = endOfConversationActivity.value;
        turnContext.activity.entities = endOfConversationActivity.entities;
        turnContext.activity.locale = endOfConversationActivity.locale;
        turnContext.activity.localTimestamp = endOfConversationActivity.localTimestamp;
        turnContext.activity.timestamp = endOfConversationActivity.timestamp;
        turnContext.activity.channelData = endOfConversationActivity.channelData;
    }

    /**
     * @private
     */
    private static applyEventToTurnContextActivity(turnContext: TurnContext, eventActivity: Partial<Activity>): void {
        // transform the turnContext.activity to be an Event Activity.
        turnContext.activity.type = eventActivity.type;
        turnContext.activity.name = eventActivity.name;
        turnContext.activity.value = eventActivity.value;
        turnContext.activity.relatesTo = eventActivity.relatesTo;

        turnContext.activity.replyToId = eventActivity.replyToId;
        turnContext.activity.value = eventActivity.value;
        turnContext.activity.entities = eventActivity.entities;
        turnContext.activity.locale = eventActivity.locale;
        turnContext.activity.localTimestamp = eventActivity.localTimestamp;
        turnContext.activity.timestamp = eventActivity.timestamp;
        turnContext.activity.channelData = eventActivity.channelData;
    }

    /**
     * @private
     */
    private async getSkillConversationReference(conversationId: string): Promise<SkillConversationReference> {
        let skillConversationReference: SkillConversationReference;

        try {
            skillConversationReference = await this.conversationIdFactory.getSkillConversationReference(conversationId);
        } catch (err) {
            // If the factory has overridden getSkillConversationReference, call the deprecated getConversationReference().
            // In this scenario, the oAuthScope paired with the ConversationReference can only be used for talking with
            // an official channel, not another bot.
            if (err.message === 'Not Implemented') {
                const conversationReference = await this.conversationIdFactory.getConversationReference(conversationId);
                skillConversationReference = {
                    conversationReference,
                    oAuthScope: JwtTokenValidation.isGovernment(this.channelService)
                        ? GovernmentConstants.ToChannelFromBotOAuthScope
                        : AuthenticationConstants.ToChannelFromBotOAuthScope,
                };
            } else {
                // Re-throw all other errors.
                throw err;
            }
        }

        if (!skillConversationReference) {
            throw new Error('skillConversationReference not found');
        } else if (!skillConversationReference.conversationReference) {
            throw new Error('conversationReference not found.');
        }

        return skillConversationReference;
    }

    /**
     * Helper method for forwarding a conversation through the adapter
     */
    private async continueConversation(
        claimsIdentity: ClaimsIdentity,
        conversationId: string,
        callback: (adapter: BotFrameworkAdapter, ref: SkillConversationReference, context: TurnContext) => Promise<void>
    ): Promise<void> {
        const ref = await this.getSkillConversationReference(conversationId);

        // Add the channel service URL to the trusted services list so we can send messages back.
        // the service URL for skills is trusted because it is applied based on the original request
        // received by the root bot.
        AppCredentials.trustServiceUrl(ref.conversationReference.serviceUrl);

        return maybeCastAdapter(this.adapter).continueConversation(
            ref.conversationReference,
            ref.oAuthScope,
            async (context: TurnContext): Promise<void> => {
                const adapter = maybeCastAdapter(context.adapter);

                // Cache the claimsIdentity and conversation reference
                context.turnState.set(adapter.BotIdentityKey, claimsIdentity);
                context.turnState.set(this.SkillConversationReferenceKey, ref);

                return callback(adapter, ref, context);
            }
        );
    }

    private async processActivity(
        claimsIdentity: ClaimsIdentity,
        conversationId: string,
        activityId: string,
        activity: Activity
    ): Promise<ResourceResponse> {
        // If an activity is sent, return the ResourceResponse
        let resourceResponse: ResourceResponse;

        /**
         * This callback does the following:
         *  - Applies the correct ConversationReference to the Activity for sending to the user-router conversation.
         *  - For EndOfConversation Activities received from the Skill, removes the ConversationReference from the
         *    ConversationIdFactory
         */
        await this.continueConversation(claimsIdentity, conversationId, async (adapter, ref, context) => {
            const newActivity = TurnContext.applyConversationReference(activity, ref.conversationReference);
            context.activity.id = activityId;
            context.activity.callerId = `${CallerIdConstants.BotToBotPrefix}${JwtTokenValidation.getAppIdFromClaims(
                claimsIdentity.claims
            )}`;

            // Cache connector client in turn context
            const client = adapter.createConnectorClient(newActivity.serviceUrl);
            context.turnState.set(adapter.ConnectorClientKey, client);

            switch (newActivity.type) {
                case ActivityTypes.EndOfConversation:
                    await this.conversationIdFactory.deleteConversationReference(conversationId);
                    SkillHandler.applyEoCToTurnContextActivity(context, newActivity);
                    await this.bot.run(context);
                    break;
                case ActivityTypes.Event:
                    SkillHandler.applyEventToTurnContextActivity(context, newActivity);
                    await this.bot.run(context);
                    break;
                default:
                    resourceResponse = await context.sendActivity(newActivity);
                    break;
            }
        });

        if (!resourceResponse) {
            resourceResponse = { id: uuid() };
        }

        return resourceResponse;
    }

    /**
     *
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
        await this.continueConversation(claimsIdentity, conversationId, async (adapter, ref, context) => {
            const newActivity = TurnContext.applyConversationReference(activity, ref.conversationReference);

            context.activity.id = activityId;
            context.activity.callerId = `${CallerIdConstants.BotToBotPrefix}${JwtTokenValidation.getAppIdFromClaims(
                claimsIdentity.claims
            )}`;

            return context.updateActivity(newActivity);
        });

        // Note: the original activity ID is passed back here to provide "behavioral" parity with the C# SDK. Due to
        // some inconsistent method signatures, the proper response is not propagated back through `context.updateActivity`
        // so we have to manually pass this value back.
        return { id: activityId };
    }

    /**
     * DeleteActivity() API for Skill.
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
        // Callback method handles deleting activity
        return this.continueConversation(
            claimsIdentity,
            conversationId,
            async (adapter, ref, context): Promise<void> => {
                return context.deleteActivity(activityId);
            }
        );
    }
}

// Helper function to generate an UUID.
// Code is from @stevenic: https://github.com/stevenic
function uuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c): string => {
        const r = (Math.random() * 16) | 0,
            v = c == 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}
