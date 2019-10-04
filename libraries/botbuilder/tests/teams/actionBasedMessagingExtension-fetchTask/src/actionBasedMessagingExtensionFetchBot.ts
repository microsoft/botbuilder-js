// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import {
    MessagingExtensionAction,
    MessagingExtensionActionResponse,
    MessageFactory,
    TeamsActivityHandler,
    TurnContext
} from 'botbuilder';

import { AdaptiveCardHelper  } from './adaptiveCardHelper';
import { SubmitExampleData  } from './submitExampleData';
import { CardResponseHelpers } from './cardResponseHelpers';

export class ActionBasedMessagingExtensionFetchTaskBot   extends TeamsActivityHandler {
    /*
     * After installing this bot you will need to click on the 3 dots to pull up the extension menu to select the bot. Once you do you do 
     * see the extension pop a task module.
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

    protected async onTeamsMessagingExtensionFetchTask(context, query): Promise<MessagingExtensionActionResponse> {
        const resp = AdaptiveCardHelper.createTaskModuleAdaptiveCardResponse();
        return resp;        
    }

    protected async onTeamsMessagingExtensionSubmitAction(context: TurnContext, action: MessagingExtensionAction) : Promise<MessagingExtensionActionResponse> {
        const submittedData = <SubmitExampleData>action.data;
        const adaptiveCard = AdaptiveCardHelper.toAdaptiveCardAttachment(submittedData);
        const response = CardResponseHelpers.toMessagingExtensionBotMessagePreviewResponse(adaptiveCard);
        return response;
    }

    protected async onTeamsMessagingExtensionBotMessagePreviewEdit(context: TurnContext, action: MessagingExtensionAction): Promise<MessagingExtensionActionResponse> {
        const submitData = AdaptiveCardHelper.toSubmitExampleData(action);
        const response = AdaptiveCardHelper.createTaskModuleAdaptiveCardResponse(
                                                    submitData.Question,
                                                    (submitData.MultiSelect.toLowerCase() == 'true'),
                                                    submitData.Option1,
                                                    submitData.Option2,
                                                    submitData.Option3);
        return response;
    }

    protected async onTeamsMessagingExtensionBotMessagePreviewSend(context: TurnContext, action: MessagingExtensionAction) : Promise<MessagingExtensionActionResponse> {
        const submitData = AdaptiveCardHelper.toSubmitExampleData(action);
        const adaptiveCard = AdaptiveCardHelper.toAdaptiveCardAttachment(submitData);
        const response = CardResponseHelpers.toComposeExtensionResultResponse(adaptiveCard);
        return response;
    }

    protected async onTeamsMessagingExtensionCardButtonClicked(context: TurnContext, obj) {
        const reply = MessageFactory.text("onTeamsMessagingExtensionCardButtonClicked Value: " + JSON.stringify(context.activity.value));
        await context.sendActivity(reply);
    }
}
