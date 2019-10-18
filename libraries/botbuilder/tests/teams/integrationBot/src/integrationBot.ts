// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import {
    Activity,
    ActivityTypes,
    ActionTypes,
    Attachment,
    CardAction,
    CardFactory,
    ChannelAccount,
    ChannelInfo,
    FileInfoCard,
    FileConsentCard,
    FileConsentCardResponse,
    InvokeResponse,
    MessageFactory,
    MessagingExtensionAction,
    MessagingExtensionActionResponse,
    TaskModuleContinueResponse,
    TaskModuleMessageResponse,
    TaskModuleRequest,
    TaskModuleResponse,
    TaskModuleTaskInfo,
    TeamDetails,
    TeamsActivityHandler,
    teamsCreateConversation,
    TeamInfo,
    TeamsInfo,
    TurnContext,
} from 'botbuilder';

import { AdaptiveCardHelper } from './adaptiveCardHelper';
import { CardResponseHelpers } from './cardResponseHelpers';
import { SubmitExampleData } from './submitExampleData';

export class IntegrationBot extends TeamsActivityHandler {
    protected activityIds: string[];
    // NOT SUPPORTED ON TEAMS: AnimationCard, AudioCard, VideoCard, OAuthCard
    protected cardTypes: string[];

    static readonly HeroCard = 'Hero';
    static readonly  ThumbnailCard = 'Thumbnail';
    static readonly  ReceiptCard = 'Receipt';
    static readonly  SigninCard = 'Signin';
    static readonly  Carousel = 'Carousel';
    static readonly  List = 'List';
    
    /*
     * After installing this bot you will need to click on the 3 dots to pull up the extension menu to select the bot. Once you do you do
     * see the extension pop a task module.
     */
    constructor(activityIds: string[]) {
        super();
        this.activityIds = activityIds;
        this.cardTypes = [
            IntegrationBot.HeroCard, 
            IntegrationBot.ThumbnailCard, 
            IntegrationBot.ReceiptCard, 
            IntegrationBot.SigninCard, 
            IntegrationBot.Carousel, 
            IntegrationBot.List];
        
        // See https://aka.ms/about-bot-activity-message to learn more about the message and other activity types.
        this.onMessage(async (context, next) => {
            TurnContext.removeRecipientMention(context.activity);
            let text = context.activity.text;
            if (text && text.length > 0) {
                text = text.trim();
                await this.handleNonEmptyMessage(text, context, next);
            }
            else {
                await context.sendActivity('App sent a message with empty text');
                const activityValue = context.activity.value;
                if (activityValue) {
                    await context.sendActivity(`but with value ${JSON.stringify(activityValue)}`);
                }
            }

            // By calling next() you ensure that the next BotHandler is run.
            await next();
        });

        this.onTeamsChannelRenamedEvent(async (channelInfo: ChannelInfo, teamInfo: TeamInfo, context: TurnContext, next: () => Promise<void>): Promise<void> => {
            const card = CardFactory.heroCard('Channel Renamed', `${channelInfo.name} is the new Channel name`);
            const message = MessageFactory.attachment(card);
            await context.sendActivity(message);
            await next();
        });

        this.onTeamsChannelCreatedEvent(async (channelInfo: ChannelInfo, teamInfo: TeamInfo, context: TurnContext, next: () => Promise<void>): Promise<void> => {
            const card = CardFactory.heroCard('Channel Created', `${channelInfo.name} is the Channel created`);
            const message = MessageFactory.attachment(card);
            await context.sendActivity(message);
            await next();
        });

        this.onTeamsChannelDeletedEvent(async (channelInfo: ChannelInfo, teamInfo: TeamInfo, context: TurnContext, next: () => Promise<void>): Promise<void> => {
            const card = CardFactory.heroCard('Channel Deleted', `${channelInfo.name} is the Channel deleted`);
            const message = MessageFactory.attachment(card);
            await context.sendActivity(message);
            await next();
        });

        this.onTeamsTeamRenamedEvent(async (teamInfo: TeamInfo, context: TurnContext, next: () => Promise<void>): Promise<void> => {
            const card = CardFactory.heroCard('Team Renamed', `${teamInfo.name} is the new Team name`);
            const message = MessageFactory.attachment(card);
            await context.sendActivity(message);
            await next();
        });

        this.onTeamsMembersAddedEvent(async (membersAdded: ChannelAccount[], teamInfo: TeamInfo, context: TurnContext, next: () => Promise<void>): Promise<void> => {
            var newMembers: string = '';
            console.log(JSON.stringify(membersAdded));
            membersAdded.forEach((account) => {
                newMembers.concat(account.id,' ');
            });
            const card = CardFactory.heroCard('Account Added', `${newMembers} joined ${teamInfo.name}.`);
            const message = MessageFactory.attachment(card);
            await context.sendActivity(message);
            await next();
        });

        this.onTeamsMembersRemovedEvent(async (membersRemoved: ChannelAccount[], teamInfo: TeamInfo, context: TurnContext, next: () => Promise<void>): Promise<void> => {
            var removedMembers: string = '';
            console.log(JSON.stringify(membersRemoved));
            membersRemoved.forEach((account) => {
                removedMembers += account.id + ' ';
            });
            const card = CardFactory.heroCard('Account Removed', `${removedMembers} removed from ${teamInfo.name}.`);
            const message = MessageFactory.attachment(card);
            await context.sendActivity(message);
            await next();
        });
        
        this.onMembersAdded(async (context: TurnContext, next: () => Promise<void>): Promise<void> => {
            var newMembers: string = '';
            context.activity.membersAdded.forEach((account) => {
                newMembers += account.id + ' ';
            });
            const card = CardFactory.heroCard('Member Added', `${newMembers} joined ${context.activity.conversation.conversationType}.`);
            const message = MessageFactory.attachment(card);
            await context.sendActivity(message);
            await next();
        });

        this.onMembersRemoved(async (context: TurnContext, next: () => Promise<void>): Promise<void> => {
            var removedMembers: string = '';
            context.activity.membersRemoved.forEach((account) => {
                removedMembers += account.id + ' ';
            });
            const card = CardFactory.heroCard('Member Removed', `${removedMembers} removed from ${context.activity.conversation.conversationType}.`);
            const message = MessageFactory.attachment(card);
            await context.sendActivity(message);
            await next();
        });
    }

    protected async handleTeamsMessagingExtensionFetchTask(context: TurnContext, action: MessagingExtensionAction): Promise<MessagingExtensionActionResponse> {
        const response = AdaptiveCardHelper.createTaskModuleAdaptiveCardResponse();
        return response;
    }

    protected async handleTeamsMessagingExtensionSubmitAction(context: TurnContext, action: MessagingExtensionAction): Promise<MessagingExtensionActionResponse> {
        const submittedData = action.data as SubmitExampleData;
        const adaptiveCard = AdaptiveCardHelper.toAdaptiveCardAttachment(submittedData);
        const response = CardResponseHelpers.toMessagingExtensionBotMessagePreviewResponse(adaptiveCard);
        return response;    
    }

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

    protected async handleTeamsMessagingExtensionBotMessagePreviewSend(context: TurnContext, action: MessagingExtensionAction): Promise<MessagingExtensionActionResponse> {
        const submitData: SubmitExampleData = AdaptiveCardHelper.toSubmitExampleData(action);
        const adaptiveCard: Attachment = AdaptiveCardHelper.toAdaptiveCardAttachment(submitData);

        const responseActivity = {type: 'message', attachments: [adaptiveCard] } as Activity;

        try {
            // Send to channel where messaging extension invoked.
            let results = await teamsCreateConversation(context, context.activity.channelData.channel.id, responseActivity);
        } catch(ex) {
            console.error('ERROR Sending to Channel:');
        }

        try {
            // Send card to "General" channel.
            const teamDetails: TeamDetails = await TeamsInfo.getTeamDetails(context);
            let results = await teamsCreateConversation(context, teamDetails.id, responseActivity);
        } catch(ex) {
            console.error('ERROR Sending to General channel:' + JSON.stringify(ex));
        }

        // Send card to compose box for the current user.
        const response = CardResponseHelpers.toComposeExtensionResultResponse(adaptiveCard);
        return response;
    }

    protected async handleTeamsMessagingExtensionCardButtonClicked(context: TurnContext, obj) {
        const reply = MessageFactory.text('onTeamsMessagingExtensionCardButtonClicked Value: ' + JSON.stringify(context.activity.value));
        await context.sendActivity(reply);
    }

    protected async handleTeamsFileConsentAccept(context: TurnContext, fileConsentCardResponse: FileConsentCardResponse): Promise<void> {
        try {
            await this.sendFile(fileConsentCardResponse);
            await this.fileUploadCompleted(context, fileConsentCardResponse);
        }
        catch (err) {
            await this.fileUploadFailed(context, err.toString());
        }
    }

    protected async handleTeamsFileConsentDecline(context: TurnContext, fileConsentCardResponse: FileConsentCardResponse): Promise<void> {
        let reply =  this.createReply(context.activity);
        reply.textFormat = "xml";
        reply.text = `Declined. We won't upload file <b>${fileConsentCardResponse.context["filename"]}</b>.`;
        await context.sendActivity(reply);
    } 
    
    protected async handleTeamsTaskModuleFetch(context: TurnContext, taskModuleRequest: TaskModuleRequest): Promise<TaskModuleResponse> {
        var reply = MessageFactory.text("handleTeamsTaskModuleFetchAsync TaskModuleRequest" + JSON.stringify(taskModuleRequest));
        await context.sendActivity(reply);

        return {
            task: { 
                type: "continue", 
                value: {
                    card: this.getTaskModuleAdaptiveCard(),
                    height: 200,
                    width: 400,
                    title: "Adaptive Card: Inputs",
                } as TaskModuleTaskInfo, 
            } as TaskModuleContinueResponse
        } as TaskModuleResponse;
    }

    protected async handleTeamsTaskModuleSubmit(context: TurnContext, taskModuleRequest: TaskModuleRequest): Promise<TaskModuleResponse> {
        var reply = MessageFactory.text("handleTeamsTaskModuleFetchAsync Value: " + JSON.stringify(taskModuleRequest));
        await context.sendActivity(reply);

        return {
            task: { 
                type: "message", 
                value: "Thanks!", 
            } as TaskModuleMessageResponse
        } as TaskModuleResponse;
    }

    protected async handleTeamsCardActionInvoke(context: TurnContext): Promise<InvokeResponse> {
        await context.sendActivity(MessageFactory.text(`handleTeamsCardActionInvoke value: ${JSON.stringify(context.activity.value)}`));
        return { status: 200 } as InvokeResponse;
    }

    private async handleNonEmptyMessage(text, context, next) : Promise<void> {
        if (text === 'delete') {
            for (const activityId of this.activityIds) {
                await context.deleteActivity(activityId);
            }

            this.activityIds = [];
        } 
        else {
            let reply: Partial<Activity>;
            switch (text.toLowerCase()) {
                case '1':
                    await this.sendAdaptiveCard1(context);
                    break;

                case '2':
                    await this.sendAdaptiveCard2(context);
                    break;

                case '3':
                    await this.sendAdaptiveCard3(context);
                    break;

                case IntegrationBot.HeroCard.toLowerCase():
                    reply = MessageFactory.attachment(this.getHeroCard());
                    break;
                case IntegrationBot.ThumbnailCard.toLowerCase():
                    reply = MessageFactory.attachment(this.getThumbnailCard());
                    break;
                case IntegrationBot.ReceiptCard.toLowerCase():
                    reply = MessageFactory.attachment(this.getReceiptCard());
                    break;
                case IntegrationBot.SigninCard.toLowerCase():
                    reply = MessageFactory.attachment(this.getSigninCard());
                    break;
                case IntegrationBot.Carousel.toLowerCase():
                    // NOTE: if cards are NOT the same height in a carousel, Teams will instead display as AttachmentLayoutTypes.List
                    reply = MessageFactory.carousel([this.getHeroCard(), this.getHeroCard(), this.getHeroCard()]);
                    break;
                case IntegrationBot.List.toLowerCase():
                    // NOTE: MessageFactory.Attachment with multiple attachments will default to AttachmentLayoutTypes.List
                    reply = MessageFactory.list([this.getHeroCard(), this.getHeroCard(), this.getHeroCard()]);
                    break;

                default:
                    await this.sendMessageAndLogActivityId(context, text);
                    for (const id of this.activityIds) {
                        await context.updateActivity({ id, text, type: ActivityTypes.Message });
                    }
            }
            
            if (reply) {
                await context.sendActivity(reply);
            }
        }      
    }

    private getTaskModuleHeroCard() : Attachment {
        return CardFactory.heroCard("Task Module Invocation from Hero Card", 
            "This is a hero card with a Task Module Action button.  Click the button to show an Adaptive Card within a Task Module.",
            null, // No images
            [{type: "invoke", title:"Adaptive Card", value: {type:"task/fetch", data:"adaptivecard"} }]
            );
    }

    private getTaskModuleAdaptiveCard(): Attachment {
        return CardFactory.adaptiveCard({
            version: '1.0.0',
            type: 'AdaptiveCard',
            body: [
                {
                    type: 'TextBlock',
                    text: `Enter Text Here`,
                },
                {
                    type: 'Input.Text',
                    id: 'usertext',
                    placeholder: 'add some text and submit',
                    IsMultiline: true,
                }
            ],
            actions: [
                {
                    type: 'Action.Submit',
                    title: 'Submit',
                }
            ]
        });
    }
    
    private async sendFile(fileConsentCardResponse: FileConsentCardResponse): Promise<void> {
        const request = require("request");
        const fs = require('fs');     
        let context = fileConsentCardResponse.context;
        let path = require('path');
        let filePath = path.join('files', context["filename"]);
        let stats = fs.statSync(filePath);
        let fileSizeInBytes = stats['size']; 
        fs.createReadStream(filePath).pipe(request.put(fileConsentCardResponse.uploadInfo.uploadUrl));
    }

    private async sendFileCard(context: TurnContext, filename: string, filesize: number): Promise<void> {
        let fileContext = {
            filename: filename
        };

        let attachment = {
            content: <FileConsentCard>{
                description: 'This is the file I want to send you',
                fileSizeInBytes: filesize,
                acceptContext: fileContext,
                declineContext: fileContext
            },
            contentType: 'application/vnd.microsoft.teams.card.file.consent',
            name: filename
        } as Attachment;

        var replyActivity = this.createReply(context.activity);
        replyActivity.attachments = [ attachment ];

        await context.sendActivity(replyActivity);
    }

    private async fileUploadCompleted(context: TurnContext, fileConsentCardResponse: FileConsentCardResponse): Promise<void> {
        let fileUploadInfoName = fileConsentCardResponse.uploadInfo.name;
        let downloadCard = <FileInfoCard>{
            uniqueId: fileConsentCardResponse.uploadInfo.uniqueId,
            fileType: fileConsentCardResponse.uploadInfo.fileType,
        };

        let attachment = <Attachment>{
            content: downloadCard,
            contentType: 'application/vnd.microsoft.teams.card.file.info',
            name: fileUploadInfoName,
            contentUrl: fileConsentCardResponse.uploadInfo.contentUrl,
        };

        let reply = this.createReply(context.activity, `<b>File uploaded.</b> Your file <b>${fileUploadInfoName}</b> is ready to download`);
        reply.textFormat = 'xml';
        reply.attachments = [attachment];
        await context.sendActivity(reply);
    }

    private async fileUploadFailed(context: TurnContext, error: string): Promise<void> {
        let reply = this.createReply(context.activity, `<b>File upload failed.</b> Error: <pre>${error}</pre>`);
        reply.textFormat = 'xml';
        await context.sendActivity(reply);
    }

    private createReply(activity, text = null, locale = null) : Activity {
        return {
            type: 'message',
            from: { id: activity.recipient.id, name: activity.recipient.name },
            recipient: { id: activity.from.id, name: activity.from.name },
            replyToId: activity.id,
            serviceUrl: activity.serviceUrl,
            channelId: activity.channelId,
            conversation: { isGroup: activity.conversation.isGroup, id: activity.conversation.id, name: activity.conversation.name },
            text: text || '',
            locale: locale || activity.locale
        } as Activity;
    } 

    private async sendMessageAndLogActivityId(context: TurnContext, text: string): Promise<void> {
        const resourceResponse = await context.sendActivity(`You said '${text}'`);
        await this.activityIds.push(resourceResponse.id);
    }

    private async sendAdaptiveCard1(context: TurnContext): Promise<void> {
        /* tslint:disable:quotemark object-literal-key-quotes */
        const card = CardFactory.adaptiveCard({
            "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
            "actions": [
                {
                    "data": {
                        "msteams": {
                            "type": "imBack",
                            "value": "text"
                        }
                    },
                    "title": "imBack",
                    "type": "Action.Submit"
                },
                {
                    "data": {
                        "msteams": {
                            "type": "messageBack",
                            "value": { "key": "value" }
                        }
                    },
                    "title": "message back",
                    "type": "Action.Submit"
                },
                {
                    "data": {
                        "msteams": {
                            "displayText": "display text message back",
                            "text": "text received by bots",
                            "type": "messageBack",
                            "value": { "key": "value" }
                        }
                    },
                    "title": "message back local echo",
                    "type": "Action.Submit"
                },
                {
                    "data": {
                        "msteams": {
                            "type": "invoke",
                            "value": { "key": "value" }
                        }
                    },
                    "title": "invoke",
                    "type": "Action.Submit"
                }
            ],
            "body": [
                {
                    "text": "Bot Builder actions",
                    "type": "TextBlock"
                }
            ],
            "type": "AdaptiveCard",
            "version": "1.0"
        });
        /* tslint:enable:quotemark object-literal-key-quotes */
        await context.sendActivity(MessageFactory.attachment(card));
    }

    private async sendAdaptiveCard2(context: TurnContext): Promise<void> {
        /* tslint:disable:quotemark object-literal-key-quotes */
        const card = CardFactory.adaptiveCard({
            "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
            "actions": [
                {
                    "data": {
                        "msteams": {
                            "type": "invoke",
                            "value": {
                                "hiddenKey": "hidden value from task module launcher",
                                "type": "task/fetch"
                            }
                        }
                    },
                    "title": "Launch Task Module",
                    "type": "Action.Submit"
                }
            ],
            "body": [
                {
                    "text": "Task Module Adaptive Card",
                    "type": "TextBlock"
                }
            ],
            "type": "AdaptiveCard",
            "version": "1.0"
        });
        /* tslint:enable:quotemark object-literal-key-quotes */
        await context.sendActivity(MessageFactory.attachment(card));
    }

    private async sendAdaptiveCard3(context: TurnContext): Promise<void> {
        /* tslint:disable:quotemark object-literal-key-quotes */
        const card = CardFactory.adaptiveCard({
            "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
            "actions": [
                {
                    "data": {
                        "key": "value"
                    },
                    "title": "Action.Submit",
                    "type": "Action.Submit"
                }
            ],
            "body": [
                {
                    "text": "Bot Builder actions",
                    "type": "TextBlock"
                },
                {
                    "id": "x",
                    "type": "Input.Text"
                }
            ],
            "type": "AdaptiveCard",
            "version": "1.0"
        });
        /* tslint:enable:quotemark object-literal-key-quotes */
        await context.sendActivity(MessageFactory.attachment(card));
    }

    private getHeroCard() {
        return CardFactory.heroCard('BotFramework Hero Card',
            'Build and connect intelligent bots to interact with your users naturally wherever they are,' +
            ' from text/sms to Skype, Slack, Office 365 mail and other popular services.',
            ['https://sec.ch9.ms/ch9/7ff5/e07cfef0-aa3b-40bb-9baa-7c9ef8ff7ff5/buildreactionbotframework_960.jpg'],
            [{ type: ActionTypes.OpenUrl, title: 'Get Started', value: 'https://docs.microsoft.com/bot-framework' }]);
    }

    private getThumbnailCard() {
        return CardFactory.thumbnailCard('BotFramework Thumbnail Card',
            'Build and connect intelligent bots to interact with your users naturally wherever they are,' +
            ' from text/sms to Skype, Slack, Office 365 mail and other popular services.',
            ['https://sec.ch9.ms/ch9/7ff5/e07cfef0-aa3b-40bb-9baa-7c9ef8ff7ff5/buildreactionbotframework_960.jpg'],
            [{ type: ActionTypes.OpenUrl, title: 'Get Started', value: 'https://docs.microsoft.com/bot-framework' }]);
    }

    private getReceiptCard() {
        return CardFactory.receiptCard({
            buttons: [
                {
                    image: 'https://account.windowsazure.com/content/6.10.1.38-.8225.160809-1618/aux-pre/images/offer-icon-freetrial.png',
                    title: 'More information',
                    type: ActionTypes.OpenUrl,
                    value: 'https://azure.microsoft.com/en-us/pricing/'
                }
            ],
            facts: [
                { key: 'Order Number', value: '1234' },
                { key: 'Payment Method', value: 'VISA 5555-****' }
            ],
            items: [
                {
                    image: { url: 'https://github.com/amido/azure-vector-icons/raw/master/renders/traffic-manager.png' },
                    price: '$ 38.45',
                    quantity: '368',
                    subtitle: '',
                    tap: { title: '', type: '', value: null },
                    text: '',
                    title: 'Data Transfer'
                },
                {
                    image: { url: 'https://github.com/amido/azure-vector-icons/raw/master/renders/cloud-service.png' },
                    price: '$ 45.00',
                    quantity: '720',
                    subtitle: '',
                    tap: { title: '', type: '', value: null },
                    text: '',
                    title: 'App Service'
                }
            ],
            tap: { title: '', type: '', value: null },
            tax: '$ 7.50',
            title: 'John Doe',
            total: '$ 90.95',
            vat: ''
        });
    }

    private getSigninCard() {
        return CardFactory.signinCard('BotFramework Sign-in Card', 'https://login.microsoftonline.com/', 'Sign-in');
    }

    private getChoices() {
        const actions = this.cardTypes.map((cardType) => ({ type: ActionTypes.MessageBack, title: cardType, text: cardType })) as CardAction[];
        return CardFactory.heroCard('Task Module Invocation from Hero Card', null, actions);
    }
}
