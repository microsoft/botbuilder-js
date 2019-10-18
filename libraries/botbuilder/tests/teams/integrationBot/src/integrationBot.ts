// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import {
    Activity,
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
    TaskModuleResponseBase,
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
        if (submittedData) {
            const adaptiveCard = AdaptiveCardHelper.toAdaptiveCardAttachment(submittedData);
            const response = CardResponseHelpers.toMessagingExtensionBotMessagePreviewResponse(adaptiveCard);
            return response;    
        }
        else {
            return this.handleSubmitActionForFetch(context, action);
        }
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

    private async handleSubmitActionForFetch(context: TurnContext, action: MessagingExtensionAction): Promise<MessagingExtensionActionResponse> {
        const data = action.data;
        let body: MessagingExtensionActionResponse;
        if (data && data.done) {
            // The commandContext check doesn't need to be used in this scenario as the manifest specifies the shareMessage command only works in the "message" context.
            const sharedMessage = (action.commandId === 'shareMessage' && action.commandContext === 'message')
                ? `Shared message: <div style="background:#F0F0F0">${JSON.stringify(action.messagePayload)}</div><br/>`
                : '';
            const preview = CardFactory.thumbnailCard('Created Card', `Your input: ${data.userText}`);
            const heroCard = CardFactory.heroCard('Created Card', `${sharedMessage}Your input: <pre>${data.userText}</pre>`);
            body = {
                composeExtension: {
                    attachmentLayout: 'list',
                    attachments: [
                        { ...heroCard, preview }
                    ],
                    type: 'result'
                }
            };
        } else if (action.commandId === 'createWithPreview') {
            // The commandId is definied in the manifest of the Teams Application
            const activityPreview = {
                attachments: [
                    this.taskModuleResponseCard(action)
                ]
            } as Activity;

            body = {
                composeExtension: {
                    activityPreview,
                    type: 'botMessagePreview'
                }
            };
        } else {
            body = {
                task: this.taskModuleResponse(action, false)
            };
        }

        return body;
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

    private getCardFromPreviewMessage(query: MessagingExtensionAction): Attachment {
        const userEditActivities = query.botActivityPreview;
        return userEditActivities
            && userEditActivities[0]
            && userEditActivities[0].attachments
            && userEditActivities[0].attachments[0];
    }

    private taskModuleResponse(query: any, done: boolean): TaskModuleResponseBase {
        if (done) {
            return {
                type: 'message',
                value: 'Thanks for your inputs!'
            } as TaskModuleMessageResponse;
        } else {
            return {
                type: 'continue',
                value: {
                    card: this.taskModuleResponseCard(query, (query.data && query.data.userText) || undefined),
                    title: 'More Page'
                }
            } as TaskModuleContinueResponse;
        }
    }

    private taskModuleResponseCard(data: any, textValue?: string) {
        return CardFactory.adaptiveCard({
            actions: [
                {
                    data: {
                        done: false
                    },
                    title: 'Next',
                    type: 'Action.Submit'
                },
                {
                    data: {
                        done: true
                    },
                    title: 'Submit',
                    type: 'Action.Submit'
                }
            ],
            body: [
                {
                    size: 'large',
                    text: `Your request:`,
                    type: 'TextBlock',
                    weight: 'bolder'
                },
                {
                    items: [
                        {
                            text: JSON.stringify(data),
                            type: 'TextBlock',
                            wrap: true
                        }
                    ],
                    style: 'emphasis',
                    type: 'Container'
                },
                {
                    id: 'userText',
                    placeholder: 'Type text here...',
                    type: 'Input.Text',
                    value: textValue
                }
            ],
            type: 'AdaptiveCard',
            version: '1.0.0'
        });
    }
}
