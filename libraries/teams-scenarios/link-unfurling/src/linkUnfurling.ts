// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import {
    AppBasedLinkQuery,
    CardFactory,
    MessagingExtensionResponse,
    MessagingExtensionResult,
    TeamsActivityHandler,
    TurnContext }
from 'botbuilder';

/**
 * Teams handler class to do link unfurling.
 */
export class LinkUnfurlingBot extends TeamsActivityHandler {
    /**
     * Initializes a new instance of the `LinkUnfurlingBot` class.
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
     * "Link Unfurling"
     * This handler is used for the processing of "composeExtension/queryLink" activities from Teams.
     * https://docs.microsoft.com/en-us/microsoftteams/platform/concepts/messaging-extensions/search-extensions#receive-requests-from-links-inserted-into-the-compose-message-box
     * By specifying domains under the messageHandlers section in the manifest, the bot can receive
     * events when a user enters in a domain in the compose box.
     */
    protected async handleTeamsAppBasedLinkQuery(context: TurnContext, query: AppBasedLinkQuery): Promise<MessagingExtensionResponse> {
        const attachment = CardFactory.thumbnailCard('Thumbnail Card', query.url, ["https://raw.githubusercontent.com/microsoft/botframework-sdk/master/icon.png"]);

        const result: MessagingExtensionResult = {
            attachmentLayout: 'list',
            type: 'result',
            attachments: [attachment],
            text: 'test unfurl',
        }
        const response: MessagingExtensionResponse = {
            composeExtension: result,
        }

        return response;
    }
}
