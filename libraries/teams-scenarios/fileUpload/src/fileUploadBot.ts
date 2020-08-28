// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import {
    Activity,
    Attachment,
    TeamsActivityHandler,
    TurnContext,
    FileInfoCard,
    FileConsentCard,
    FileConsentCardResponse
} from 'botbuilder';

export class FileUploadBot extends TeamsActivityHandler {
    constructor() {
        super();

        // See https://aka.ms/about-bot-activity-message to learn more about the message and other activity types.
        this.onMessage(async (context, next) => {
            await this.sendFileCard(context);
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
        const reply = this.createReply(context.activity);
        reply.textFormat = 'xml';
        reply.text = `Declined. We won't upload file <b>${ fileConsentCardResponse.context['filename'] }</b>.`;
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

    private async sendFile(fileConsentCardResponse: FileConsentCardResponse): Promise<void> {
        const request = require('request');
        const fs = require('fs');     
        const context = fileConsentCardResponse.context;
        const path = require('path');
        const filePath = path.join('files', context['filename']);
        const stats = fs.statSync(filePath);
        // const fileSizeInBytes = stats['size']; 
        fs.createReadStream(filePath).pipe(request.put(fileConsentCardResponse.uploadInfo.uploadUrl));
    }

    private async sendFileCard(context: TurnContext): Promise<void> {
        const filename = 'teams-logo.png';
        const fs = require('fs'); 
        const path = require('path');
        const stats = fs.statSync(path.join('files', filename));
        const fileSizeInBytes = stats['size'];    

        const fileContext = {
            filename: filename
        };

        const attachment = {
            content: <FileConsentCard>{
                description: 'This is the file I want to send you',
                fileSizeInBytes: fileSizeInBytes,
                acceptContext: fileContext,
                declineContext: fileContext
            },
            contentType: 'application/vnd.microsoft.teams.card.file.consent',
            name: filename
        } as Attachment;

        const replyActivity = this.createReply(context.activity);
        replyActivity.attachments = [ attachment ];
        await context.sendActivity(replyActivity);
    }

    private async fileUploadCompleted(context: TurnContext, fileConsentCardResponse: FileConsentCardResponse): Promise<void> {
        const fileUploadInfoName = fileConsentCardResponse.uploadInfo.name;
        const downloadCard = <FileInfoCard>{
            uniqueId: fileConsentCardResponse.uploadInfo.uniqueId,
            fileType: fileConsentCardResponse.uploadInfo.fileType,
        };

        const attachment = <Attachment>{
            content: downloadCard,
            contentType: 'application/vnd.microsoft.teams.card.file.info',
            name: fileUploadInfoName,
            contentUrl: fileConsentCardResponse.uploadInfo.contentUrl,
        };

        const reply = this.createReply(context.activity, `<b>File uploaded.</b> Your file <b>${ fileUploadInfoName }</b> is ready to download`);
        reply.textFormat = 'xml';
        reply.attachments = [attachment];
        await context.sendActivity(reply);
    }

    private async fileUploadFailed(context: TurnContext, error: string): Promise<void> {
        const reply = this.createReply(context.activity, `<b>File upload failed.</b> Error: <pre>${ error }</pre>`);
        reply.textFormat = 'xml';
        await context.sendActivity(reply);
    }
}
