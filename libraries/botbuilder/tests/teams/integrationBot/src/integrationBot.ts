// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import {
    Activity,
    ActivityTypes,
    Attachment,
    CardFactory,
    FileInfoCard,
    FileConsentCard,
    FileConsentCardResponse,
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
    TeamsInfo,
    TurnContext,
} from 'botbuilder';

import { AdaptiveCardHelper } from './adaptiveCardHelper';
import { CardResponseHelpers } from './cardResponseHelpers';
import { SubmitExampleData } from './submitExampleData';

export class IntegrationBot extends TeamsActivityHandler {
    protected activityIds: string[];

    /*
     * After installing this bot you will need to click on the 3 dots to pull up the extension menu to select the bot. Once you do you do
     * see the extension pop a task module.
     */
    constructor(activityIds: string[]) {
        super();
        this.activityIds = activityIds;

        // See https://aka.ms/about-bot-activity-message to learn more about the message and other activity types.
        this.onMessage(async (context, next) => {
            await context.sendActivity(`You said '${context.activity.text}'`);
            // By calling next() you ensure that the next BotHandler is run.
            await next();


            TurnContext.removeRecipientMention(context.activity);
            if (context.activity.text === 'delete') {
                for (const activityId of this.activityIds) {
                    await context.deleteActivity(activityId);
                }

                this.activityIds = [];
            } else {
                await this.sendMessageAndLogActivityId(context, `${context.activity.text}`);

                const text = context.activity.text;
                for (const id of this.activityIds) {
                    await context.updateActivity({ id, text, type: ActivityTypes.Message });
                }
            }

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

            // Send card to "General" channel.
            const teamDetails: TeamDetails = await TeamsInfo.getTeamDetails(context);
            results = await teamsCreateConversation(context, teamDetails.id, responseActivity);
        } catch {
            console.error('In group chat or personal scope.');
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
                value: "Hello", 
            } as TaskModuleMessageResponse
        } as TaskModuleResponse;
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
}
