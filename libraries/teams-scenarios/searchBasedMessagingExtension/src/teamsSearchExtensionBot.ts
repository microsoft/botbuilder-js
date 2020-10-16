// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import {
    Attachment,
    BotState,
    CardAction,
    CardFactory,
    HeroCard,
    MessagingExtensionAttachment,
    MessagingExtensionQuery,
    MessagingExtensionResponse,
    MessagingExtensionResult,
    TeamsActivityHandler,
    TurnContext
} from 'botbuilder';

export class TeamsSearchExtensionBot extends TeamsActivityHandler {

    // For this example, we're using UserState to store the user's preferences for the type of Rich Card they receive.
    // Users can specify the type of card they receive by configuring the Messaging Extension.
    // To store their configuration, we will use the userState passed in via the constructor.

    /**
     * We need to change the key for the user state because the bot might not be in the conversation, which means they get a 403 error.
     * @param userState 
     */
    constructor(public userState: BotState) {
        super();

        // See https://aka.ms/about-bot-activity-message to learn more about the message and other activity types.
        this.onMessage(async (context, next) => {
            await context.sendActivity(`You said '${context.activity.text}'`);
            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });

        this.onMembersAdded(async (context, next) => {
            const membersAdded = context.activity.membersAdded;
            for (const member of membersAdded) {
                if (member.id !== context.activity.recipient.id) {
                    await context.sendActivity('Hello and welcome!');
                }
            }

            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });
    }

    protected async handleTeamsMessagingExtensionQuery(context: TurnContext, query: MessagingExtensionQuery): Promise<MessagingExtensionResponse>{
        const searchQuery = query.parameters[0].value;
        const composeExtension = this.createMessagingExtensionResult([
            this.createSearchResultAttachment(searchQuery), 
            this.createDummySearchResultAttachment(searchQuery), 
            this.createSelectItemsResultAttachment(searchQuery)
        ]);

        return <MessagingExtensionResponse> {
            composeExtension: composeExtension
        };
    }

    protected async handleTeamsMessagingExtensionSelectItem(context: TurnContext, query: any): Promise<MessagingExtensionResponse> {
        const searchQuery = query.query;
        const bfLogo = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQtB3AwMUeNoq4gUBGe6Ocj8kyh3bXa9ZbV7u1fVKQoyKFHdkqU";
        const card = CardFactory.heroCard('You selected a search result!', `You searched for "${searchQuery}"`, [bfLogo]);

        return <MessagingExtensionResponse> {
            composeExtension: this.createMessagingExtensionResult([card])
        };
    }

    private createMessagingExtensionResult(attachments: Attachment[]) : MessagingExtensionResult {
        return <MessagingExtensionResult> {
            type: "result",
            attachmentLayout: "list",
            attachments: attachments
        };
    }

    private createSearchResultAttachment(searchQuery: string) : MessagingExtensionAttachment {
        const cardText = `You said \"${searchQuery}\"`;
        const bfLogo = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQtB3AwMUeNoq4gUBGe6Ocj8kyh3bXa9ZbV7u1fVKQoyKFHdkqU";

        const button = <CardAction> {
            type: "openUrl",
            title: "Click for more Information",
            value: "https://docs.microsoft.com/en-us/microsoftteams/platform/concepts/bots/bots-overview"
        };

        const heroCard = CardFactory.heroCard("You searched for:", cardText, [bfLogo], [button]);
        const preview = CardFactory.heroCard("You searched for:", cardText, [bfLogo]);
        preview.content.tap = { type: 'invoke', value: { query: searchQuery } };

        return <MessagingExtensionAttachment> {
            contentType: CardFactory.contentTypes.heroCard,
            content: heroCard,
            preview: preview
        };
    }

    private createDummySearchResultAttachment(searchQuery: string) : MessagingExtensionAttachment {
        const cardText = "https://docs.microsoft.com/en-us/microsoftteams/platform/concepts/bots/bots-overview";
        const bfLogo = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQtB3AwMUeNoq4gUBGe6Ocj8kyh3bXa9ZbV7u1fVKQoyKFHdkqU";

        const button = <CardAction> {
            type: "openUrl",
            title: "Click for more Information",
            value: "https://docs.microsoft.com/en-us/microsoftteams/platform/concepts/bots/bots-overview"
        };

        const heroCard = CardFactory.heroCard("Learn more about Teams:", cardText, [bfLogo], [button]);
        const preview = CardFactory.heroCard("Learn more about Teams:", cardText, [bfLogo]);
        preview.content.tap = { type: 'invoke', value: { query: searchQuery } };

        return <MessagingExtensionAttachment> {
            contentType: CardFactory.contentTypes.heroCard,
            content: heroCard,
            preview: preview
        };
    }

    private createSelectItemsResultAttachment(searchQuery: string): MessagingExtensionAttachment {
        const bfLogo = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQtB3AwMUeNoq4gUBGe6Ocj8kyh3bXa9ZbV7u1fVKQoyKFHdkqU';
        const cardText = `You said: "${searchQuery}"`;
        const heroCard = CardFactory.heroCard(cardText, cardText, [bfLogo]);

        const selectItemTap = <CardAction> {
            type: "invoke",
            value: { query: searchQuery }
        };

        const preview = CardFactory.heroCard(cardText, cardText, [bfLogo], null, null);
        const card: Partial<HeroCard> = preview.content;
        card.tap = selectItemTap;

        return <MessagingExtensionAttachment> {
            contentType: CardFactory.contentTypes.heroCard,
            content: heroCard,
            preview: preview,
        };
    }
}
