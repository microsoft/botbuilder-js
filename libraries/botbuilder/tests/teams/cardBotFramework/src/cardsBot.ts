// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import {
    TeamsActivityHandler,
} from 'botbuilder';
import {
    CardAction,
    CardFactory,
    MessageFactory,
    TurnContext,
    ActionTypes,
} from 'botbuilder-core';

export class CardsBot  extends TeamsActivityHandler {
    // NOT SUPPORTED ON TEAMS: AnimationCard, AudioCard, VideoCard, OAuthCard
    cardTypes: string[];
    constructor() {
        super();
       /*
        * From the UI you can @mention the bot, from any scope, any of the strings listed below to get that card back.
        */
       const HeroCard : string = "Hero";
       const ThumbnailCard : string = "Thumbnail";
       const ReceiptCard : string  = "Receipt";
       const SigninCard : string  = "Signin";
       const Carousel : string  = "Carousel";
       const List : string  = "List";
       this.cardTypes = [ HeroCard, ThumbnailCard, ReceiptCard, SigninCard, Carousel, List ];

        // See https://aka.ms/about-bot-activity-message to learn more about the message and other activity types.
        this.onMessage(async (context, next) => {
            const text = context.activity.text.trim().split(" ").splice(-1)[0];
            await context.sendActivity('You said ' + text);
            // By calling next() you ensure that the next BotHandler is run.
            var activity = context.activity;
            TurnContext.removeRecipientMention(activity);
            var reply = null;
            switch(text.toUpperCase()) {
                case HeroCard.toUpperCase():
                    reply = MessageFactory.attachment(this.getHeroCard());
                    break;
                case ThumbnailCard.toUpperCase():
                    reply = MessageFactory.attachment(this.getThumbnailCard());
                    break;
                case ReceiptCard.toUpperCase():
                    reply = MessageFactory.attachment(this.getReceiptCard());
                    break;
                case SigninCard.toUpperCase():
                    reply = MessageFactory.attachment(this.getSigninCard());
                    break;
                case Carousel.toUpperCase():
                    // NOTE: if cards are NOT the same height in a carousel, Teams will instead display as AttachmentLayoutTypes.List
                    reply = MessageFactory.carousel([this.getHeroCard(), this.getHeroCard(), this.getHeroCard() ]);
                    break;
                case List.toUpperCase():
                    // NOTE: MessageFactory.Attachment with multiple attachments will default to AttachmentLayoutTypes.List
                    reply = MessageFactory.list([ this.getHeroCard(), this.getHeroCard(), this.getHeroCard()]);
                    break;
                             
                default:
                    reply = MessageFactory.attachment(this.getChoices());
                    break;
            }
            await context.sendActivity(reply);
            await next();
        });
    }
    private getHeroCard() {
        return CardFactory.heroCard("BotFramework Hero Card",
            "Build and connect intelligent bots to interact with your users naturally wherever they are," +
            " from text/sms to Skype, Slack, Office 365 mail and other popular services.",
            ["https://sec.ch9.ms/ch9/7ff5/e07cfef0-aa3b-40bb-9baa-7c9ef8ff7ff5/buildreactionbotframework_960.jpg"],
            [{"type": ActionTypes.OpenUrl,  "title": "Get Started", value: "https://docs.microsoft.com/bot-framework"}]);
    }

    private getThumbnailCard() {
        return CardFactory.thumbnailCard("BotFramework Thumbnail Card",
            "Build and connect intelligent bots to interact with your users naturally wherever they are," +
            " from text/sms to Skype, Slack, Office 365 mail and other popular services.",
            ["https://sec.ch9.ms/ch9/7ff5/e07cfef0-aa3b-40bb-9baa-7c9ef8ff7ff5/buildreactionbotframework_960.jpg"],
            [{"type": ActionTypes.OpenUrl,  "title": "Get Started", value: "https://docs.microsoft.com/bot-framework"}]);
    }
    private getReceiptCard() {
        return CardFactory.receiptCard({
                title: "John Doe",
                facts: [
                    { key: "Order Number", value: "1234" },
                    { key: "Payment Method", value: "VISA 5555-****" },
                ],
                items: [{ title: "Data Transfer",
                          price: "$ 38.45",
                          quantity: "368",
                          image: { url: "https://github.com/amido/azure-vector-icons/raw/master/renders/traffic-manager.png"},
                          subtitle: '',
                          text: '',
                          tap: {type:'', title:'', value:null},
                        }, 
                        { title: "App Service",
                          price: "$ 45.00",
                          quantity: "720",
                          image: { url: "https://github.com/amido/azure-vector-icons/raw/master/renders/cloud-service.png" },
                          subtitle: '',
                          text: '',
                          tap: {type:'', title:'', value:null},
                        }],
                tax: "$ 7.50",
                total: "$ 90.95",
                tap: {type:'', title:'', value:null},
                vat: '',
                buttons: [{
                    type: ActionTypes.OpenUrl,
                    title: "More information",
                    image: "https://account.windowsazure.com/content/6.10.1.38-.8225.160809-1618/aux-pre/images/offer-icon-freetrial.png",
                    value: "https://azure.microsoft.com/en-us/pricing/",
                }],
        });
    }

    private getSigninCard() {
        return CardFactory.signinCard("BotFramework Sign-in Card", "https://login.microsoftonline.com/", "Sign-in");
    }
    private getChoices()
    {
        var actions = <CardAction[]> this.cardTypes.map((cardType) => ( { type: ActionTypes.MessageBack, title: cardType, text:cardType}) );
        return CardFactory.heroCard("Task Module Invocation from Hero Card", null, actions);
    }
}
