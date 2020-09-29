// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import {
    Activity,
    Attachment,
    BotFrameworkAdapter,
    ChannelInfo,
    ConversationParameters,
    ConversationReference,
    ConversationResourceResponse,
    MessageFactory,
    MessagingExtensionAction,
    MessagingExtensionActionResponse,
    TeamsChannelData,
    TeamDetails,
    TeamsActivityHandler,
    TeamsInfo,
    TurnContext
} from 'botbuilder';

import { AdaptiveCardHelper } from './adaptiveCardHelper';
import { CardResponseHelpers } from './cardResponseHelpers';
import { SubmitExampleData } from './submitExampleData';

/**
 * After installing this bot you will need to click on the 3 dots to pull up the extension menu to select the bot. Once you do you do
 * see the extension pop a task module.
 */
export class ActionBasedMessagingExtensionFetchTaskBot extends TeamsActivityHandler {
    /**
     * Initializes a new instance of the `ActionBasedMessagingExtensionFetchTaskBot` class.
     */
    constructor() {
        super();

        // See https://aka.ms/about-bot-activity-message to learn more about the message and other activity types.
        this.onMessage(async (context, next) => {
            await context.sendActivity(`You said '${context.activity.text}'`);
            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });
    }

    /**
     * @protected
     */
    protected async handleTeamsMessagingExtensionFetchTask(context: TurnContext, action: MessagingExtensionAction): Promise<MessagingExtensionActionResponse> {
        const response = AdaptiveCardHelper.createTaskModuleAdaptiveCardResponse();
        return response;
    }

    /**
     * @protected
     */
    protected async handleTeamsMessagingExtensionSubmitAction(context: TurnContext, action: MessagingExtensionAction): Promise<MessagingExtensionActionResponse> {
        const submittedData = action.data as SubmitExampleData;
        const adaptiveCard = AdaptiveCardHelper.toAdaptiveCardAttachment(submittedData);
        const response = CardResponseHelpers.toMessagingExtensionBotMessagePreviewResponse(adaptiveCard);
        return response;
    }

    /**
     * @protected
     */
    protected async handleTeamsMessagingExtensionBotMessagePreviewEdit(context: TurnContext, action: MessagingExtensionAction): Promise<MessagingExtensionActionResponse> {
        const submitData = AdaptiveCardHelper.toSubmitExampleData(action);
        const response = AdaptiveCardHelper.createTaskModuleAdaptiveCardResponse(
                                                    submitData.Question,
                                                    (submitData.MultiSelect.toLowerCase() === 'true'),
                                                    submitData.Option1,
                                                    submitData.Option2,
                                                    submitData.Option3);
        return response;
    }

    /**
     * @protected
     */
    protected async handleTeamsMessagingExtensionBotMessagePreviewSend(context: TurnContext, action: MessagingExtensionAction): Promise<MessagingExtensionActionResponse> {
        const submitData: SubmitExampleData = AdaptiveCardHelper.toSubmitExampleData(action);
        const adaptiveCard: Attachment = AdaptiveCardHelper.toAdaptiveCardAttachment(submitData);

        const responseActivity = {type: 'message', attachments: [adaptiveCard] } as Activity;

        try {
            // Send to channel where messaging extension invoked.
            let results = await this.teamsCreateConversation(context, context.activity.channelData.channel.id, responseActivity);

            // Send card to "General" channel.
            const teamDetails: TeamDetails = await TeamsInfo.getTeamDetails(context);
            results = await this.teamsCreateConversation(context, teamDetails.id, responseActivity);
        } catch {
            console.error('In group chat or personal scope.');
        }

        // Send card to compose box for the current user.
        const response = CardResponseHelpers.toComposeExtensionResultResponse(adaptiveCard);
        return response;
    }

    /**
     * @protected
     */
    protected async handleTeamsMessagingExtensionCardButtonClicked(context: TurnContext, obj) {
        const reply = MessageFactory.text('handleTeamsMessagingExtensionCardButtonClicked Value: ' + JSON.stringify(context.activity.value));
        await context.sendActivity(reply);
    }

    /**
     * @protected
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
