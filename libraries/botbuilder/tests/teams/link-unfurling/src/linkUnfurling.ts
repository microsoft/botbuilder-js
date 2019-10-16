// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import {
    AppBasedLinkQuery,
    MessagingExtensionResponse,
    MessagingExtensionResult,
    TeamsActivityHandler,
    CardFactory, 
    ThumbnailCard,
    CardImage,
    HeroCard,
    TurnContext } 
from 'botbuilder';

export class LinkUnfurlingBot extends TeamsActivityHandler {
    constructor() {
        super();

        // See https://aka.ms/about-bot-activity-message to learn more about the message and other activity types.
        this.onMessage(async (context, next) => {
            await context.sendActivity(`You said '${context.activity.text}'`);
            await context.sendActivity(`Second response! '${context.activity.text}'`);
            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });
    }

     // "Link Unfurling"
    // This handler is used for the processing of "composeExtension/queryLink" activities from Teams.
    // https://docs.microsoft.com/en-us/microsoftteams/platform/concepts/messaging-extensions/search-extensions#receive-requests-from-links-inserted-into-the-compose-message-box
    // By specifying domains under the messageHandlers section in the manifest, the bot can receive
    // events when a user enters in a domain in the compose box.   
    protected async onTeamsAppBasedLinkQuery(context: TurnContext, query: AppBasedLinkQuery): Promise<MessagingExtensionResponse> {
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

            // For Invoke activities from Teams, we're currently not continuing the chain of handlers.
            // await next();
            return Promise.resolve(response);
    }
}
